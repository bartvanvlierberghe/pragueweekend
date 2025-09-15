// script.js — verrijkte versie
async function loadItinerary(){
  const res = await fetch('data/itinerary.json');
  const data = await res.json();
  return data.days || [];
}

// Verrijkingen per locatie (regex-match op title/notes)
const ENRICHMENTS = [
  {
    match: /praagse\s*burcht|pražský\s*hrad|prague\s*castle/i,
    desc: "UNESCO‑site en het grootste aaneengesloten kasteelcomplex ter wereld, met wortels rond 880 en een mix van romaanse en gotische invloeden.",
    facts: [
      "Vaak genoemd als grootste ‘ancient castle’ (≈70.000 m²).",
      "Oorsprong rond 880; later ingrepen o.a. door Plečnik.",
      "Bevat o.a. de Sint‑Vituskathedraal en Koninklijke vertrekken."
    ],
    mapsUrl: "https://maps.google.com/?q=Prague Castle",
    siteUrl: "https://www.hrad.cz/en/prague-castle-for-visitors"
  },
  {
    match: /strahov(ský)?\s*kl(a|á)šter|strahov\s*monastery/i,
    desc: "Premonstratenzerabdij (1143) boven de burcht, bekend om basiliek, orgeltraditie en een historische kloosterbibliotheek.",
    facts: [
      "Gesticht in 1143 door Premonstratenzers.",
      "Relieken van St. Norbert (sinds 1627).",
      "Mozart‑overlevering rond orgelimprovisatie."
    ],
    mapsUrl: "https://maps.google.com/?q=Strahov Monastery",
    siteUrl: "https://www.strahovskyklaster.cz/en"
  },
  {
    match: /petř[ií]n|petrin\s*heuvel|funicular/i,
    desc: "Groene stadsheuvel met panorama’s; de historische kabelspoorweg (1891) ondergaat een meerjarige renovatie.",
    facts: [
      "Kabelspoor uit 1891 (tijdelijk buiten dienst voor vernieuwing).",
      "Alternatief: wandelen vanaf Újezd of tram 22 tot Pohořelec.",
      "Bekend om uitkijktoren en rozentuinen."
    ],
    mapsUrl: "https://maps.google.com/?q=Petrin Hill",
    siteUrl: "https://prague.eu/en/objevujte/petrin-funicular-lanova-draha-na-petrin/"
  },
  {
    match: /troja\s*(kasteel|chateau|palace|z[aá]mek)/i,
    desc: "Vroeg‑barokke buitenresidentie (1679–1691) van de graven van Sternberg met iconische tuintrap en beeldengroep.",
    facts: [
      "Architect Jean Baptiste Mathey; Italiaanse invloeden.",
      "Tuintrap met titanen (Heermann).",
      "Onder beheer van Prague City Gallery (GHMP)."
    ],
    mapsUrl: "https://maps.google.com/?q=Troja Chateau",
    siteUrl: "https://www.ghmp.cz/en/buildings/ghmp-zamek-troja/"
  },
  {
    match: /jazz\s*dock/i,
    desc: "Moderne jazzclub aan de Vltava met glazen paviljoen en sterke programmering van jazz, funk en soul.",
    facts: [
      "Adres: Janáčkovo nábřeží 2 (Smíchov).",
      "Rivierlocatie met bar/keuken.",
      "Dagelijks wisselend programma."
    ],
    mapsUrl: "https://maps.google.com/?q=Jazz Dock Prague",
    siteUrl: "https://www.jazzdock.cz/en"
  },
  {
    match: /u\s*medv[ií]dk(ů|u)|u\s*medvidku/i,
    desc: "Historische brouwerij‑herberg met 15e‑eeuwse wortels, klassieke Tsjechische gerechten en eigen bieren.",
    facts: [
      "Historie terug tot 1466.",
      "Eigen brouwsel (o.a. XBEER‑33) naast Budvar.",
      "Grote traditionele bierhal."
    ],
    mapsUrl: "https://maps.google.com/?q=U Medvídků Prague",
    siteUrl: "https://umedvidku.cz/en/"
  },
  {
    match: /pilsner\s*urquell.*(experience|original)/i,
    desc: "Interactieve bierbeleving nabij het Wenceslasplein: multimedia, tap‑demo’s en proeverij.",
    facts: [
      "Meerdere verdiepingen met 360° elementen.",
      "Tapster Academy met tapstijlen.",
      "Inclusief proeverij en bierhal."
    ],
    mapsUrl: "https://maps.google.com/?q=Pilsner Urquell The Original Beer Experience",
    siteUrl: "https://www.pilsnerexperience.com/en"
  },
  {
    match: /joods|jewish\s*museum|synagoge|begraafplaats/i,
    desc: "Ticket omvat meerdere synagogen en de Oude Joodse Begraafplaats; individueel ticket is doorgaans 3 dagen geldig.",
    facts: [
      "Omvat o.a. Maisel-, Pinkas-, Spaanse en Klausensynagoge.",
      "Begraafplaats maakt deel uit van de route.",
      "Ticketverkoop eindigt 30 min. voor sluiting."
    ],
    mapsUrl: "https://maps.google.com/?q=Jewish Museum in Prague",
    siteUrl: "https://www.jewishmuseum.cz/en/info/visit/admission/"
  },
  {
    match: /ibis\s*praha\s*old\s*town/i,
    desc: "Centraal gelegen bij Palladium/Kruittoren, praktisch voor Oude Stad en openbaar vervoer.",
    facts: [
      "Korte wandelafstand tot Oude Stadsplein.",
      "Goede OV‑connecties (tram/metro).",
      "Onderdeel van Accor (ibis)."
    ],
    mapsUrl: "https://maps.google.com/?q=Ibis Praha Old Town",
    siteUrl: "https://all.accor.com/hotel/5477/index.en.shtml"
  }
];

