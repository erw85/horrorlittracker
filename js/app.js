(function () {
  "use strict";

  const STORE_KEY = "crypt-ledger:v1";
  const TOP = window.HORROR_BOOKS;
  const ALL = [...TOP, ...window.HORROR_EXTRA];
  const BY_ID = Object.fromEntries(ALL.map(b => [b.id, b]));
  const SKULL = "☠︎";
  const RATING_WORDS = ["", "Dreadful", "Unsettling", "Haunting", "Terrifying", "Soul-shattering"];

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
      for (const [id, e] of Object.entries(s.reads || {})) {
        if (!BY_ID[id]) continue;
        const r = Number(e && e.rating) || 0;
        out.reads[id] = { rating: r >= 1 && r <= 5 ? Math.round(r) : 0 };
      }
      if (Array.isArray(s.dismissed)) out.dismissed = s.dismissed.filter(id => BY_ID[id]);
    }
    return out;
  }
  const persist = () => save(STORE_KEY, state);

  // ---------- elements ----------
  const $ = id => document.getElementById(id);
  const grid = $("grid"), tpl = $("card-template");
  const searchEl = $("search"), statusEl = $("filter-status"), tagEl = $("filter-tag"), sortEl = $("sort");

  const pretty = t => t.replace(/-/g, " ");

  // Tag filter options, most common first.
  const tagCounts = {};
  TOP.forEach(b => b.tags.forEach(t => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
  Object.keys(tagCounts).sort().forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = `${pretty(t)} (${tagCounts[t]})`;
    tagEl.appendChild(o);
  });

  // ---------- cards ----------
  const cards = new Map();

  function buildCard(book) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = book.id;
    node.querySelector(".rank").textContent = `№ ${book.rank}`;
    node.querySelector(".rank-ghost").textContent = book.rank;
    node.querySelector(".title").textContent = book.title;
    node.querySelector(".author").textContent = book.author;
    node.querySelector(".year").textContent = book.year;
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
      label.innerHTML = `<span aria-hidden="true">${SKULL}</span><span class="sr-only">${i} of 5</span>`;
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
    node.querySelector(".read-label").textContent = read ? "Survived" : "Mark as read";
    const fs = node.querySelector(".rating");
    fs.disabled = !read;
    fs.querySelectorAll("input").forEach(inp => (inp.checked = read && Number(inp.value) === entry.rating));
    fs.querySelector(".rating-clear").hidden = !(read && entry.rating);
  }

  const lastName = a => a.split("&")[0].trim().split(" ").pop();

  // ---------- catalogue rendering ----------
  TOP.forEach(b => grid.appendChild(buildCard(b)));
  TOP.forEach(b => syncCard(b.id));

  function applyFilters() {
    const q = searchEl.value.trim().toLowerCase();
    const status = statusEl.value, tag = tagEl.value, sort = sortEl.value;
    const visible = TOP.filter(b => {
      const read = !!state.reads[b.id];
      if (status === "read" && !read) return false;
      if (status === "unread" && read) return false;
      if (tag && !b.tags.includes(tag)) return false;
      if (q && !(`${b.title} ${b.author}`.toLowerCase().includes(q))) return false;
      return true;
    });
    const rating = b => (state.reads[b.id] && state.reads[b.id].rating) || 0;
    const sorters = {
      rank: (a, b) => a.rank - b.rank,
      title: (a, b) => a.title.replace(/^(The|A|An|')\s*/i, "").localeCompare(b.title.replace(/^(The|A|An|')\s*/i, "")),
      author: (a, b) => lastName(a.author).localeCompare(lastName(b.author)) || a.year - b.year,
      "year-asc": (a, b) => a.year - b.year,
      "year-desc": (a, b) => b.year - a.year,
      rating: (a, b) => rating(b) - rating(a) || a.rank - b.rank
    };
    visible.sort(sorters[sort]);
    const shown = new Set(visible.map(b => b.id));
    visible.forEach(b => grid.appendChild(cards.get(b.id)));
    cards.forEach((node, id) => (node.hidden = !shown.has(id)));
    $("count").textContent = visible.length === TOP.length
      ? "Showing all 100 tomes"
      : `Showing ${visible.length} of 100 tomes`;
  }

  [searchEl, statusEl, tagEl, sortEl].forEach(el => el.addEventListener("input", applyFilters));

  // ---------- stats ----------
  function renderStats() {
    const entries = Object.entries(state.reads).filter(([id]) => BY_ID[id] && BY_ID[id].pool === "top");
    const rated = entries.filter(([, e]) => e.rating);
    $("stat-read").textContent = entries.length;
    $("stat-rated").textContent = rated.length;
    $("stat-avg").textContent = rated.length
      ? (rated.reduce((s, [, e]) => s + e.rating, 0) / rated.length).toFixed(1) + " " + SKULL
      : "—";
    const tagScore = {};
    Object.entries(state.reads).forEach(([id, e]) => {
      if (!e.rating || e.rating < 4) return;
      BY_ID[id].tags.forEach(t => (tagScore[t] = (tagScore[t] || 0) + e.rating - 3));
    });
    const fav = Object.keys(tagScore).sort((a, b) => tagScore[b] - tagScore[a])[0];
    $("stat-fav").textContent = fav ? pretty(fav) : "—";
    $("progress").setAttribute("aria-valuenow", entries.length);
    $("progress-fill").style.width = `${entries.length}%`;
  }

  // ---------- recommendations ----------
  function renderRecs() {
    const recsEl = $("recs"), intro = $("oracle-intro");
    const { picks, reason } = window.HorrorRecommender.recommend(ALL, state.reads, new Set(state.dismissed), 3);
    recsEl.replaceChildren();

    const messages = {
      empty: "Mark the novels you have read and rate them. The oracle will study your tastes and summon what you should read next.",
      "no-likes": "The oracle senses only disdain. Rate a book you enjoyed (three skulls or more) and it will find you kindred horrors.",
      "no-match": "You have exhausted every tome the oracle knows. Restore dismissed books from the button below to see them again.",
      ok: `Drawn from your ${Object.keys(state.reads).length} read ${Object.keys(state.reads).length === 1 ? "tome" : "tomes"}. Rate more to sharpen the vision.`
    };
    intro.textContent = messages[reason];

    picks.forEach(p => recsEl.appendChild(buildRec(p)));

    if (state.dismissed.length) {
      const restore = document.createElement("button");
      restore.type = "button";
      restore.className = "btn btn-ghost restore";
      restore.textContent = `Restore ${state.dismissed.length} dismissed`;
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
      ? `Because you ${p.because.entry.rating ? `gave <em>${esc(p.because.book.title)}</em> ${p.because.entry.rating} ${SKULL}` : `read <em>${esc(p.because.book.title)}</em>`}.`
      : "";
    el.innerHTML = `
      <div class="rec-body">
        <p class="rec-source">${b.rank ? `№ ${b.rank} of the Hundred` : "A deeper cut, beyond the Hundred"}</p>
        <h3>${esc(b.title)}</h3>
        <p class="author">${esc(b.author)} <span class="year">· ${b.year}</span></p>
        <div class="match" aria-label="${p.match}% kinship with your tastes"><span style="width:${p.match}%"></span></div>
        <p class="match-label">${p.match}% kinship</p>
        <p class="why">${p.sharedTags.length ? `Steeped in ${p.sharedTags.map(t => `<strong>${esc(pretty(t))}</strong>`).join(", ")}. ` : ""}${because}</p>
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
      toast(b.pool === "top" ? `Marked “${b.title}” as read — rate it in the Hundred below.` : `Marked “${b.title}” as read.`);
      if (b.pool === "top") {
        statusEl.value = "all"; tagEl.value = ""; searchEl.value = "";
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
    const blob = new Blob([JSON.stringify({ app: "crypt-ledger", version: 1, ...state }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "crypt-ledger.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("import").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    file.text().then(txt => {
      state = sanitize(JSON.parse(txt));
      persist();
      TOP.forEach(b => syncCard(b.id));
      refresh();
      toast("Ledger restored from the grimoire.");
    }).catch(() => toast("That file is not a ledger the oracle can read."))
      .finally(() => (e.target.value = ""));
  });

  $("reset").addEventListener("click", () => {
    if (!confirm("Burn your ledger? Every mark and rating will be lost.")) return;
    state = { reads: {}, dismissed: [] };
    persist();
    TOP.forEach(b => syncCard(b.id));
    refresh();
    toast("The ledger is ash.");
  });

  function refresh() {
    renderStats();
    renderRecs();
    applyFilters();
  }

  refresh();
})();
