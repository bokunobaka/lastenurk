// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Robot Piiks', 'Robot Piiks'],
  'ui.tagline': ['Mõtle ette, siis sõida!', 'Think ahead, then drive!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'tip.go': ['Vii Piiks aku juurde!', 'Take Piiks to the battery!'],
  'tip.first': ['Puuduta noolt. Siis vajuta ▶!', 'Tap the arrow. Then press ▶!'],
  'tip.star': ['Korja teel täht!', 'Pick up the star on the way!'],
  'tip.up': ['Nüüd saab ka üles minna!', 'Now Piiks can go up too!'],
  'tip.rock': ['Kivi on ees! Mine ümber.', 'A rock is in the way! Go around it.'],
  'tip.left': ['Piiks oskab ka vasakule ja alla!', 'Piiks can go left and down too!'],
  'tip.long': ['Pikk tee! Mõtle enne läbi.', 'A long way! Think it through first.'],
  'tip.repeat': ['Puuduta kaarti: üks kaart, mitu sammu!', 'Tap a card: one card, more steps!'],
  'tip.back': ['Too täht ära ja tule tagasi!', 'Get the star and come back out!'],
  'tip.last': ['Viimane tase! Kaks tähte.', 'The last level! Two stars.'],
  'win.title': ['Hästi tehtud!', 'Well done!'],
  'win.all': ['Kõik tähed käes!', 'All the stars!'],
  'win.final': ['Kõik tasemed läbi! Piiks on nii rõõmus!', 'Every level done! Piiks is so happy!'],
  'oops.bump': ['Põmm! Proovi teist teed.', 'Bump! Try another way.'],
  'oops.short': ['Piiks jäi poolele teele. Lisa veel kaarte!', 'Piiks stopped halfway. Add more cards!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.hint': ['Vihje', 'Hint'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.undo': ['Kustuta viimane kaart', 'Remove the last card'],
  'aria.run': ['Sõida', 'Drive'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine tase', 'Next level'],
  'dir.up': ['üles', 'up'],
  'dir.right': ['paremale', 'right'],
  'dir.down': ['alla', 'down'],
  'dir.left': ['vasakule', 'left'],
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