// Dag-fotogalerij (optioneel eigen assets)
const DAY_PHOTOS = {
  "donderdag 2 oktober": [
    "https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=1200&auto=format&fit=crop"
  ],
  "vrijdag 3 oktober": [
    "https://images.unsplash.com/photo-1608949987610-03c5fc273a20?q=80&w=1200&auto=format&fit=crop"
  ],
  "zaterdag 4 oktober": [
    "https://images.unsplash.com/photo-1542103749-8ef59b94f47f?q=80&w=1200&auto=format&fit=crop"
  ],
  "zondag 5 oktober": [
    "https://images.unsplash.com/photo-1568047230945-8a04e0b0aef2?q=80&w=1200&auto=format&fit=crop"
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

// Bouw actieknoppen
function actionButtons(ev){
  const actions = [];
  const e = findEnrichment(ev.title||'', ev.notes||'');
  if(e?.siteUrl){
    actions.push(`<a class="btn accent" href="${e.siteUrl}" target="_blank" rel="noopener">Officiële site/tickets</a>`);
  }
  if(e?.mapsUrl){
    actions.push(`<a class="btn success" href="${e.mapsUrl}" target="_blank" rel="noopener">Open Google Maps</a>`);
  }else{
    const query = encodeURIComponent(ev.title || 'Prague');
    actions.push(`<a class="btn success" href="https://www.google.com/maps/search/${query}" target="_blank" rel="noopener">Zoek op Maps</a>`);
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
    const notes = ev.notes ? `<div class="notes">${linkify(ev.notes)}</div>` : '';
    const desc = enr?.desc ? `<div class="desc">${enr.desc}</div>` : '';
    const facts = enr?.facts ? renderFacts(enr.facts) : '';
    const actions = actionButtons(ev);
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
    const label = parts && parts[11] ? `${parts} ${parts[11]}` : d.name;
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
