// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Lepatriinu labürint', 'Ladybug Maze'],
  'ui.tagline': ['Kalluta ja veereta!', 'Tilt and roll!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'ui.how': ['📱 Kalluta tahvlit – või vea sõrmega', '📱 Tilt the tablet – or drag a finger'],
  'ui.howKeys': ['⬅️ ⬆️ ➡️ ⬇️ nooleklahvid või hiirega vedamine', '⬅️ ⬆️ ➡️ ⬇️ arrow keys, or drag with the mouse'],
  'ui.noTilt': ['Kallutamine ei ole lubatud: vea sõrmega.', 'Tilting is not allowed: drag a finger.'],
  'ui.notYet': ['Lill on veel kinni. Korja enne kõik täpid!', 'The flower is still shut. Find all the spots first!'],
  'ui.oops': ['Plumps! Uuesti algusest – täpid jäävad alles.', 'Plop! Back to the start – she keeps her spots.'],
  'ui.open': ['Kõik täpid käes! Lill läks lahti – veereta koju!', 'All the spots! The flower opened – roll home!'],
  'tip.first': ['Lepatriinu kaotas täpid! Kalluta tahvlit ja korja need üles.', 'The ladybug lost her spots! Tilt the tablet and pick them up.'],
  'tip.walls': ['Põõsad on ees. Veereta ümber!', 'Hedges in the way. Roll around them!'],
  'tip.maze': ['Väike labürint. Kust läbi saab?', 'A little maze. Which way goes through?'],
  'tip.maze2': ['Suurem labürint!', 'A bigger maze!'],
  'tip.holes': ['Ettevaatust, augud! Veereta neist mööda.', 'Careful, holes! Roll around them.'],
  'tip.holes2': ['Veel auke. Aeglaselt ja ettevaatlikult!', 'More holes. Slowly and carefully!'],
  'tip.mush': ['Seened põrgatavad – boing!', 'Mushrooms bounce – boing!'],
  'tip.ice': ['Jää on libe! Lepatriinu libiseb.', 'Ice is slippery! The ladybug slides.'],
  'tip.ice2': ['Libe jää ja augud. Ettevaatust!', 'Slippery ice and holes. Careful!'],
  'tip.honey': ['Mesi on kleepuv. Siin läheb aeglaselt.', 'Honey is sticky. It is slow going here.'],
  'tip.gate': ['Veereta lillele – värav läheb lahti!', 'Roll onto the flower – the gate opens!'],
  'tip.gate2': ['Kaks väravat. Igal oma värvi lill.', 'Two gates. Each has a flower of its own colour.'],
  'tip.mix': ['Augud ja värav.', 'Holes and a gate.'],
  'tip.pinball': ['Jää ja seened – põrka!', 'Ice and mushrooms – bounce!'],
  'tip.careful': ['Mesi ja augud. Pole kiiret.', 'Honey and holes. No hurry.'],
  'tip.gates': ['Leia lilled, mis väravad avavad.', 'Find the flowers that open the gates.'],
  'tip.slide': ['Libedad jääteed.', 'Slippery ice paths.'],
  'tip.bumpy': ['Seened ja augud igal pool!', 'Mushrooms and holes everywhere!'],
  'tip.big': ['Mesi, jää ja kaks väravat.', 'Honey, ice and two gates.'],
  'tip.last': ['Seitse täppi – siis on ta päris seitsmetäpiline lepatriinu!', 'Seven spots – then she is a real seven-spot ladybug!'],
  'win.title': ['Kodus!', 'Home!'],
  'win.final': ['Kõik seitse täppi on tagasi!', 'All seven spots are back!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.spots': ['Täpid', 'Spots'],
  'aria.home': ['Avalehele', 'Back to the start'],
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
