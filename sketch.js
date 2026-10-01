/* p5.js 1.11.3. Karte: p5-Canvas; Filter, Punkte und Infokarte:
   HTML-Elemente für scharfe Typografie, Tastatur- und Touchbedienung. */
const KATEGORIEN = ['Alle', 'Forschung', 'Humanitär & Sozial', 'Kinder & junge Menschen', 'Kultur', 'Natur', 'Senioren'];
const KARTENBILD = 'assets/hamburg.png';
let filter = 'Alle';
let auswahl = null; // Für einen bereits geöffneten Infokasten: 'koerner'
let karte, punkte, info, status, koordinaten, kartenbild;
let bildGeladen = false;
let bildFehler = false;

function setup() {
  installStyles();
  const app = document.createElement('main');
  app.className = 'wirkungskarte';
  app.innerHTML = `
    <aside class="intro">
      <div><p class="eyebrow">Die Wirkungskarte</p><h1>Stiftungen<br>im Blick</h1></div>
      <p class="beschreibung">Ein Einblick in das Engagement, das unsere Stadt prägt. Hinter jedem Punkt auf der Karte steht eine Initiative, ein Ausblick auf das, was Menschen bewegen können, wenn sie etwas verändern wollen – und es tun.</p>
    </aside>
    <section class="inhalt" aria-label="Stiftungen in Hamburg">
      <nav class="filter" aria-label="Nach Kategorie filtern"></nav>
      <div class="karte"><div class="punkte" role="group" aria-label="Stiftungen auf der Karte"></div>
        <article class="info" hidden aria-label="Informationen zur Stiftung"></article>
      </div>
      <p class="sr-only" role="status" aria-live="polite"></p>
      <output class="koordinaten" hidden></output>
    </section>`;
  document.body.appendChild(app);
  karte = app.querySelector('.karte');
  punkte = app.querySelector('.punkte');
  info = app.querySelector('.info');
  status = app.querySelector('[role="status"]');
  koordinaten = app.querySelector('.koordinaten');
  for (const kategorie of KATEGORIEN) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = kategorie;
    button.dataset.kategorie = kategorie;
    button.addEventListener('click', () => {
      filter = kategorie;
      if (!sichtbareStiftungen().some(s => s.id === auswahl)) auswahl = null;
      aktualisieren();
    });
    app.querySelector('.filter').appendChild(button);
  }
  const canvas = createCanvas(karte.clientWidth, karte.clientWidth * 2 / 3);
  canvas.parent(karte);
  canvas.elt.setAttribute('aria-hidden', 'true');
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
  noLoop();
  // Native Image vermeidet Abhängigkeiten von p5-preload-Versionen.
  kartenbild = new Image();
  kartenbild.onload = () => { bildGeladen = true; redraw(); };
  kartenbild.onerror = () => { bildFehler = true; redraw(); };
  kartenbild.src = KARTENBILD;
  new ResizeObserver(() => {
    resizeCanvas(karte.clientWidth, karte.clientWidth * 2 / 3);
  }).observe(karte);
  karte.addEventListener('click', event => {
    if (event.target.closest('.info, .punkt')) return;
    if (event.shiftKey) {
      const rect = karte.getBoundingClientRect();
      koordinaten.hidden = false;
      koordinaten.textContent = `Neue Position: x: ${((event.clientX - rect.left) / rect.width).toFixed(3)}, y: ${((event.clientY - rect.top) / rect.height).toFixed(3)}`;
    } else {
      auswahl = null;
      aktualisieren();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && auswahl) schliessen();
  });
  const mobil = window.matchMedia('(max-width:600px)');
  function positioniereInfo() {
    if (mobil.matches) karte.after(info);
    else karte.appendChild(info);
  }
  mobil.addEventListener('change', positioniereInfo);
  positioniereInfo();
  aktualisieren();
}

function draw() {
  background('#e1edbd');
  if (bildGeladen) drawingContext.drawImage(kartenbild, 0, 0, width, height);
  else {
    fill('#42501f'); noStroke(); textAlign(CENTER, CENTER); textSize(16);
    text(bildFehler ? 'Kartenbild fehlt: assets/hamburg.png prüfen.' : 'Karte wird geladen …', width / 2, height / 2);
  }
}

function sichtbareStiftungen() {
  return STIFTUNGEN.filter(s => filter === 'Alle' || s.kategorien.includes(filter));
}

