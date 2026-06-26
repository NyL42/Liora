/* =========================================================
   Liora — mapa do bairro (Leaflet + CARTO)
   · Tiles claros/escuros trocam com o tema
   · POIs por bairro · window.LioraMap.show(area) troca a área
   Em produção: Apple MapKit JS ou Google Maps Platform.
   ========================================================= */
(function () {
  "use strict";

  const CAT = {
    home:    { color: "#2B2722" }, cafe: { color: "#9A7B45" }, park: { color: "#5A6B57" },
    transit: { color: "#6E7E8A" }, market: { color: "#B0714F" }, work: { color: "#7E6A86" }
  };

  const AREAS = {
    depijp: {
      name: "De Pijp", center: [52.3543, 4.8921], zoom: 15,
      pois: [
        { c: "home",    ll: [52.3543, 4.8921], pt: "Apartamento · 2 quartos", en: "Apartment · 2 bed", ptd: "O imóvel deste perfil. €1.850/mês.", end: "The matched listing. €1,850/mo." },
        { c: "market",  ll: [52.3556, 4.8917], pt: "Albert Cuypmarkt", en: "Albert Cuyp Market", ptd: "Feira diária a 2 quadras.", end: "Daily street market, 2 blocks away." },
        { c: "park",    ll: [52.3539, 4.8946], pt: "Sarphatipark", en: "Sarphatipark", ptd: "Parque a 4 min a pé.", end: "Park, 4-min walk." },
        { c: "cafe",    ll: [52.3531, 4.8904], pt: "Café Binnenpret", en: "Café Binnenpret", ptd: "Mesa grande, tomadas, wi-fi.", end: "Big tables, outlets, wi-fi." },
        { c: "cafe",    ll: [52.3563, 4.8936], pt: "Scandinavian Embassy", en: "Scandinavian Embassy", ptd: "Café de especialidade.", end: "Specialty coffee." },
        { c: "transit", ll: [52.3552, 4.8898], pt: "Metro De Pijp", en: "De Pijp Metro", ptd: "Linha Norte–Sul. 9 min a pé.", end: "North–South line. 9-min walk." },
        { c: "transit", ll: [52.3548, 4.8909], pt: "Tram 4 / 24", en: "Tram 4 / 24", ptd: "Duas linhas na esquina.", end: "Two lines on the corner." },
        { c: "work",    ll: [52.3536, 4.8889], pt: "Coworking Gevel", en: "Gevel Cowork", ptd: "Mesas por dia, sala de reunião.", end: "Day desks, meeting room." }
      ]
    },
    oudwest: {
      name: "Oud-West", center: [52.3645, 4.8710], zoom: 15,
      pois: [
        { c: "home",    ll: [52.3645, 4.8710], pt: "Apartamento · 1 quarto+", en: "Apartment · 1 bed+", ptd: "Opção compatível em Oud-West.", end: "A matched option in Oud-West." },
        { c: "market",  ll: [52.3662, 4.8665], pt: "Ten Katemarkt", en: "Ten Kate Market", ptd: "Feira de rua animada.", end: "Lively street market." },
        { c: "park",    ll: [52.3588, 4.8690], pt: "Vondelpark (entrada)", en: "Vondelpark (gate)", ptd: "O grande parque da cidade.", end: "The city's big park." },
        { c: "cafe",    ll: [52.3636, 4.8703], pt: "Lot Sixty One", en: "Lot Sixty One", ptd: "Torrefação local, bom café.", end: "Local roastery, good coffee." },
        { c: "cafe",    ll: [52.3651, 4.8726], pt: "Bagels & Beans", en: "Bagels & Beans", ptd: "Tranquilo para trabalhar.", end: "Quiet to work from." },
        { c: "transit", ll: [52.3659, 4.8689], pt: "Tram 1 / 17", en: "Tram 1 / 17", ptd: "Direto ao centro.", end: "Direct to the centre." },
        { c: "work",    ll: [52.3625, 4.8731], pt: "Estúdio compartilhado", en: "Shared studio", ptd: "Comunidade criativa.", end: "Creative community." }
      ]
    },
    westerpark: {
      name: "Westerpark", center: [52.3866, 4.8778], zoom: 15,
      pois: [
        { c: "home",    ll: [52.3866, 4.8778], pt: "Apartamento · espaçoso", en: "Apartment · roomy", ptd: "Mais espaço, mais verde.", end: "More space, more green." },
        { c: "park",    ll: [52.3872, 4.8792], pt: "Westerpark", en: "Westerpark", ptd: "Parque para correr à porta.", end: "Park for running at the door." },
        { c: "market",  ll: [52.3858, 4.8742], pt: "Mercado Westergas", en: "Westergas Market", ptd: "Feira de fim de semana.", end: "Weekend market." },
        { c: "cafe",    ll: [52.3855, 4.8748], pt: "Espressofabriek", en: "Espressofabriek", ptd: "Café no antigo gasômetro.", end: "Café in the old gasworks." },
        { c: "cafe",    ll: [52.3879, 4.8762], pt: "Mossel & Co", en: "Mossel & Co", ptd: "Pausa tranquila.", end: "A quiet break." },
        { c: "transit", ll: [52.3851, 4.8802], pt: "Tram 5 / bus", en: "Tram 5 / bus", ptd: "Conexão ao centro.", end: "Connection to the centre." },
        { c: "work",    ll: [52.3883, 4.8801], pt: "Ateliê & coworking", en: "Atelier & cowork", ptd: "Espaços de criação.", end: "Maker spaces." }
      ]
    }
  };

  const TILES = {
    light: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", attr: "&copy; OpenStreetMap &copy; CARTO" },
    dark:  { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",  attr: "&copy; OpenStreetMap &copy; CARTO" }
  };

  function lang() { return (document.documentElement.getAttribute("lang") || "pt").indexOf("en") === 0 ? "en" : "pt"; }
  function theme() { return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function pinIcon(color) {
    return L.divIcon({ className: "", html: `<div class="liora-pin" style="background:${color}"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 16], popupAnchor: [0, -16] });
  }

  function markersFor(map, layer, pois, filter) {
    layer.clearLayers();
    const L18 = lang();
    (filter ? pois.filter(filter) : pois).forEach(p => {
      L.marker(p.ll, { icon: pinIcon(CAT[p.c].color) })
        .bindPopup(`<b>${L18 === "en" ? p.en : p.pt}</b><br>${L18 === "en" ? p.end : p.ptd}`)
        .addTo(layer);
    });
  }

  function makeMap(elId, opts) {
    const el = document.getElementById(elId);
    if (!el) return null;
    if (typeof L === "undefined") {
      const fb = el.parentElement.querySelector(".map-fallback");
      if (fb) { fb.style.display = "grid"; el.style.display = "none"; }
      return null;
    }
    const area = AREAS[opts.area] || AREAS.depijp;
    const map = L.map(elId, {
      center: area.center, zoom: opts.zoom || area.zoom,
      zoomControl: opts.zoomControl !== false, scrollWheelZoom: opts.scroll !== false,
      attributionControl: true
    });
    let th = theme();
    let tile = L.tileLayer(TILES[th].url, { attribution: TILES[th].attr, subdomains: "abcd", maxZoom: 20 }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    markersFor(map, layer, area.pois, opts.filter);

    document.addEventListener("liora:theme", e => {
      const nt = e.detail === "dark" ? "dark" : "light";
      map.removeLayer(tile);
      tile = L.tileLayer(TILES[nt].url, { attribution: TILES[nt].attr, subdomains: "abcd", maxZoom: 20 }).addTo(map);
    });
    document.addEventListener("liora:lang", () => markersFor(map, layer, (map.__area || area).pois, opts.filter));

    map.__layer = layer; map.__opts = opts; map.__area = area;
    setTimeout(() => map.invalidateSize(), 200);
    return map;
  }

  function init() {
    const mainMap = makeMap("map", { area: "depijp" });
    const mini = makeMap("mini-map", { area: "depijp", zoom: 16, zoomControl: false, scroll: false,
      filter: p => ["home", "transit", "park", "market"].indexOf(p.c) >= 0 });

    window.LioraMap = {
      show(key) {
        const area = AREAS[key]; if (!mainMap || !area) return;
        mainMap.__area = area;
        mainMap.flyTo(area.center, area.zoom, { duration: 0.7 });
        markersFor(mainMap, mainMap.__layer, area.pois, mainMap.__opts.filter);
        const nameEl = document.getElementById("map-area-name");
        if (nameEl) nameEl.textContent = area.name;
      }
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
