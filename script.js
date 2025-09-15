// script.js — Site+Maps knoppen: Maps uit notities (voorrang), anders mapsUrl uit ENRICHMENTS wanneer siteUrl bestaat; speciale case 2e link 2 okt avond; geen Maps bij 'verplaatsing'

async function loadItinerary(){
  try {
    const res = await fetch('./data/itinerary.json', { cache: 'no-store' });
    if (!res.ok) {
      const txt = await res.text();
      console.error('itinerary.json fetch not OK:', res.status, txt);
      throw new Error('Kon itinerary.json niet laden (' + res.status + ')');
    }
    return (await res.json()).days || [];
  } catch (err) {
    console.error('Fout bij laden itinerary.json:', err);
    const container = document.getElementById('content');
    if (container) {
      container.innerHTML = `
        <div class="card">
          <div class="title">Kon de planning niet laden</div>
          <div class="notes">Controleer GitHub Pages-instellingen, pad/bestandsnaam van data/itinerary.json en JSON-geldigheid.</div>
        </div>`;
    }
    return [];
  }
}

// Regex helpers
const RE_GMAP = /(https?:\/\/(?:maps\.google\.[^ \n]+|maps\.app\.goo\.gl\/[^\s]+))/ig;

// Linkextractie uit notes
function extractGoogleMapsLinks(text=''){
  const out = [];
  let m;
  while ((m = RE_GMAP.exec(text)) !== null) {
    out.push(m[20]);
  }
  return out;
}