function aktualisieren() {
  document.querySelectorAll('[data-kategorie]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.kategorie === filter));
  });
  // Bestehende Buttons behalten, damit der Tastaturfokus erhalten bleibt.
  for (const stiftung of STIFTUNGEN) {
    let button = [...punkte.children].find(b => b.dataset.id === stiftung.id);
    if (!button) {
      button = document.createElement('button');
      button.type = 'button'; button.className = 'punkt';
      button.dataset.id = stiftung.id;
      button.style.left = `${stiftung.x * 100}%`;
      button.style.top = `${stiftung.y * 100}%`;
      button.title = stiftung.name;
      button.setAttribute('aria-label', stiftung.name);
      button.addEventListener('click', () => {
        auswahl = auswahl === stiftung.id ? null : stiftung.id;
        aktualisieren();
      });
      punkte.appendChild(button);
    }
    button.hidden = filter !== 'Alle' && !stiftung.kategorien.includes(filter);
    button.setAttribute('aria-expanded', String(auswahl === stiftung.id));
    button.setAttribute('aria-controls', 'stiftungsinfo');
  }
  const stiftung = STIFTUNGEN.find(s => s.id === auswahl);
  info.id = 'stiftungsinfo';
  info.hidden = !stiftung;
  info.replaceChildren();
  status.textContent = `${sichtbareStiftungen().length} Stiftungen angezeigt. ${stiftung ? stiftung.name + ' ausgewählt.' : ''}`;
  if (!stiftung) return;
  // Auf der gegenüberliegenden Seite öffnen, damit der rote Punkt sichtbar bleibt.
  info.classList.toggle('links', stiftung.x > .60);
  const close = document.createElement('button');
  close.type = 'button'; close.className = 'schliessen'; close.textContent = '×';
  close.setAttribute('aria-label', 'Infokasten schließen');
  close.addEventListener('click', schliessen);
  info.appendChild(close);
  addText('p', stiftung.kategorien.join(' · '), 'kategorie');
  addText('h2', stiftung.name);
  addText('h3', 'Schwerpunkte'); addText('p', stiftung.schwerpunkte);
  addText('h3', 'Geförderte Projekte'); addText('p', stiftung.projekte);
  if (stiftung.url && /^https?:\/\//i.test(stiftung.url)) {
    addText('h3', 'Weiterlesen');
    const link = document.createElement('a');
    link.href = stiftung.url;
    link.textContent = 'Zum vollständigen Stiftungsportrait →';
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    info.appendChild(link);
  }
}

function addText(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text; element.className = className; info.appendChild(element);
}

function schliessen() {
  const vorher = auswahl;
  auswahl = null; aktualisieren();
  [...punkte.children].find(b => b.dataset.id === vorher)?.focus();
}

