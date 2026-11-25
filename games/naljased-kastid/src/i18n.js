// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Näljased kastid', 'Hungry Boxes'],
  'ui.tagline': ['Iga kast sööb oma asju!', 'Each box eats its own things!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'tip.go': ['Lohista iga asi õigesse kasti!', 'Drag each thing into the right box!'],
  'tip.first': ['Lohista pall sama värvi kasti!', 'Drag the ball into the box of the same colour!'],
  'tip.color': ['Iga kast sööb ainult oma värvi asju.', 'Each box only eats things of its own colour.'],
  'tip.kind': ['Loomad ühte kasti, sõidukid teise!', 'Animals in one box, vehicles in the other!'],
  'tip.home': ['Kes elab maal, kes vees, kes lendab?', 'Who lives on land, who in water, who flies?'],
  'tip.home2': ['Sõidukid ka: maal, vees või õhus?', 'Vehicles too: on land, on water or in the air?'],
  'tip.size': ['Suured asjad suurde kasti, väikesed väikesse!', 'Big things in the big box, small things in the small one!'],
  'tip.size2': ['Värv ei loe, ainult suurus!', 'Colour does not matter, only size!'],
  'tip.shape': ['Vaata küpsise kuju!', 'Look at the shape of the cookie!'],
  'tip.spots': ['Loe lepatriinu täpid!', 'Count the ladybird’s spots!'],
  'tip.two': ['Nüüd loeb kaks asja: värv ja kuju!', 'Two things count now: colour and shape!'],
  'tip.two2': ['Värv ja suurus!', 'Colour and size!'],
  'tip.mystery': ['Mida see kast sööb? Vaata, mis tal juba on!', 'What does each box eat? Look at what it already has!'],
  'tip.waste': ['Prügi sorteerimine! Toidujäätmed ja paber.', 'Sorting rubbish! Food scraps and paper.'],
  'tip.waste2': ['Pakendid lähevad kollasesse kasti.', 'Packaging goes in the yellow bin.'],
  'tip.waste3': ['Klaas läheb rohelisse kasti. Viimane tase!', 'Glass goes in the green bin. The last level!'],
  'oops.yuck': ['Äkk! See kast seda ei söö.', 'Yuck! This box does not eat that.'],
  'win.title': ['Kõik kõhud on täis!', 'All the tummies are full!'],
  'win.final': ['Kõik on sorteeritud! Oled tõeline sorteerija!', 'Everything is sorted! You are a real sorter!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.hint': ['Vihje', 'Hint'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine tase', 'Next level'],
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