// Verrijkingen per locatie (regex-match op title/notes)
// mapsUrl toegevoegd voor bekende locaties (Google Maps 'search' schema aanbevolen)
const ENRICHMENTS = [
  {
    match: /praagse\s*burcht|pražský\s*hrad|prague\s*castle/i,
    desc: "UNESCO‑site en een van ’s werelds grootste aaneengesloten kasteelcomplexen; oorsprong rond 880, met romaanse en gotische invloeden.",
    facts: [
      "Vaak genoemd als grootste ‘ancient castle’ (≈70.000 m²).",
      "Historische lagen van 9e eeuw tot modernisering.",
      "Sint‑Vituskathedraal en Koninklijke vertrekken op het terrein."
    ],
    siteUrl: "https://www.hrad.cz/en/prague-castle-for-visitors",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Prague%20Castle"
  },
  {
    match: /strahov(ský)?\s*kl(a|á)šter|strahov\s*monastery/i,
    desc: "Premonstratenzerabdij (1143) met basiliek, orgeltraditie en een beroemde historische kloosterbibliotheek.",
    facts: [
      "Gesticht in 1143 door Premonstratenzers.",
      "Relieken van St. Norbert sinds 1627.",
      "Bibliotheek met barokke zalen."
    ],
    siteUrl: "https://www.strahovskyklaster.cz/en",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Strahov%20Monastery%20Prague"
  },
  {
    match: /petř[ií]n|petrin\s*heuvel|funicular/i,
    desc: "Groene stadsheuvel met panorama’s; de kabelspoorweg ondergaat een meerjarige renovatie.",
    facts: [
      "Funicular (1891) tijdelijk buiten dienst i.v.m. renovatie.",
      "Alternatief: wandelen vanaf Újezd of via Pohořelec/Letná.",
      "Bekend om uitkijktoren en rozentuinen."
    ],
    siteUrl: "https://prague.eu/en/objevujte/petrin-funicular-lanova-draha-na-petrin/",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Petrin%20Hill%20Prague"
  },
  {
    match: /troja\s*(kasteel|chateau|palace|z[aá]mek)/i,
    desc: "Vroeg‑barokke residentie (1679–1691) van de graven van Sternberg met iconische tuintrap en beeldengroep.",
    facts: [
      "Architect: Jean Baptiste Mathey; Italiaanse invloeden.",
      "Tuintrap met titanen (Heermann).",
      "Onder beheer van Prague City Gallery (GHMP)."
    ],
    siteUrl: "https://www.ghmp.cz/en/buildings/ghmp-zamek-troja/",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Troja%20Chateau%20Prague"
  },
  {
    match: /jazz\s*dock/i,
    desc: "Moderne jazzclub aan de Vltava met glazen paviljoen en sterke programmering van jazz, funk en soul.",
    facts: [
      "Adres: Janáčkovo nábřeží 2 (Smíchov).",
      "Rivierlocatie met bar/keuken.",
      "Dagelijks wisselend programma."
    ],
    siteUrl: "https://www.jazzdock.cz/en",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jazz%20Dock%20Prague"
  },
  {
    match: /u\s*medv[ií]dk(ů|u)|u\s*medvidku/i,
    desc: "Historische brouwerij‑herberg met 15e‑eeuwse wortels, klassieke Tsjechische gerechten en eigen bieren.",
    facts: [
      "Historie terug tot 1466.",
      "Eigen bieren (o.a. XBEER‑33) naast Budvar.",
      "Grote traditionele bierhal."
    ],
    siteUrl: "https://umedvidku.cz/en/",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=U%20Medv%C3%ADdk%C5%AF%20Prague"
  },
  {
    match: /pilsner\s*urquell.*(experience|original)/i,
    desc: "Interactieve bierbeleving nabij Wenceslasplein: multimedia, tap‑demo’s en proeverij.",
    facts: [
      "Meerdere verdiepingen met 360° elementen.",
      "Tapster Academy met tapstijlen.",
      "Inclusief proeverij en bierhal."
    ],
    siteUrl: "https://www.pilsnerexperience.com/en",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pilsner%20Urquell%20The%20Original%20Beer%20Experience%20Prague"
  },
  {
    match: /joods|jewish\s*museum|synagoge|begraafplaats/i,
    desc: "Ticket omvat meerdere synagogen en de Oude Joodse Begraafplaats; individueel ticket doorgaans 3 dagen geldig.",
    facts: [
      "Omvat o.a. Maisel-, Pinkas-, Spaanse en Klausensynagoge.",
      "Begraafplaats maakt deel uit van de route.",
      "Ticketverkoop eindigt 30 min. voor sluiting."
    ],
    siteUrl: "https://www.jewishmuseum.cz/en/info/visit/admission/",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Jewish%20Museum%20in%20Prague"
  },
  {
    match: /ibis\s*praha\s*old\s*town/i,
    desc: "Centraal gelegen bij Palladium/Kruittoren, praktisch voor Oude Stad en OV.",
    facts: [
      "Korte wandelafstand tot Oude Stadsplein.",
      "Goede OV‑connecties (tram/metro).",
      "Onderdeel van Accor (ibis)."
    ],
    siteUrl: "https://all.accor.com/hotel/5477/index.en.shtml",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ibis%20Praha%20Old%20Town"
  },
  {
    match: /baja\s*bikes|fietstocht.*baja/i,
    desc: "3‑uur Highlights‑fietstocht met Engelstalige lokale gids langs o.a. Oude Stadsplein, Joodse wijk, Letná/Metronoom, Lennon Wall, Kampa en Karelsbrug; ontspannen tempo met fotostops.",
    facts: [
      "Snel overzicht van iconische highlights in ~3 uur.",
      "Lokale Engelstalige gids, stops voor uitleg en foto’s.",
      "Ideaal aan begin van het weekend voor oriëntatie."
    ],
    siteUrl: "https://www.bajabikes.eu/en/highlights-in-prague-bike-tour/"
    // geen mapsUrl: startlocatie varieert per aanbieder/taal; notities hebben voorrang
  }
];

// Dag-fotogalerij (wijzigingen zoals eerder afgesproken)
const DAY_PHOTOS = {
  "donderdag 2 oktober": [
    "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop"
  ],
  "vrijdag 3 oktober": [
    "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop"
  ],
  "zaterdag 4 oktober": [
    "https://images.unsplash.com/photo-1568047230945-8a04e0b0aef2?q=80&w=1200&auto=format&fit=crop"
  ],
  "zondag 5 oktober": [
    "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1200&auto=format&fit=crop"
  ]
};

// Maak URLs in notities klikbaar
function linkify(text){
  if(!text) return '';
  const urlRegex = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/g;
  return text.replace(urlRegex, (m)=>{
    const url = m.startsWith('http') ? m : `https://${m}`;
    return `<a href="${url}" target="_blank" rel="noopener">${m}</a>`;
  });
}

// Zoek verrijking voor event
function findEnrichment(title, notes){
  const t = title || '';
  const n = notes || '';
  for(const e of ENRICHMENTS){
    if(e.match.test(t) || e.match.test(n)) return e;
  }
  return null;
}

