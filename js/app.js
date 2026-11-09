(function () {
  "use strict";

  var DICT = window.KONJO_DICT;
  var STORE_KEY = "passapu.v1";

  // Laporan kata baru dikirim ke email admin lewat FormSubmit (formsubmit.co, tanpa server).
  // Laporan pertama memicu email aktivasi; setelah aktif, ganti alamat email di URL ini dengan
  // kode acak dari FormSubmit agar alamat email tidak terlihat di kode website.
  var REPORT_URL = "https://formsubmit.co/ajax/105841103923@student.unismuh.ac.id";
  var REPORT_MAX_WORDS = 10;
  var REPORT_TIMEOUT_MS = 15000;
  var REPORT_KEPT = 200;

  var norm = function (s) {
    return s.toLowerCase().replace(/['’‘`´]/g, "").replace(/\s+/g, " ").trim();
  };
  var isWord = function (t) { return /^[\p{L}]/u.test(t); };

  // Tabel pencarian per arah: kj-id (Konjo ke Indonesia) dan id-kj (kebalikannya).
  function makeDir(from, to) {
    var map = new Map(), max = 1, seenPhrase = new Set();
    var span = function (s) { return s.trim().split(/\s+/).length; };
    DICT.words.forEach(function (e) {
      var key = norm(e[from]);
      if (!map.has(key)) map.set(key, e[to]);
      max = Math.max(max, span(e[from]));
    });
    DICT.phrases.forEach(function (e) {
      var key = norm(e[from]);
      if (!seenPhrase.has(key)) { seenPhrase.add(key); map.set(key, e[to]); }
      max = Math.max(max, span(e[from]));
    });
    return { map: map, max: max };
  }
  var DIRS = { "kj-id": makeDir("k", "i"), "id-kj": makeDir("i", "k") };
  var LABELS = {
    "kj-id": {
      from: "Konjo", avatar: "K", tag: "KJ \u2192 ID", panel: "TEKS KONJO",
      placeholder: "Contoh: Apa kareba? Nakke lampa ri bola.",
      route: "Konjo ke Indonesia", note: "Artinya dalam bahasa Indonesia (opsional)"
    },
    "id-kj": {
      from: "Indonesia", avatar: "I", tag: "ID \u2192 KJ", panel: "TEKS INDONESIA",
      placeholder: "Contoh: Apa kabar? Saya makan ikan.",
      route: "Indonesia ke Konjo", note: "Padanan dalam bahasa Konjo (opsional)"
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    input: $("inputText"), result: $("resultBox"), breakdown: $("breakdown"),
    history: $("history"), bars: $("bars"),
    btnTranslate: $("btnTranslate"), btnCopy: $("btnCopy"),
    btnSample: $("btnSample"), btnClear: $("btnClear"),
    report: $("reportBox"), reportTitle: $("reportTitle"), reportWords: $("reportWords"),
    reportForm: $("reportForm"), reportNoteLabel: $("reportNoteLabel"), reportNote: $("reportNote"),
    btnReport: $("btnReport"), reportStatus: $("reportStatus")
  };

  var state = loadState();
  var lastOutput = "";
  var sampleIndex = 0;
  var dir = "kj-id";
  var reportBusy = false;

  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && Array.isArray(s.history)) {
        if (!Array.isArray(s.reported)) s.reported = [];
        return s;
      }
    } catch (e) { /* abaikan */ }
    return { count: 0, rate: 0, history: [], reported: [] };
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
  }

  // Ambil n kata berurutan mulai dari indeks i (hanya dipisah spasi).
  function collect(tokens, i, n) {
    var words = [], j = i;
    while (j < tokens.length && words.length < n) {
      var t = tokens[j];
      if (isWord(t)) words.push(t);
      else if (!/^\s+$/.test(t) || words.length === 0) break;
      j++;
    }
    return words.length === n ? { words: words, end: j } : null;
  }

  function matchCase(src, dst) {
    var first = src.charAt(0);
    if (first && first !== first.toLowerCase()) return dst.charAt(0).toUpperCase() + dst.slice(1);
    return dst;
  }

  function translate(text, direction) {
    var table = DIRS[direction || dir];
    var tokens = text.match(/[\p{L}'’‘`´-]+|\s+|[^\s\p{L}]/gu) || [];
    var parts = [], pairs = new Map(), known = 0, unknown = 0, i = 0;

    while (i < tokens.length) {
      var t = tokens[i];
      if (!isWord(t)) { parts.push({ text: t }); i++; continue; }

      var hit = null;
      for (var n = table.max; n >= 1 && !hit; n--) {
        var span = collect(tokens, i, n);
        if (!span) continue;
        var src = span.words.join(" ");
        var dst = table.map.get(norm(src));
        if (dst !== undefined) hit = { end: span.end, src: src, dst: dst };
      }
      if (hit) {
        parts.push({ text: matchCase(hit.src, hit.dst) });
        known++;
        pairs.set(norm(hit.src), { src: hit.src, dst: hit.dst, ok: true });
        i = hit.end;
      } else {
        parts.push({ text: t, unknown: true });
        unknown++;
        pairs.set(norm(t), { src: t, dst: "tidak ditemukan", ok: false });
        i++;
      }
    }
    return { parts: parts, pairs: Array.from(pairs.values()), known: known, unknown: unknown };
  }

  function renderResult(r, hasText) {
    el.result.textContent = "";
    if (!hasText) {
      var empty = document.createElement("p");
      empty.className = "result__empty";
      empty.textContent = "Terjemahan akan muncul di sini.";
      el.result.appendChild(empty);
      return;
    }
    r.parts.forEach(function (p) {
      if (p.unknown) {
        var s = document.createElement("span");
        s.className = "unk";
        s.title = "Kata belum ada di kamus";
        s.textContent = p.text;
        el.result.appendChild(s);
      } else {
        el.result.appendChild(document.createTextNode(p.text));
      }
    });
  }

  function makeRow(avatarText, title, sub, side, cls) {
    var li = document.createElement("li");
    var av = document.createElement("span");
    av.className = "avatar" + (cls ? " " + cls : "");
    av.textContent = avatarText;
    var main = document.createElement("div");
    main.className = "row__main";
    var strong = document.createElement("strong");
    strong.textContent = title;
    var span = document.createElement("span");
    span.textContent = sub;
    main.appendChild(strong);
    main.appendChild(span);
    li.appendChild(av);
    li.appendChild(main);
    if (side) {
      var sd = document.createElement("span");
      sd.className = "row__side" + (side.bad ? " row__side--bad" : "");
      sd.textContent = side.text;
      li.appendChild(sd);
    }
    return li;
  }

  function emptyItem(text) {
    var li = document.createElement("li");
    li.className = "list__empty";
    li.textContent = text;
    return li;
  }

  function renderBreakdown(pairs) {
    el.breakdown.textContent = "";
    if (!pairs.length) { el.breakdown.appendChild(emptyItem("Belum ada kata.")); return; }
    pairs.forEach(function (p) {
      el.breakdown.appendChild(
        makeRow(p.src.charAt(0).toUpperCase(), p.src, LABELS[dir].from,
          { text: p.dst, bad: !p.ok }, p.ok ? "avatar--ok" : "")
      );
    });
  }

  function renderHistory() {
    el.history.textContent = "";
    if (!state.history.length) { el.history.appendChild(emptyItem("Belum ada riwayat.")); return; }
    state.history.forEach(function (h) {
      var hDir = h.dir || "kj-id";
      var row = makeRow(LABELS[hDir].avatar, h.src, h.dst, null, "");
      row.addEventListener("click", function () {
        el.input.value = h.src;
        showPane("pane-translate");
        setDir(hDir);
        el.input.focus();
      });
      el.history.appendChild(row);
    });
  }

  function renderBars() {
    var counts = DICT.categories.map(function (c) {
      return { name: c, n: DICT.words.filter(function (w) { return w.c === c; }).length };
    });
    var max = Math.max.apply(null, counts.map(function (c) { return c.n; }));
    el.bars.textContent = "";
    counts.forEach(function (c) {
      var bar = document.createElement("div");
      bar.className = "bar" + (c.n === max ? " bar--top" : "");
      var val = document.createElement("span");
      val.className = "bar__value";
      val.textContent = c.n;
      var fill = document.createElement("div");
      fill.className = "bar__fill";
      fill.style.height = Math.round((c.n / max) * 75) + "%";
      var label = document.createElement("span");
      label.className = "bar__label";
      label.textContent = c.name;
      bar.appendChild(val);
      bar.appendChild(fill);
      bar.appendChild(label);
      el.bars.appendChild(bar);
    });
  }

  function renderStats() {
    $("heroCount").textContent = DICT.words.length + DICT.phrases.length;
    $("statWords").textContent = DICT.words.length;
    $("statPhrases").textContent = DICT.phrases.length;
    $("statCount").textContent = state.count;
    $("figCount").textContent = state.count;
    $("figRate").textContent = (state.rate || 0) + "%";
  }

  function reportKey(word) { return dir + ":" + norm(word); }
  function cleanWord(word) { return word.toLowerCase().replace(/[’‘`´]/g, "'"); }

  // Baris siap tempel untuk dictionary.js; kata ditaruh pada sisi bahasa yang belum punya padanan.
  function dictLine(word) {
    return dir === "kj-id"
      ? '{ k: "' + word + '", i: "", c: "Lainnya" },'
      : '{ k: "", i: "' + word + '", c: "Lainnya" },';
  }

  function missingWords(r) {
    return r.pairs.filter(function (p) { return !p.ok; }).map(function (p) {
      var key = reportKey(p.src);
      return { word: cleanWord(p.src), key: key, sent: state.reported.indexOf(key) !== -1 };
    });
  }

  function renderReport(r, hasText) {
    if (reportBusy) return;
    var missing = hasText ? missingWords(r) : [];
    el.report.hidden = !missing.length;
    if (!missing.length) return;

    var fresh = missing.filter(function (m) { return !m.sent; });
    var pending = fresh.length > 0;
    var shown = (pending ? fresh : missing).map(function (m) { return m.word; });
    var more = shown.length - REPORT_MAX_WORDS;

    el.reportTitle.textContent = pending ? shown.length + " kata belum ada di kamus" : "Sudah dilaporkan ke admin";
    el.reportWords.textContent = shown.slice(0, REPORT_MAX_WORDS).join(", ") + (more > 0 ? " dan " + more + " lainnya" : "");
    el.reportForm.hidden = !pending;
    el.reportStatus.className = "report__status" + (pending ? "" : " report__status--ok");
    el.reportStatus.textContent = pending ? "" : "Terima kasih sudah membantu melengkapi kamus!";
    if (pending) {
      el.reportNoteLabel.textContent = LABELS[dir].note;
      el.reportNote.placeholder = "Contoh: " + shown[0] + " = ...";
    }
  }

  function postReport(payload) {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, REPORT_TIMEOUT_MS);
    return fetch(REPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        var rejected = data && (data.success === false || data.success === "false");
        if (!res.ok || rejected) throw new Error("laporan ditolak");
      });
    }).finally(function () { clearTimeout(timer); });
  }

  function sendReport() {
    if (reportBusy) return;
    var text = el.input.value.trim();
    var batch = missingWords(translate(text)).filter(function (m) { return !m.sent; }).slice(0, REPORT_MAX_WORDS);
    if (!batch.length) return;

    var words = batch.map(function (m) { return m.word; });
    var note = el.reportNote.value.trim();
    var payload = {
      _subject: "[PASSAPU] Kata belum ada: " + words.slice(0, 3).join(", ") +
        (words.length > 3 ? " dan " + (words.length - 3) + " lainnya" : ""),
      _template: "table",
      kata: words.join(", "),
      arah: LABELS[dir].route,
      kalimat: text.slice(0, 300),
      arti_dari_pengguna: note || "(tidak diisi)",
      format_kamus: words.map(dictLine).join("\n")
    };

    reportBusy = true;
    el.btnReport.disabled = true;
    el.reportStatus.className = "report__status";
    el.reportStatus.textContent = "Mengirim laporan...";

    postReport(payload).then(function () {
      state.reported = batch.map(function (m) { return m.key; }).concat(state.reported).slice(0, REPORT_KEPT);
      saveState();
      el.reportNote.value = "";
      reportBusy = false;
      el.btnReport.disabled = false;
      run(false);
    }, function () {
      reportBusy = false;
      el.btnReport.disabled = false;
      el.reportStatus.className = "report__status report__status--err";
      el.reportStatus.textContent = "Gagal mengirim. Periksa koneksi internet lalu coba lagi.";
    });
  }

  function joinParts(r) {
    return r.parts.map(function (p) { return p.text; }).join("");
  }

  function run(record) {
    var text = el.input.value;
    var has = text.trim().length > 0;
    var r = has ? translate(text) : { parts: [], pairs: [], known: 0, unknown: 0 };
    lastOutput = joinParts(r);
    renderResult(r, has);
    renderBreakdown(r.pairs);
    renderReport(r, has);

    if (has && record) {
      var total = r.known + r.unknown;
      state.rate = total ? Math.round((r.known / total) * 100) : 0;
      state.count += 1;
      state.history = [{ src: text.trim(), dst: lastOutput.trim(), dir: dir }]
        .concat(state.history.filter(function (h) {
          return !(h.src === text.trim() && (h.dir || "kj-id") === dir);
        }))
        .slice(0, 5);
      saveState();
      renderHistory();
      renderStats();
    }
  }

  function showPane(id) {
    document.querySelectorAll(".pane").forEach(function (p) { p.hidden = p.id !== id; });
    document.querySelectorAll(".nav__btn").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-pane") === id);
    });
  }

  document.querySelectorAll(".nav__btn").forEach(function (b) {
    b.addEventListener("click", function () { showPane(b.getAttribute("data-pane")); });
  });

  el.btnTranslate.addEventListener("click", function () { run(true); });

  el.btnReport.addEventListener("click", sendReport);
  el.reportNote.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); sendReport(); }
  });

  // Tampilkan peta Google tertanam bila assets/kajang.png belum ada.
  var mapImg = $("mapImg");
  function useEmbed() {
    mapImg.hidden = true;
    $("mapEmbed").hidden = false;
    $("btnRegion").disabled = true;
  }
  mapImg.addEventListener("error", useEmbed);
  if (mapImg.complete && mapImg.naturalWidth === 0) useEmbed();

  $("btnRegion").addEventListener("click", function () {
    var on = $("mapBox").classList.toggle("map--region");
    this.setAttribute("aria-pressed", String(on));
    this.textContent = on ? "PETA PENUH" : "WILAYAH SAJA";
  });

  el.input.addEventListener("input", function () { run(false); });
  el.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(true); }
  });

  el.btnClear.addEventListener("click", function () {
    el.input.value = "";
    run(false);
    el.input.focus();
  });

  el.btnSample.addEventListener("click", function () {
    var sample = DICT.samples[sampleIndex % DICT.samples.length];
    if (dir === "id-kj") sample = joinParts(translate(sample, "kj-id"));
    el.input.value = sample;
    sampleIndex++;
    run(true);
  });

  // Ganti arah; hasil terjemahan sebelumnya menjadi teks masukan baru.
  function setDir(next) {
    var L = LABELS[next];
    dir = next;
    $("panelTitle").textContent = L.panel;
    el.input.placeholder = L.placeholder;
    $("btnSwap").textContent = L.tag;
    run(false);
  }

  $("btnSwap").addEventListener("click", function () {
    if (lastOutput.trim()) el.input.value = lastOutput;
    setDir(dir === "kj-id" ? "id-kj" : "kj-id");
    el.input.focus();
  });

  el.btnCopy.addEventListener("click", function () {
    if (!lastOutput.trim() || !navigator.clipboard) return;
    navigator.clipboard.writeText(lastOutput).then(function () {
      el.btnCopy.title = "Tersalin!";
      setTimeout(function () { el.btnCopy.title = "Salin hasil"; }, 1200);
    });
  });

  // Beranda dan penerjemah bergantian; tombol kembali Android ikut bekerja lewat hash.
  function route() {
    var inApp = location.hash === "#penerjemah";
    $("beranda").hidden = inApp;
    $("penerjemah").hidden = !inApp;
  }
  window.addEventListener("hashchange", route);
  // Setiap kali dimuat, selalu mulai dari beranda.
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  route();

  renderBars();
  renderHistory();
  renderStats();
})();
