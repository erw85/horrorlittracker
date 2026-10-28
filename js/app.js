(function () {
  "use strict";

  const STORE_KEY = "crypt-ledger:v1";
  const ALL = window.HORROR_ALL;
  const LEGACY = window.HORROR_LEGACY_IDS || {};
  const CATALOGUE = ALL.filter(b => b.listed);   // what the page lists; extras only feed recommendations
  const TOTAL = CATALOGUE.length;
  const BY_ID = Object.fromEntries(ALL.map(b => [b.id, b]));

  const AWARD_KINDS = ["stoker", "stoker-first", "jackson", "choice"];
  const SOURCE_INFO = {
    stoker: { label: y => `🏆 Stoker Award ${y}`, long: y => `Won the Bram Stoker Award for best novel (${y})` },
    "stoker-first": { label: y => `🏆 Stoker First Novel ${y}`, long: y => `Won the Bram Stoker Award for best first novel (${y})` },
    jackson: { label: y => `🏆 Shirley Jackson Award ${y}`, long: y => `Won the Shirley Jackson Award for best novel (${y})` },
    choice: { label: y => `🗳️ Goodreads Choice ${y}`, long: y => `Won the Goodreads Choice Award for horror (${y})` },
    canon: { label: () => "📜 Classic canon", long: () => "A landmark of the genre's classic canon" }
  };
  const extraSources = b => b.sources.filter(s => s.kind !== "goodreads");
  const isAwarded = b => b.sources.some(s => AWARD_KINDS.includes(s.kind));
  const PUMPKIN = "🎃";
  const RATING_WORDS = ["", "Snooze", "Mildly creepy", "Spooky", "Scary good", "Screamed out loud"];

  // ---------- storage (always guarded: private mode can throw) ----------
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  // Covers were dropped; clear any cached lookups older versions left behind.
  try { ["crypt-ledger:covers:v1", "crypt-ledger:covers:v2"].forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ }

  let state = sanitize(load(STORE_KEY, null));
  function sanitize(s) {
    const out = { reads: {}, dismissed: [] };
    if (s && typeof s === "object") {
      for (const [rawId, e] of Object.entries(s.reads || {})) {
        const id = LEGACY[rawId] || rawId;   // ids from earlier versions
        if (!BY_ID[id]) continue;
        const r = Number(e && e.rating) || 0;
        out.reads[id] = { rating: r >= 1 && r <= 5 ? Math.round(r) : 0 };
      }
      if (Array.isArray(s.dismissed)) out.dismissed = s.dismissed.map(id => LEGACY[id] || id).filter(id => BY_ID[id]);
    }
    return out;
  }
  const persist = () => save(STORE_KEY, state);

  // ---------- elements ----------
  const $ = id => document.getElementById(id);
  const grid = $("grid"), tpl = $("card-template");
  const searchEl = $("search"), statusEl = $("filter-status"), tagEl = $("filter-tag"), sortEl = $("sort");
  const sourceEl = $("filter-source");

  // Counts in the page copy follow the size of the list.
  document.querySelectorAll("[data-total]").forEach(el => (el.textContent = TOTAL));

  const pretty = t => t.replace(/-/g, " ");

  // Tag filter options, most common first.
  const tagCounts = {};
  CATALOGUE.forEach(b => b.tags.forEach(t => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
  Object.keys(tagCounts).sort().forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = `${pretty(t)} (${tagCounts[t]})`;
    tagEl.appendChild(o);
  });

  // ---------- cards ----------
  function setText(root, sel, text) {
    const el = root.querySelector(sel);
    if (el) el.textContent = text;
  }
  const cards = new Map();

  function buildCard(book) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = book.id;
    const rankEl = node.querySelector(".rank");
    if (rankEl) {
      if (book.rank) {
        rankEl.textContent = `#${book.rank}`;
        rankEl.title = `#${book.rank} on Goodreads' Best Horror Novels list`;
      } else rankEl.remove();
    }
    setText(node, ".rank-ghost", book.rank || "");
    const grEl = node.querySelector(".gr-rating");
    if (grEl) {
      if (book.gr) {
        grEl.textContent = `★ ${book.gr.avg.toFixed(2)}`;
        grEl.title = `${book.gr.avg.toFixed(2)} average from ${book.gr.ratings.toLocaleString()} Goodreads ratings`;
      } else grEl.remove();
    }
    const badges = node.querySelector(".badges");
    if (badges) {
      extraSources(book).forEach(src => {
        const li = document.createElement("li");
        li.className = `badge badge-${src.kind}`;
        li.textContent = SOURCE_INFO[src.kind].label(src.year);
        li.title = SOURCE_INFO[src.kind].long(src.year);
        badges.appendChild(li);
      });
      if (!badges.children.length) badges.remove();
    }
    setText(node, ".title", book.title);
    setText(node, ".author", book.author);
    setText(node, ".year", book.year);
    const tags = node.querySelector(".tags");
    book.tags.forEach(t => {
      const li = document.createElement("li");
      li.textContent = pretty(t);
      tags.appendChild(li);
    });

    const box = node.querySelector(".read-box");
    box.id = `read-${book.id}`;
    box.setAttribute("aria-label", `Mark ${book.title} as read`);
    box.addEventListener("change", () => {
      if (box.checked) state.reads[book.id] = state.reads[book.id] || { rating: 0 };
      else delete state.reads[book.id];
      persist();
      syncCard(book.id);
      refresh();
    });

    const fs = node.querySelector(".rating");
    for (let i = 5; i >= 1; i--) {   // reversed in DOM so CSS sibling hover fills leftward
      const id = `r-${book.id}-${i}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `rate-${book.id}`;
      input.value = i;
      input.id = id;
      const label = document.createElement("label");
      label.htmlFor = id;
      label.title = `${i} — ${RATING_WORDS[i]}`;
      label.innerHTML = `<span aria-hidden="true">${PUMPKIN}</span><span class="sr-only">${i} of 5</span>`;
      input.addEventListener("change", () => {
        state.reads[book.id] = { rating: i };
        persist();
        syncCard(book.id);
        refresh();
      });
      fs.append(input, label);
    }
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "rating-clear";
    clear.textContent = "clear";
    clear.addEventListener("click", () => {
      if (state.reads[book.id]) state.reads[book.id].rating = 0;
      persist(); syncCard(book.id); refresh();
    });
    fs.append(clear);

    cards.set(book.id, node);
    return node;
  }

  function syncCard(id) {
    const node = cards.get(id);
    if (!node) return;
    const entry = state.reads[id];
    const read = !!entry;
    node.classList.toggle("is-read", read);
    node.querySelector(".read-box").checked = read;
    node.querySelector(".read-label").textContent = read ? "Survived!" : "Mark as read";
    const fs = node.querySelector(".rating");
    fs.disabled = !read;
    fs.querySelectorAll("input").forEach(inp => (inp.checked = read && Number(inp.value) === entry.rating));
    fs.querySelector(".rating-clear").hidden = !(read && entry.rating);
  }

  const lastName = a => a.split("&")[0].trim().split(" ").pop();

  // ---------- catalogue rendering ----------
  try {
    CATALOGUE.forEach(b => grid.appendChild(buildCard(b)));
    CATALOGUE.forEach(b => syncCard(b.id));
  } catch (err) {
    $("load-error").hidden = false;
    throw err;
  }

  function applyFilters() {
    const q = searchEl.value.trim().toLowerCase();
    const status = statusEl.value, tag = tagEl.value, sort = sortEl.value, source = sourceEl.value;
    const visible = CATALOGUE.filter(b => {
      const read = !!state.reads[b.id];
      if (status === "read" && !read) return false;
      if (status === "unread" && read) return false;
      if (tag && !b.tags.includes(tag)) return false;
      if (source === "awards" && !isAwarded(b)) return false;
      if (source === "stoker" && !b.sources.some(s => s.kind.startsWith("stoker"))) return false;
      if (["goodreads", "jackson", "choice", "canon"].includes(source) && !b.sources.some(s => s.kind === source)) return false;
      if (q && !(`${b.title} ${b.author}`.toLowerCase().includes(q))) return false;
      return true;
    });
    const rating = b => (state.reads[b.id] && state.reads[b.id].rating) || 0;
    const sorters = {
      rank: (a, b) => (a.rank || 1e3) - (b.rank || 1e3) || a.year - b.year,
      title: (a, b) => a.title.replace(/^(The|A|An|')\s*/i, "").localeCompare(b.title.replace(/^(The|A|An|')\s*/i, "")),
      author: (a, b) => lastName(a.author).localeCompare(lastName(b.author)) || a.year - b.year,
      "year-asc": (a, b) => a.year - b.year,
      "year-desc": (a, b) => b.year - a.year,
      rating: (a, b) => rating(b) - rating(a) || (a.rank || 1e3) - (b.rank || 1e3)
    };
    visible.sort(sorters[sort]);
    const shown = new Set(visible.map(b => b.id));
    visible.forEach(b => grid.appendChild(cards.get(b.id)));
    cards.forEach((node, id) => (node.hidden = !shown.has(id)));
    $("count").textContent = visible.length === TOTAL
      ? `Showing all ${TOTAL} books`
      : `Showing ${visible.length} of ${TOTAL} books`;
  }

  [searchEl, statusEl, tagEl, sortEl, sourceEl].forEach(el => el.addEventListener("input", applyFilters));

  // ---------- stats ----------
  function renderStats() {
    const entries = Object.entries(state.reads).filter(([id]) => BY_ID[id] && BY_ID[id].listed);
    const rated = entries.filter(([, e]) => e.rating);
    $("stat-read").textContent = entries.length;
    $("stat-rated").textContent = rated.length;
    $("stat-avg").textContent = rated.length
      ? (rated.reduce((s, [, e]) => s + e.rating, 0) / rated.length).toFixed(1) + " " + PUMPKIN
      : "—";
    const tagScore = {};
    Object.entries(state.reads).forEach(([id, e]) => {
      if (!e.rating || e.rating < 4) return;
      BY_ID[id].tags.forEach(t => (tagScore[t] = (tagScore[t] || 0) + e.rating - 3));
    });
    const fav = Object.keys(tagScore).sort((a, b) => tagScore[b] - tagScore[a])[0];
    $("stat-fav").textContent = fav ? pretty(fav) : "—";
    $("progress").setAttribute("aria-valuenow", entries.length);
    $("progress").setAttribute("aria-valuemax", TOTAL);
    $("progress-fill").style.width = `${(entries.length / TOTAL) * 100}%`;
  }

  // ---------- recommendations ----------
  function renderRecs() {
    const recsEl = $("recs"), intro = $("oracle-intro");
    const { picks, reason } = window.HorrorRecommender.recommend(ALL, state.reads, new Set(state.dismissed), 3);
    recsEl.replaceChildren();

    const messages = {
      empty: "Mark the books you've read and rate them. The crystal ball will peek at your tastes and conjure up what to read next.",
      "no-likes": "Yikes, nothing you've rated was a hit! Give a book you liked 3 pumpkins or more and the crystal ball will find you more like it.",
      "no-match": "You've read everything the crystal ball knows about! Bring back the books you skipped with the button below.",
      ok: `Based on the ${Object.keys(state.reads).length} ${Object.keys(state.reads).length === 1 ? "book" : "books"} you've survived. Rate more for sharper picks.`
    };
    intro.textContent = messages[reason];

    picks.forEach(p => recsEl.appendChild(buildRec(p)));

    if (state.dismissed.length) {
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "btn btn-ghost restore";
      restore.textContent = `Bring back ${state.dismissed.length} skipped`;
      restore.addEventListener("click", () => { state.dismissed = []; persist(); refresh(); });
      recsEl.appendChild(restore);
    }
  }

  function buildRec(p) {
    const b = p.book;
    const el = document.createElement("article");
    el.className = "rec";
    el.dataset.id = b.id;
    const because = p.because
      ? `Because you ${p.because.entry.rating ? `gave <em>${esc(p.because.book.title)}</em> ${p.because.entry.rating} ${PUMPKIN}` : `read <em>${esc(p.because.book.title)}</em>`}.`
      : "";
    el.innerHTML = `
      <div class="rec-body">
        <p class="rec-source">${esc(recSource(b))}</p>
        <h3>${esc(b.title)}</h3>
        <p class="author">${esc(b.author)} <span class="year">· ${b.year}</span></p>
        <div class="match" aria-label="${p.match}% spooky match with your tastes"><span style="width:${p.match}%"></span></div>
        <p class="match-label">${p.match}% spooky match</p>
        <p class="why">${p.sharedTags.length ? `Packed with ${p.sharedTags.map(t => `<strong>${esc(pretty(t))}</strong>`).join(", ")}. ` : ""}${because}</p>
        <div class="rec-actions">
          <button type="button" class="btn btn-small" data-act="read">I've read it</button>
          <button type="button" class="btn btn-small btn-ghost" data-act="dismiss">Not for me</button>
        </div>
      </div>`;
    el.querySelector('[data-act="read"]').addEventListener("click", () => {
      state.reads[b.id] = { rating: 0 };
      persist();
      syncCard(b.id);
      refresh();
      toast(b.listed ? `Marked “${b.title}” as read — rate it in the list below.` : `Marked “${b.title}” as read.`);
      if (b.listed) {
        statusEl.value = "all"; tagEl.value = ""; searchEl.value = ""; sourceEl.value = "all";
        applyFilters();
        const card = cards.get(b.id);
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("flash");
        setTimeout(() => card.classList.remove("flash"), 1600);
      }
    });
    el.querySelector('[data-act="dismiss"]').addEventListener("click", () => {
      state.dismissed.push(b.id);
      persist();
      refresh();
    });
    return el;
  }

  function recSource(b) {
    if (b.rank) return `#${b.rank} in the Spooky Hundred`;
    const src = b.sources.find(s => AWARD_KINDS.includes(s.kind)) || b.sources[0];
    return src ? SOURCE_INFO[src.kind].label(src.year) : "Bonus pick from beyond the list";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  // ---------- grimoire: export / import / reset ----------
  $("export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ app: "to-dread-list", version: 1, ...state }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "to-dread-list.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("import").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => {
      state = sanitize(JSON.parse(txt));
      persist();
      CATALOGUE.forEach(b => syncCard(b.id));
      refresh();
      toast("It's alive! Your progress is back.");
    }).catch(() => toast("Hmm, that file isn't a To-Dread List save."))
      .finally(() => (e.target.value = ""));
  });

  $("reset").addEventListener("click", () => {
    if (!confirm("Bury all your progress? Every check and rating will be gone for good.")) return;
    state = { reads: {}, dismissed: [] };
    persist();
    CATALOGUE.forEach(b => syncCard(b.id));
    refresh();
    toast("Buried. Rest in peace, reading list. 🪦");
  });

  function refresh() {
    renderStats();
    renderRecs();
    applyFilters();
  }

  refresh();
})();