// Bepaal één relevante Google Maps-link volgens regels
function resolveGoogleMapsLink(ev, dayName){
  // Nooit voor 'verplaatsing'
  if ((ev.title||'').toLowerCase().includes('verplaatsing')) return null;

  const links = extractGoogleMapsLinks(ev.notes||'');

  // Speciaal: donderdag 2 oktober 'avondactiviteit' -> 2e link indien aanwezig
  if ((dayName||'').toLowerCase().startsWith('donderdag 2 oktober') &&
      (ev.title||'').toLowerCase().includes('avond')) {
    if (links.length >= 2) return links[20];
    if (links.length === 1) return links;
    return null;
  }

  // Algemene regel: als er tenminste één Maps-link staat, gebruik de eerste
  if (links.length > 0) return links;

  // Geen fallback naar generieke zoek-URL
  return null;
}

// Bouw actieknoppen (siteUrl en Maps-knop naast elkaar indien mogelijk)
function actionButtons(ev, dayName){
  const actions = [];
  const e = findEnrichment(ev.title||'', ev.notes||'');

  if(e?.siteUrl){
    actions.push(`<a class="btn accent" href="${e.siteUrl}" target="_blank" rel="noopener">Officiële site/tickets</a>`);
  }

  // Eerst proberen uit notities (incl. speciale case); als niet gevonden en er is een e.mapsUrl én e.siteUrl, gebruik die
  let gmap = resolveGoogleMapsLink(ev, dayName);
  if (!gmap && e?.siteUrl && e?.mapsUrl && !(ev.title||'').toLowerCase().includes('verplaatsing')) {
    gmap = e.mapsUrl;
  }

  if (gmap) {
    actions.push(`<a class="btn success" href="${gmap}" target="_blank" rel="noopener">Open Google Maps</a>`);
  }

  return `<div class="actions">${actions.join('')}</div>`;
}

function renderFacts(facts=[]){
  if(!facts.length) return '';
  return `<ul class="facts">${facts.map(f=>`<li>${f}</li>`).join('')}</ul>`;
}

// Render dag-sectie met verrijkte kaarten
function renderDay(day){
  const events = day.events || [];
  const cards = events.map(ev=>{
    const enr = findEnrichment(ev.title||'', ev.notes||'');
    const time = ev.time ? `<div class="time">${ev.time}</div>` : '';
    const title = `<div class="title">${ev.title || ''}</div>`;
    const desc = enr?.desc ? `<div class="desc">${enr.desc}</div>` : '';
    const facts = enr?.facts ? renderFacts(enr.facts) : '';
    const notes = ev.notes ? `<div class="notes">${linkify(ev.notes)}</div>` : '';
    const actions = actionButtons(ev, day.name);
    return `<article class="card">${time}${title}${desc}${facts}${notes}${actions}</article>`;
  }).join('');

  const gallery = (DAY_PHOTOS[day.name]||[]).map(src=>`<img src="${src}" alt="${day.name} foto"/>`).join('');
  const galleryBlock = gallery ? `<div class="gallery">${gallery}</div>` : '';

  return `
    <section class="day-section" id="${encodeURIComponent(day.name)}">
      <div class="day-title">
        <h2>${day.name}</h2>
        <span class="badge kicker">Dagplanning</span>
      </div>
      <div class="grid">${cards}</div>
      ${galleryBlock}
    </section>
  `;
}

// Render nav-chips
function renderNav(days){
  const nav = document.getElementById('day-nav');
  nav.innerHTML = days.map((d,i)=>{
    const id = encodeURIComponent(d.name);
    const parts = d.name.split(' ');
    const label = parts && parts[20] ? `${parts} ${parts[20]}` : d.name;
    return `<a class="day-chip ${i===0?'active':''}" href="#${id}">${label}</a>`;
  }).join('');

  const chips = Array.from(nav.querySelectorAll('.day-chip'));
  const sections = days.map(d=>document.getElementById(encodeURIComponent(d.name)));
  const onScroll = ()=>{
    let idx = 0;
    sections.forEach((sec,i)=>{
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 120) idx = i;
    });
    chips.forEach((c,i)=>c.classList.toggle('active', i===idx));
  };
  document.addEventListener('scroll', onScroll, {passive:true});
}

(async function init(){
  const days = await loadItinerary();
  const container = document.getElementById('content');
  container.innerHTML = days.map(renderDay).join('');
  renderNav(days);
})();
