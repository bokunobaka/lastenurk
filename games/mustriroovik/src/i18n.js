// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Mustriröövik', 'Pattern Caterpillar'],
  'ui.tagline': ['Mis tuleb järgmisena?', 'What comes next?'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'tip.go': ['Täida röövikul augud!', 'Fill the gaps in the caterpillar!'],
  'tip.first': ['Punane, sinine, punane… Mis tuleb järgmisena?', 'Red, blue, red… What comes next?'],
  'tip.tail': ['Röövikul on saba otsast puudu! Mis sinna käib?', 'The end of the tail is missing! What goes there?'],
  'tip.middle': ['Nüüd on auk keskel. Vaata, mis on enne ja pärast!', 'Now the gap is in the middle. Look before and after it!'],
  'tip.abc': ['Kolm värvi käivad kordamööda!', 'Three colours take turns!'],
  'tip.aab': ['Kaks ühesugust, siis üks teistsugune.', 'Two the same, then a different one.'],
  'tip.gaps': ['Kaks auku! Puuduta röövikut, siis ta laulab oma mustri.', 'Two gaps! Tap the caterpillar and it sings its pattern.'],
  'tip.aabb': ['Kaks ja kaks!', 'Two and two!'],
  'tip.many': ['Kolm auku!', 'Three gaps!'],
  'tip.sym': ['Nüüd on kõik lülid ühte värvi. Vaata pilte!', 'Now every segment is the same colour. Look at the pictures!'],
  'tip.shape': ['Ring, kolmnurk, ruut…', 'Circle, triangle, square…'],
  'tip.size': ['Suur, väike, suur…', 'Big, small, big…'],
  'tip.size2': ['Suur, suur, väike…', 'Big, big, small…'],
  'tip.dots': ['Loe täpid!', 'Count the dots!'],
  'tip.dots2': ['Üks, kaks, kolm…', 'One, two, three…'],
  'tip.arrow': ['Kuhu nool näitab?', 'Which way does the arrow point?'],
  'tip.turn': ['Nool keerab ringi!', 'The arrow turns round and round!'],
  'tip.both': ['Vaata värvi ja pilti korraga!', 'Look at the colour and the picture together!'],
  'tip.both2': ['Värv ja suurus muutuvad mõlemad!', 'The colour and the size both change!'],
  'tip.grow': ['Iga kord üks täpp juurde!', 'One more dot each time!'],
  'tip.grow2': ['Siniseid tuleb järjest rohkem!', 'More and more blue ones!'],
  'tip.down': ['Nüüd loeme tagurpidi!', 'Now we count backwards!'],
  'tip.wrong': ['Üks lüli on vale! Leia ja puuduta seda.', 'One segment is wrong! Find it and tap it.'],
  'tip.wrong2': ['Jälle üks vale lüli! Kus see on?', 'Another wrong segment! Where is it?'],
  'tip.wrong3': ['Üks vale lüli ja üks auk.', 'One wrong segment and one gap.'],
  'tip.last': ['Viimane tase! Vale lüli ja auk, ja nool keerab.', 'The last level! A wrong segment, a gap, and the arrow turns.'],
  'oops.no': ['Hmm, see ei sobi siia.', 'Hmm, that does not fit here.'],
  'oops.right': ['See lüli on õige. Otsi edasi!', 'That segment is right. Keep looking!'],
  'oops.first': ['Leia enne vale lüli!', 'First find the wrong segment!'],
  'msg.gone': ['Vale lüli on läinud! Pane õige asemele.', 'The wrong segment is gone! Put the right one in.'],
  'win.title': ['Muster on valmis!', 'The pattern is complete!'],
  'win.final': ['Röövikust sai liblikas!', 'The caterpillar became a butterfly!'],
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
