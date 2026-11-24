// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Rong Tuut', 'Tuut the Train'],
  'ui.tagline': ['Keera rööpad õigeks!', 'Turn the tracks the right way!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'tip.go': ['Keera rööpad, et rong jõuaks jaama!', 'Turn the tracks so the train gets to the station!'],
  'tip.first': ['Puuduta rööbast, et seda keerata. Siis vajuta ▶!', 'Tap a track to turn it. Then press ▶!'],
  'tip.curve': ['Kõverad rööpad keeravad rongi!', 'Curved tracks turn the train!'],
  'tip.extra': ['Kõiki rööpaid pole vaja!', 'You don’t need every track!'],
  'tip.cross': ['Ristmikul sõidab rong otse edasi.', 'At a crossing the train goes straight on.'],
  'tip.three': ['Kolm sõpra ootavad!', 'Three friends are waiting!'],
  'tip.two': ['Kaks pööret! Kumba teed pidi?', 'Two switches! Which way?'],
  'tip.bridge': ['Sild üle vee! Ka silda saab keerata.', 'A bridge over the water! Bridges turn too.'],
  'tip.tunnel': ['Rong sõidab tunnelisse ja tuleb teisest otsast välja!', 'The train goes into the tunnel and comes out the other end!'],
  'tip.double': ['Sellel klotsil on kaks kõverat rada.', 'This piece has two curved tracks.'],
  'tip.switch': ['Sinine klots on pööre: puuduta ja rong valib teise tee!', 'The blue piece is a switch: tap it and the train takes the other way!'],
  'tip.last': ['Viimane tase! Kõik koos: sild, tunnel ja pööre.', 'The last level! All together: bridge, tunnel and switch.'],
  'tip.lit': ['Kollased rööpad on juba ühendatud.', 'The yellow tracks are already joined up.'],
  'win.title': ['Tuut-tuut! Kohal!', 'Toot toot! We’re here!'],
  'win.final': ['Kõik tasemed läbi! Kõik sõbrad on kohal!', 'Every level done! All the friends are here!'],
  'oops.stop': ['Rööpad lõppesid! Keera veel.', 'The track ran out! Turn some more.'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.hint': ['Vihje', 'Hint'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.run': ['Sõida', 'Go'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine tase', 'Next level'],
  'aria.turn': ['Keera rööbast', 'Turn the track'],
};

function pickLang() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'et' || q === 'en') return q;
  try {
    return localStorage.getItem('lastenurk.lang') === 'en' ? 'en' : 'et';
  } catch {
    return 'et';
  }
}

export let lang = pickLang();

export function setLang(l) {
  lang = l;
  try {
    localStorage.setItem('lastenurk.lang', l);
  } catch {}
  applyText();
}

export function t(key, vars = {}) {
  const e = L[key];
  let s = e ? e[lang === 'en' ? 1 : 0] : key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

// fills every [data-i18n] text and [data-i18n-aria] label on the page
export function applyText() {
  document.documentElement.lang = lang;
  document.title = t('ui.title');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
}
