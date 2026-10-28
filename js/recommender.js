/*
 * Content-based recommender.
 * Each book is a vector of tags weighted by rarity (IDF). A reader profile is built
 * from rated books: loved books pull the profile toward their tags, disliked books
 * push it away. Unread books are ranked by cosine similarity to that profile,
 * with a small boost for authors the reader rated highly.
 */
(function () {
  const RATING_WEIGHT = { 5: 2, 4: 1, 3: 0.25, 2: -1, 1: -2 };
  const UNRATED_READ_WEIGHT = 0.5;

  function buildIdf(books) {
    const counts = {};
    books.forEach(b => b.tags.forEach(t => (counts[t] = (counts[t] || 0) + 1)));
    const idf = {};
    Object.keys(counts).forEach(t => (idf[t] = Math.log(books.length / counts[t]) + 1));
    return idf;
  }

  function vectorOf(book, idf) {
    const v = {};
    book.tags.forEach(t => (v[t] = idf[t] || 1));
    return v;
  }

  const norm = v => Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));

  function cosine(a, b) {
    const na = norm(a), nb = norm(b);
    if (!na || !nb) return 0;
    let dot = 0;
    for (const k in b) if (a[k]) dot += a[k] * b[k];
    return dot / (na * nb);
  }

  function weightFor(entry) {
    return entry.rating ? RATING_WEIGHT[entry.rating] : UNRATED_READ_WEIGHT;
  }

  /**
   * @param {Array} allBooks   every book, listed or not
   * @param {Object} reads     { bookId: { rating: 1-5 | 0 } }
   * @param {Set} dismissed    ids the reader waved away
   * @param {number} count     how many to return
   */
  function recommend(allBooks, reads, dismissed, count = 3) {
    const idf = buildIdf(allBooks);
    const byId = Object.fromEntries(allBooks.map(b => [b.id, b]));
    const profile = {};
    const authorAffinity = {};
    const readBooks = [];

    Object.entries(reads).forEach(([id, entry]) => {
      const book = byId[id];
      if (!book) return;
      const w = weightFor(entry);
      readBooks.push({ book, entry, w });
      book.tags.forEach(t => (profile[t] = (profile[t] || 0) + w * (idf[t] || 1)));
      authorAffinity[book.author] = (authorAffinity[book.author] || 0) + w;
    });

    // Only positive preferences form the "taste" direction; negative tags act as a penalty.
    const likes = {}, dislikes = {};
    for (const t in profile) {
      if (profile[t] > 0) likes[t] = profile[t];
      else if (profile[t] < 0) dislikes[t] = -profile[t];
    }
    if (!Object.keys(likes).length) return { picks: [], reason: readBooks.length ? "no-likes" : "empty" };

    const scored = allBooks
      .filter(b => !reads[b.id] && !dismissed.has(b.id))
      .map(b => {
        const v = vectorOf(b, idf);
        let score = cosine(likes, v) - 0.6 * cosine(dislikes, v);
        const aff = authorAffinity[b.author] || 0;
        score += Math.max(-0.2, Math.min(0.2, aff * 0.06));
        if (b.rank) score += (1 - b.rank / 100) * 0.04; // gentle nudge toward the canon
        if (b.sources && b.sources.some(src => src.kind !== "goodreads")) score += 0.03; // award winners and classics
        return { book: b, score, v };
      })
      .sort((a, b) => b.score - a.score);

    // Diversify: one pick per author.
    const picks = [];
    const seenAuthors = new Set();
    for (const s of scored) {
      if (picks.length >= count) break;
      if (s.score <= 0) break;
      if (seenAuthors.has(s.book.author)) continue;
      seenAuthors.add(s.book.author);
      picks.push(explain(s, likes, readBooks, idf));
    }
    return { picks, reason: picks.length ? "ok" : "no-match" };
  }

  function explain(s, likes, readBooks, idf) {
    const sharedTags = s.book.tags
      .filter(t => likes[t])
      .sort((a, b) => likes[b] * idf[b] - likes[a] * idf[a])
      .slice(0, 3);

    // The loved book that most resembles this pick.
    let because = null, best = 0;
    readBooks
      .filter(r => r.w >= 1 || (!r.entry.rating && r.w > 0))
      .forEach(r => {
        const sim = cosine(vectorOf(r.book, idf), s.v);
        const tieBreak = (r.entry.rating || 3) / 100;
        if (sim + tieBreak > best) { best = sim + tieBreak; because = r; }
      });

    const match = Math.round(Math.max(0, Math.min(1, s.score)) * 100);
    return { book: s.book, score: s.score, match, sharedTags, because };
  }

  window.HorrorRecommender = { recommend };
})();