function installStyles() {
  const style = document.createElement('style');
  style.textContent = `
  @font-face {
  font-family: 'SeasonSans';
  src: url('assets/SeasonSansMedium.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SeasonMix';
  src: url('assets/SeasonMixRegular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
    :root { --olive:#42501f; --gruen:#e1edbd; --rot:#f26464; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--olive); background:white; font-family:SeasonSans, sans-serif; }
    button,a { -webkit-tap-highlight-color:transparent; }
    button { font:inherit; cursor:pointer; }
    [hidden] { display:none!important; }
    .wirkungskarte { display:grid; grid-template-columns:24% minmax(0,1fr); gap:1.55vw; padding:2.25vw 1.77vw 1.6vw 1.4vw; max-width:2200px; margin:auto; }
    .intro { padding-top:4.5vw; display:flex; flex-direction:column; justify-content:space-between; }
    .eyebrow { display:table; font-size:1.48vw; border-bottom:3px solid var(--olive); margin:0 0 1.9vw; }
    h1 { font-family:SeasonMix , serif; font-weight:400; font-size:5.45vw; line-height:.97; letter-spacing:-.22vw; margin:0; }
    .beschreibung { font-size:1.35vw; line-height:1.24; text-align:right; margin:3rem 0 0; }
    .filter { display:flex; gap:.6vw; align-items:center; justify-content:space-between; margin:0 0 1.65vw; min-height:2.6vw; }
    .filter button { white-space:nowrap; border:2px solid var(--olive); border-radius:999px; background:white; color:var(--olive); text-transform:uppercase; padding:.5vw 1.1vw; font-size:1.12vw; }
    .filter button[aria-pressed=true] { background:var(--olive); color:var(--gruen); font-weight:700; }
    .filter button:hover { background:var(--gruen); color:var(--olive); }
    .karte { position:relative; aspect-ratio:3/2; background:var(--gruen); isolation:isolate; }
    canvas { display:block; position:absolute; inset:0; width:100%!important; height:100%!important; z-index:0; }
    .punkte { position:absolute; inset:0; z-index:1; pointer-events:none; }
    .punkt { position:absolute; width:44px; height:44px; transform:translate(-50%,-50%); border:0; padding:0; background:transparent; pointer-events:auto; display:grid; place-items:center; }
    .punkt::after { content:''; width:clamp(16px,1.74vw,36px); height:clamp(16px,1.74vw,36px); border-radius:50%; background:var(--olive); transition:transform .15s; }
    .punkt:hover::after { transform:scale(1.15); }
    .punkt[aria-expanded=true]::after { background:var(--rot); }
    button:focus-visible,a:focus-visible { outline:3px solid var(--rot); outline-offset:4px; }
    .info { position:absolute; z-index:2; right:2.7%; top:3.4%; width:31%; max-height:93%; overflow:auto; padding:2.1vw 1.55vw; background:var(--olive); color:white; border-radius:8px; box-shadow:0 2px 5px #0003; }
    .info.links { right:auto; left:2.7%; }
    /* Infobox: Zwischenüberschriften 10 pt, Beschreibungen 12 pt. */
    .info { --info-label:10pt; --info-text:calc(var(--info-label) + 2pt); }
    .info .kategorie {
      font-family:'SeasonSans', sans-serif; font-size:var(--info-label);
      text-transform:uppercase; font-weight:400; line-height:1.3;
      margin:0 24px 32px 0;
    }
    .info h2 {
      font-family:'SeasonMix', serif; font-weight:400;
      font-size:18pt; line-height:1.15; margin:0 0 24px;
    }
    .info h3 {
      /* Gleiche Schrift, Großschreibung und Gewichtung wie inaktiver Filter. */
      font-family:'SeasonSans', sans-serif; font-weight:400;
      font-size:var(--info-label); text-transform:uppercase;
      line-height:1.3; letter-spacing:normal; margin:24px 0 6px;
    }
    .info p:not(.kategorie), .info a {
      font-family:'SeasonSans', sans-serif; font-weight:400;
      font-size:var(--info-text); line-height:1.4; margin:0; color:white;
    }
    .info a { text-decoration:none; }
    .info a:hover { text-decoration:underline; }
    .schliessen {
      position:absolute; top:8px; right:8px;
      width:36px; height:36px; padding:0;
      display:grid; place-items:center;
      appearance:none; border:none; border-radius:0;
      background:transparent; box-shadow:none;
      color:white; font-family:Arial,sans-serif;
      font-size:28px; font-weight:400; line-height:1; cursor:pointer;
    }
    .schliessen:hover { background:transparent; color:var(--gruen); }
    /* Nur bei Tastaturbedienung den Fokus sichtbar markieren. */
    .schliessen:not(:focus-visible) { outline:none; }
    .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
    .koordinaten { display:block; padding:12px; background:var(--gruen); font-family:monospace; }
    @media(max-width:900px) {
      .wirkungskarte { display:block; padding:20px; }
      .intro { padding:0; } .eyebrow { font-size:18px; margin-bottom:18px; }
      h1 { font-size:64px; letter-spacing:-2px; }
      .beschreibung { text-align:left; font-size:8px; max-width:560px; margin:20px 0 28px; }
      .filter { flex-wrap:wrap; justify-content:flex-start; gap:8px; margin-bottom:18px; }
      .filter button { font-size:12px; padding:10px 14px; }
      .info,.info.links { width:44%; padding:24px 18px; }
      .info .kategorie { margin-bottom:22px; }
      .info h2 { font-size:16pt; margin-bottom:16px; }
      .info h3 { margin:20px 0 6px; }

    }
    @media(max-width:600px) {
      .wirkungskarte { padding:16px; } h1 { font-size:52px; }
      .karte { margin-bottom:0; }
      .info,.info.links { position:relative; top:auto; left:auto; right:auto; width:100%; max-height:none; margin-top:12px; }
      .info .kategorie { margin-bottom:28px; }
    }
    @media(prefers-reduced-motion:reduce) { .punkt::after { transition:none; } }
  `;
  document.head.appendChild(style);
}
