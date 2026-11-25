// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Kujundipusle', 'Shape Puzzle'],
  'ui.tagline': ['Pane kujundid oma kohale!', 'Put the shapes in their places!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Pilt {n}', 'Picture {n}'],
  'tip.go': ['Lohista kujundid varju peale!', 'Drag the shapes onto the shadow!'],
  'tip.first': ['Võta kujund ja lohista see oma kohale!', 'Pick up a shape and drag it to its place!'],
  'tip.turn': ['Puuduta kujundit: see keerab!', 'Tap a shape: it turns!'],
  'tip.shadow': ['Nüüd jooni pole. Vaata varju kuju!', 'No lines now. Look at the shape of the shadow!'],
  'tip.extra': ['Üks kujund on üleliigne!', 'One shape does not belong!'],
  'tip.last': ['Viimane pilt! Suur rong.', 'The last picture! A big train.'],
  'oops.turn': ['Peaaegu! Puuduta, et keerata.', 'Almost! Tap it to turn.'],
  'oops.extra': ['See kujund ei sobi siia pilti.', 'This shape is not in the picture.'],
  'oops.nope': ['Proovi teise kohta!', 'Try another place!'],
  'pic.house': ['Maja!', 'A house!'],
  'pic.tree': ['Õunapuu!', 'An apple tree!'],
  'pic.fish': ['Kala!', 'A fish!'],
  'pic.icecream': ['Jäätis!', 'Ice cream!'],
  'pic.car': ['Auto!', 'A car!'],
  'pic.boat': ['Paat!', 'A boat!'],
  'pic.rocket': ['Rakett!', 'A rocket!'],
  'pic.cat': ['Kass!', 'A cat!'],
  'pic.butterfly': ['Liblikas!', 'A butterfly!'],
  'pic.robot': ['Robot!', 'A robot!'],
  'pic.plane': ['Lennuk!', 'A plane!'],
  'pic.castle': ['Loss!', 'A castle!'],
  'pic.chick': ['Tibu!', 'A chick!'],
  'pic.flower': ['Lill!', 'A flower!'],
  'pic.turtle': ['Kilpkonn!', 'A turtle!'],
  'pic.rabbit': ['Jänes!', 'A bunny!'],
  'pic.pinwheel': ['Tuulekeeris!', 'A pinwheel!'],
  'pic.crown': ['Kroon!', 'A crown!'],
  'pic.train': ['Rong!', 'A train!'],
  'win.final': ['Kõik pildid on valmis!', 'Every picture is done!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Pildid', 'Pictures'],
  'aria.hint': ['Vihje', 'Hint'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine pilt', 'Next picture'],
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
