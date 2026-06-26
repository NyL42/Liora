/* =========================================================
   Liora — comportamento compartilhado (v4)
   · Idioma e moeda: PREFERENCIAS de perfil (pagina Perfil), nao no topo.
   · Topo: dois toggles GLOBAIS de visualizacao + mostram o que esta definido
       - Traducao: Original  <->  <idioma definido> (ex.: PT)
       - Moeda:    Original (€)  <->  <moeda definida> (ex.: R$)
   · Precos em [data-eur] (inclusive dentro de texto) seguem o toggle global.
   ========================================================= */
(function () {
  "use strict";

  const store = {
    get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const STATE = {
    theme:   store.get("liora-theme", "light"),
    lang:    store.get("liora-lang", "pt"),     // idioma do perfil (PT/EN)
    cur:     store.get("liora-cur", "BRL"),     // moeda do perfil
    xlate:   store.get("liora-xlate", "original"),   // original | translated (global)
    curview: store.get("liora-curview", "original")  // original | converted (global)
  };

  const RATES = { EUR: 1, BRL: 6.20, USD: 1.08 };
  const SYM = { EUR: "€", BRL: "R$", USD: "$" };
  const CUR = {
    EUR: v => "€ " + grp(v, "."),
    BRL: v => "R$ " + grp(v, "."),
    USD: v => "$ " + grp(v, ",")
  };
  function grp(n, sep) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
  function fmtCur(eur, cur) { return CUR[cur](eur * RATES[cur]); }
  function money(eur) { return fmtCur(eur, STATE.curview === "converted" ? STATE.cur : "EUR"); }

  const I18N = {
    pt: {
      house: "Gheller & Co.", role: "Mestranda · São Paulo → Amsterdã",
      nav_section: "Plataforma",
      n_home: "Início", n_explore: "Explorar", n_listings: "Imóveis", n_messages: "Mensagens",
      c_translation: "Tradução", c_currency: "Moeda", profile_a: "Perfil & configurações"
    },
    en: {
      house: "Gheller & Co.", role: "Master's student · São Paulo → Amsterdam",
      nav_section: "Platform",
      n_home: "Home", n_explore: "Explore", n_listings: "Listings", n_messages: "Messages",
      c_translation: "Translation", c_currency: "Currency", profile_a: "Profile & settings"
    }
  };

  const NAV = [
    { key: "home",     href: "index.html",          i: "n_home",     icon: "home" },
    { key: "explore",  href: "neighbourhoods.html", i: "n_explore",  icon: "map" },
    { key: "listings", href: "listings.html",       i: "n_listings", icon: "building" },
    { key: "messages", href: "messages.html",       i: "n_messages", icon: "chat", badge: "2" }
  ];

  const ICONS = {
    sun:  '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    map:  '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
    building: '<svg viewBox="0 0 24 24"><path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 21V10h3a1 1 0 0 1 1 1v10M3 21h18M8 8h2M8 12h2M8 16h2"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.8L3 20.5l1.4-4.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>'
  };

  /* =========================================================
     CHROME — sidebar + appbar
     ========================================================= */
  function buildSidebar(mount) {
    const page = mount.dataset.page || "home";
    const aside = document.createElement("aside");
    aside.className = "sidebar";
    let nav = "";
    NAV.forEach(n => {
      nav += `<a class="${n.key === page ? "active" : ""}" href="${n.href}">
        <span class="ico">${ICONS[n.icon]}${n.badge ? `<span class="badge">${n.badge}</span>` : ""}</span>
        <span class="lab" data-i18n="${n.i}"></span>
      </a>`;
    });
    aside.innerHTML = `
      <a class="brand-block" href="index.html" style="text-decoration:none">
        <span class="mark">Liora</span><span class="house" data-i18n="house"></span>
      </a>
      <div class="nav-label" data-i18n="nav_section"></div>
      <nav class="nav">${nav}</nav>
      <a class="side-account ${page === "profile" ? "active" : ""}" href="profile.html" title="Perfil">
        <span class="av">S</span>
        <div><div class="nm">Sofia Almeida</div><div class="rl" data-i18n="profile_a"></div></div>
      </a>`;
    mount.replaceWith(aside);
  }

  function buildAppbar(mount) {
    const header = document.createElement("header");
    header.className = "appbar";
    const titlePt = mount.dataset.title || "", titleEn = mount.dataset.titleEn || titlePt;
    const subPt = mount.dataset.sub || "", subEn = mount.dataset.subEn || subPt;
    header.innerHTML = `
      <div class="ab-title">
        <span class="t" data-en="${escAttr(titleEn)}">${titlePt}</span>
        ${subPt ? `<span class="s" data-en="${escAttr(subEn)}">${subPt}</span>` : ""}
      </div>
      <div class="controls">
        <div class="ctrl-group">
          <span class="cg-label" data-i18n="c_translation"></span>
          <div class="seg" id="xlateSeg" role="group" aria-label="Tradução">
            <button data-xmode="original" data-en="Original">Original</button>
            <button data-xmode="translated"><span class="set-lang"></span></button>
          </div>
        </div>
        <div class="ctrl-group">
          <span class="cg-label" data-i18n="c_currency"></span>
          <div class="seg" id="curSeg" role="group" aria-label="Moeda">
            <button data-cmode="original">€</button>
            <button data-cmode="converted"><span class="set-cur"></span></button>
          </div>
        </div>
        <button class="theme-toggle" id="themeBtn" aria-label="Tema claro/escuro">${ICONS.sun}${ICONS.moon}</button>
        <a class="profile-link" href="profile.html" aria-label="Perfil" title="Perfil"><span class="av">S</span></a>
      </div>`;
    mount.replaceWith(header);
  }
  function escAttr(s) { return String(s).replace(/"/g, "&quot;"); }

  /* =========================================================
     APLICAR ESTADO
     ========================================================= */
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", STATE.theme);
    document.dispatchEvent(new CustomEvent("liora:theme", { detail: STATE.theme }));
  }

  function applyCurrency() {
    const mode = STATE.curview === "converted" ? STATE.cur : "EUR";
    document.querySelectorAll("[data-eur]").forEach(el => {
      const v = parseFloat(el.dataset.eur);
      if (!isNaN(v)) el.textContent = fmtCur(v, mode);
    });
    document.documentElement.setAttribute("data-curview", STATE.curview);
    document.querySelectorAll("#curSeg button").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.cmode === STATE.curview)));
    document.querySelectorAll(".set-cur").forEach(e => e.textContent = SYM[STATE.cur]);
    const setCur = document.getElementById("setCur"); if (setCur) setCur.value = STATE.cur;
    document.dispatchEvent(new CustomEvent("liora:cur", { detail: STATE.curview }));
  }

  function applyXlate() {
    document.documentElement.setAttribute("data-xlate", STATE.xlate);
    document.querySelectorAll("#xlateSeg button").forEach(b =>
      b.setAttribute("aria-pressed", String(b.dataset.xmode === STATE.xlate)));
    document.querySelectorAll(".set-lang").forEach(e => e.textContent = STATE.lang.toUpperCase());
  }

  function applyLang() {
    document.documentElement.setAttribute("lang", STATE.lang === "en" ? "en" : "pt-BR");
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.dataset.i18n;
      if (I18N[STATE.lang] && I18N[STATE.lang][k]) el.textContent = I18N[STATE.lang][k];
    });
    document.querySelectorAll("[data-en]").forEach(el => {
      if (!el.dataset.pt) el.dataset.pt = el.textContent.trim();
      el.textContent = STATE.lang === "en" ? el.dataset.en : el.dataset.pt;
    });
    // texto traduzido que contem markup (ex.: precos <span data-eur>)
    document.querySelectorAll("[data-en-html]").forEach(el => {
      if (!el.dataset.ptHtml) el.dataset.ptHtml = el.innerHTML;
      el.innerHTML = STATE.lang === "en" ? el.dataset.enHtml : el.dataset.ptHtml;
    });
    document.querySelectorAll("[data-ph-en]").forEach(el => {
      if (!el.dataset.phPt) el.dataset.phPt = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", STATE.lang === "en" ? el.dataset.phEn : el.dataset.phPt);
    });
    const setLang = document.getElementById("setLang"); if (setLang) setLang.value = STATE.lang;
    document.dispatchEvent(new CustomEvent("liora:lang", { detail: STATE.lang }));
  }

  function wireControls() {
    const tb = document.getElementById("themeBtn");
    if (tb) tb.addEventListener("click", () => {
      STATE.theme = STATE.theme === "dark" ? "light" : "dark";
      store.set("liora-theme", STATE.theme); applyTheme();
    });
    // toggle global de traducao
    document.querySelectorAll("#xlateSeg button").forEach(b =>
      b.addEventListener("click", () => { STATE.xlate = b.dataset.xmode; store.set("liora-xlate", STATE.xlate); applyXlate(); }));
    // toggle global de moeda
    document.querySelectorAll("#curSeg button").forEach(b =>
      b.addEventListener("click", () => { STATE.curview = b.dataset.cmode; store.set("liora-curview", STATE.curview); applyCurrency(); }));
    // pagina Perfil: selects que DEFINEM idioma e moeda
    const setLang = document.getElementById("setLang");
    if (setLang) setLang.addEventListener("change", () => {
      STATE.lang = setLang.value; store.set("liora-lang", STATE.lang);
      applyLang(); applyCurrency(); applyXlate();
    });
    const setCur = document.getElementById("setCur");
    if (setCur) setCur.addEventListener("change", () => {
      STATE.cur = setCur.value; store.set("liora-cur", STATE.cur); applyCurrency();
    });
    const setTheme = document.getElementById("setTheme");
    if (setTheme) setTheme.addEventListener("change", () => {
      STATE.theme = setTheme.value; store.set("liora-theme", STATE.theme); applyTheme();
    });
  }

  /* =========================================================
     INBOX (DM)
     ========================================================= */
  let inboxOpen = null;   // exposto para os botões "ir para a conversa com…"
  function wireInbox() {
    const inbox = document.querySelector(".inbox");
    if (!inbox) return;
    const convos = inbox.querySelectorAll(".convo");
    const panes = inbox.querySelectorAll(".tp");
    function open(key) {
      convos.forEach(c => c.classList.toggle("active", c.dataset.convo === key));
      panes.forEach(p => {
        const on = p.dataset.convo === key;
        p.classList.toggle("active", on);
        if (on) { const th = p.querySelector(".tp-thread"); if (th) th.scrollTop = th.scrollHeight; }
      });
      const c = [...convos].find(c => c.dataset.convo === key);
      if (c) { const u = c.querySelector(".unread"); if (u) u.remove(); }
      inbox.classList.add("show-thread");
      inbox.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    inboxOpen = open;
    convos.forEach(c => c.addEventListener("click", () => open(c.dataset.convo)));
    const back = inbox.querySelectorAll(".thread-back");
    back.forEach(b => b.addEventListener("click", () => inbox.classList.remove("show-thread")));
    // garante o thread inicial rolado ate o fim
    const act = inbox.querySelector(".tp.active .tp-thread"); if (act) act.scrollTop = act.scrollHeight;
  }

  /* =========================================================
     CHAT — composer
     ========================================================= */
  function nowTime() { return "14:32"; }
  function makeMsg(side, html, time) {
    const m = document.createElement("div");
    m.className = "msg " + side;
    m.innerHTML = `<div class="bubble">${html}</div><span class="time">${time || nowTime()}</span>`;
    return m;
  }
  function typingNode() {
    const m = document.createElement("div");
    m.className = "msg them typing-wrap";
    m.innerHTML = `<div class="bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
    return m;
  }
  function scrollEnd(th) { th.scrollTop = th.scrollHeight; }

  function answerListing(q) {
    // precos respondem ao toggle global de moeda
    if (/(preço|preco|price|valor|custo|aluguel|renda|rent)/i.test(q))
      return { html: STATE.lang === "en"
        ? `Rent is <span data-eur="1850"></span>/mo, plus <span data-eur="120"></span> in costs. Use the Currency toggle at the top to switch original ⇄ converted.`
        : `O aluguel é de <span data-eur="1850"></span>/mês, com <span data-eur="120"></span> de despesas. Use o toggle de Moeda no topo para alternar original ⇄ convertido.`,
        src: STATE.lang === "en" ? "Listing data · live FX" : "Dados do anúncio · câmbio ao vivo" };
    if (/(depósito|deposito|caução|caucao|deposit|fiança|fianca)/i.test(q))
      return { html: STATE.lang === "en"
        ? `The deposit is 2 months (<span data-eur="3700"></span>), refundable at the end of the lease barring damages.`
        : `O depósito é de 2 meses (<span data-eur="3700"></span>), devolvido no fim do contrato salvo danos.`,
        src: STATE.lang === "en" ? "Tenancy law · reviewed by the legal team" : "Lei do arrendamento · revisto pela equipa jurídica" };
    const QA = [
      { rx: /escola|school|primár|ensino/i,
        pt: "Há três escolas a distância a pé: a mais próxima fica a 6 min (450 m). Duas são públicas e uma internacional bilíngue.",
        en: "Three schools are within walking distance — the closest is 6 min (450 m). Two are public, one is a bilingual international school.",
        src: { pt: "Dados da zona do anúncio · registos municipais", en: "Listing area data · municipal records" } },
      { rx: /(ônibus|onibus|autocarro|bus|transport|metrô|metro|tram|bonde)/i,
        pt: "Sim — a paragem na esquina serve 2 linhas de tram e 1 de autocarro. O metro mais próximo fica a 9 min a pé.",
        en: "Yes — the stop on the corner serves 2 tram lines and 1 bus line. The nearest metro is 9 min on foot.",
        src: { pt: "Autoridade de transportes · GVB", en: "Transit authority · GVB" } },
      { rx: /(aviso|notice|rescis|prazo|cláusula|clausula|cancel)/i,
        pt: "A cláusula de aviso prévio de 1 mês é padrão na lei holandesa para contratos por tempo indeterminado.",
        en: "A 1-month notice clause is standard under Dutch law for open-ended leases.",
        src: { pt: "Legislação em vigor · revisto pela equipa jurídica", en: "Current legislation · reviewed by the legal team" } },
      { rx: /(animal|pet|cachorro|cão|cao|gato|dog|cat)/i,
        pt: "Animais são permitidos mediante aviso ao proprietário. Sem taxa adicional indicada no anúncio.",
        en: "Pets are allowed with prior notice to the owner. No additional fee listed.",
        src: { pt: "Dados do anúncio", en: "Listing data" } },
      { rx: /(internet|wi-?fi|fibra|fiber|banda larga)/i,
        pt: "O endereço tem fibra até 1 Gbps por três operadoras. Instalação típica em 3–5 dias úteis.",
        en: "The address has fiber up to 1 Gbps from three providers. Typical setup in 3–5 business days.",
        src: { pt: "Registos de infraestrutura local", en: "Local infrastructure records" } },
      { rx: /(café|cafe|trabalh|coworking|remoto|remote|work)/i,
        pt: "Quatro cafés com espaço para trabalhar ficam num raio de 10 min a pé — todos no mapa do bairro.",
        en: "Four laptop-friendly cafés are within a 10-min walk — all on the neighbourhood map.",
        src: { pt: "Mapa do bairro · perfil de mobilidade", en: "Neighbourhood map · mobility profile" } }
    ];
    const hit = QA.find(o => o.rx.test(q));
    if (hit) return { text: hit[STATE.lang] || hit.pt, src: hit.src[STATE.lang] || hit.src.pt };
    return {
      text: STATE.lang === "en"
        ? "I'd pull that from the listing and local-area data. Try: schools, transit, price, deposit, notice, pets, internet or remote-work spots."
        : "Eu buscaria isso nos dados do anúncio e da zona. Experimente: escolas, transporte, preço, depósito, aviso prévio, animais, internet ou espaços para trabalho remoto.",
      src: STATE.lang === "en" ? "Demo · prepared answers" : "Demo · respostas preparadas"
    };
  }
  function genericReply() {
    return STATE.lang === "en"
      ? "Noted — I'll get back to you shortly. (Illustrative reply in the demo.)"
      : "Anotado — retorno em instantes. (Resposta ilustrativa na demo.)";
  }

  function wireComposers() {
    document.querySelectorAll("[data-chat]").forEach(form => {
      const mode = form.dataset.chat;
      const input = form.querySelector("input");
      const thread = (form.dataset.thread && document.querySelector(form.dataset.thread)) ||
                     form.parentElement.querySelector(".tp-thread, .thread, .ask-thread");
      if (!thread) return;
      function ask(text) {
        if (!text.trim()) return;
        thread.appendChild(makeMsg("me", escapeHtml(text))); scrollEnd(thread);
        const typing = typingNode(); thread.appendChild(typing); scrollEnd(thread);
        setTimeout(() => {
          typing.remove();
          if (mode === "listing") {
            const a = answerListing(text);
            const m = makeMsg("them", a.html ? a.html : escapeHtml(a.text));
            const sl = document.createElement("div");
            sl.className = "source-line"; sl.innerHTML = `<span class="ico">◆</span> ${escapeHtml(a.src)}`;
            m.appendChild(sl); thread.appendChild(m);
            applyCurrency();   // formata precos recem-inseridos conforme o toggle
          } else { thread.appendChild(makeMsg("them", escapeHtml(genericReply()))); }
          scrollEnd(thread);
        }, 720);
      }
      form.addEventListener("submit", e => { e.preventDefault(); ask(input.value); input.value = ""; input.focus(); });
      const dock = form.closest("[data-ask]") || form.closest(".tp") || document;
      dock.querySelectorAll(".suggest button").forEach(b => b.addEventListener("click", () => ask(b.textContent)));
    });
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* =========================================================
     CARTÕES DA IA no chat — sugestão (sc) e rascunho (dc)
     Botões: data-go (trocar conversa) · data-send-* (enviar como
     usuário, com tag de assistido) · data-reply-* (resposta).
     ========================================================= */
  function appendAssisted(thread, html, approved) {
    const m = makeMsg("me", html);
    m.classList.add("assisted");
    const en = STATE.lang === "en";
    const tag = document.createElement("span");
    tag.className = "assisted-tag";
    tag.innerHTML = "◆ " + (approved
      ? (en ? "Sent with your approval · assisted by Liora" : "Enviado com a sua aprovação · assistido pela Liora")
      : (en ? "Answered by Liora · from your profile" : "Respondido pela Liora · do seu perfil"));
    m.appendChild(tag);
    thread.appendChild(m);
    applyCurrency();
    scrollEnd(thread);
  }
  function wireCards() {
    document.querySelectorAll(".suggest-card .sc-actions button, .draft-card .dc-actions button").forEach(btn =>
      btn.addEventListener("click", () => {
        const card = btn.closest(".suggest-card, .draft-card");
        const thread = card && card.closest(".tp-thread, .thread, .ask-thread");
        const en = STATE.lang === "en";
        if (btn.dataset.go) { if (inboxOpen) inboxOpen(btn.dataset.go); return; }   // trocar conversa
        if (card) card.classList.add("resolved");
        const sendHtml = en ? (btn.dataset.sendHtmlEn || btn.dataset.sendHtmlPt) : btn.dataset.sendHtmlPt;
        const sendTxt  = en ? (btn.dataset.sendEn || btn.dataset.sendPt) : btn.dataset.sendPt;
        if (sendHtml || sendTxt) { if (thread) appendAssisted(thread, sendHtml || escapeHtml(sendTxt), true); return; }
        const reply = en ? (btn.dataset.replyEn || btn.dataset.replyPt) : btn.dataset.replyPt;
        if (reply && thread) { thread.appendChild(makeMsg("them", escapeHtml(reply))); scrollEnd(thread); }
      }));
  }

  /* ========================================================= */
  function boot() {
    const sb = document.getElementById("sidebar"); if (sb) buildSidebar(sb);
    const ab = document.getElementById("appbar");  if (ab) buildAppbar(ab);
    applyTheme(); wireControls(); applyLang(); applyCurrency(); applyXlate();
    wireInbox(); wireComposers(); wireCards();
    const setTheme = document.getElementById("setTheme"); if (setTheme) setTheme.value = STATE.theme;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
