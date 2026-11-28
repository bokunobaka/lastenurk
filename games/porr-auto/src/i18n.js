// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Põrr-auto', 'Vroom Car'],
  'ui.tagline': ['Kalluta ja sõida!', 'Tilt and drive!'],
  'ui.play': ['▶ Sõida', '▶ Drive'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'ui.how': ['📱 Kalluta, et keerata – või vea sõrmega', '📱 Tilt to steer – or drag a finger'],
  'ui.howKeys': ['⬅️ ➡️ nooleklahvid või hiirega vedamine', '⬅️ ➡️ arrow keys, or drag with the mouse'],
  'ui.noTilt': ['Kallutamine ei ole lubatud: vea sõrmega.', 'Tilting is not allowed: drag a finger.'],
  'ui.endless': ['∞ Lõputu sõit', '∞ Endless drive'],
  'ui.endlessGo': ['Sõida nii kaugele kui tahad! Korja tähti.', 'Drive as far as you like! Collect the stars.'],
  'land.meadow': ['Aas', 'The meadow'],
  'land.town': ['Linn', 'The town'],
  'land.forest': ['Mets', 'The forest'],
  'land.beach': ['Rand', 'The beach'],
  'land.farm': ['Talu', 'The farm'],
  'land.snow': ['Lumemaa', 'Snowland'],
  'land.desert': ['Kõrb', 'The desert'],
  'land.night': ['Öö', 'Night-time'],
  'land.mountain': ['Mäed', 'The mountains'],
  'land.rainbow': ['Vikerkaar', 'The rainbow'],
  'ui.go': ['Sõidame {to}!', 'Let’s drive {to}!'],
  'to.grandma': ['vanaema juurde', 'to Grandma’s'],
  'to.playground': ['mänguväljakule', 'to the playground'],
  'to.shop': ['poodi', 'to the shop'],
  'to.farm': ['tallu', 'to the farm'],
  'to.beach': ['randa', 'to the beach'],
  'to.hut': ['mäeonni', 'to the mountain hut'],
  'to.icecream': ['jäätisekioski juurde', 'to the ice cream stand'],
  'to.lighthouse': ['tuletorni juurde', 'to the lighthouse'],
  'to.castle': ['lossi', 'to the castle'],
  'tip.first': ['Korja tähti! Kalluta või vea sõrmega.', 'Collect the stars! Tilt or drag a finger.'],
  'tip.curves': ['Tee keerutab. Hoia teele!', 'The road winds. Stay on it!'],
  'tip.cones': ['Koonused! Sõida neist mööda.', 'Cones! Drive around them.'],
  'tip.cars': ['Aeglane auto ees? Vajuta 📯 ja ta annab teed!', 'A slow car ahead? Press 📯 and it moves aside!'],
  'tip.ducks': ['Pardid lähevad üle tee. Sõida ettevaatlikult!', 'Ducks are crossing. Drive carefully!'],
  'tip.ramps': ['Hüppelaud! Sõida peale ja hopp!', 'A ramp! Drive onto it and jump!'],
  'tip.cows': ['Lehmad tee peal! Ammuu!', 'Cows on the road! Moo!'],
  'tip.snow': ['Lumi on libe. Keera varakult!', 'Snow is slippery. Turn early!'],
  'tip.desert': ['Kõrb! Kivid ja kaktused.', 'The desert! Rocks and cacti.'],
  'tip.night': ['Öö! Tuled põlevad.', 'Night-time! Lights on.'],
  'tip.mountain': ['Kitsas mägitee. Ettevaatust!', 'A narrow mountain road. Careful!'],
  'tip.last': ['Vikerkaaretee lossi juurde!', 'The rainbow road to the castle!'],
  'win.title': ['Kohal!', 'We made it!'],
  'win.endless': ['Hästi sõidetud!', 'Great driving!'],
  'win.record': ['Uus rekord!', 'New record!'],
  'win.final': ['Lossis! Kõik sõidud on sõidetud!', 'At the castle! Every drive done!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.honk': ['Signaal', 'Honk'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.home': ['Avalehele', 'Back to the start'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine tase', 'Next level'],
  'aria.color': ['Auto värv', 'Car colour'],
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
