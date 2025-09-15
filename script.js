// script.js — generiek renderen vanuit itinerary.json (alle content in JSON)

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

function linkify(text){
  if(!text) return '';
  const urlRegex = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/g;
  return text.replace(urlRegex, (m)=>{
    const url = m.startsWith('http') ? m : `https://${m}`;
    return `<a href="${url}" target="_blank" rel="noopener">${m}</a>`;
  });
}

function actionButtons(ev){
  const actions = [];
  if (ev.siteUrl) {
    actions.push(`<a class="btn accent" href="${ev.siteUrl}" target="_blank" rel="noopener">Officiële site/tickets</a>`);
  }
  if (ev.mapsUrl) {
    actions.push(`<a class="btn success" href="${ev.mapsUrl}" target="_blank" rel="noopener">Open Google Maps</a>`);
  }
  return actions.length ? `<div class="actions">${actions.join('')}</div>` : '';
}

function renderFacts(facts=[]){
  if(!facts || !facts.length) return '';
  return `<ul class="facts">${facts.map(f=>`<li>${f}</li>`).join('')}</ul>`;
}

function renderEvent(ev){
  const time = ev.time ? `<div class="time">${ev.time}</div>` : '';
  const title = `<div class="title">${ev.title || ''}</div>`;
  const desc = ev.desc ? `<div class="desc">${ev.desc}</div>` : '';
  const facts = ev.facts ? renderFacts(ev.facts) : '';
  const notes = ev.notes ? `<div class="notes">${linkify(ev.notes)}</div>` : '';
  const actions = actionButtons(ev);
  return `<article class="card">${time}${title}${desc}${facts}${notes}${actions}</article>`;
}

function renderDay(day){
  const cards = (day.events || []).map(renderEvent).join('');
  const gallery = (day.photos || []).map(src=>`<img src="${src}" alt="${day.name} foto"/>`).join('');
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

function renderNav(days){
  const nav = document.getElementById('day-nav');
  nav.innerHTML = days.map((d,i)=>{
    const id = encodeURIComponent(d.name);
    const parts = d.name.split(' ');
    const label = parts && parts[1] ? `${parts} ${parts[1]}` : d.name;
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
