// All words the game shows. Estonian by default; English with ?lang=en or the language picked on
// the lastenurk landing page (localStorage "lastenurk.lang"). Every entry is [estonian, english].
// The player is 4-6 and does not read yet: the words are for the grown-up next to them.

const L = {
  'ui.title': ['Konn Krooks', 'Krooks the Frog'],
  'ui.tagline': ['Hüppa, loe ja püüa kärbes!', 'Hop, count and catch the fly!'],
  'ui.play': ['▶ Mängi', '▶ Play'],
  'ui.level': ['Tase {n}', 'Level {n}'],
  'tip.go': ['Hüppa kärbse juurde!', 'Jump to the fly!'],
  'tip.first': ['Puuduta kaarti: konn hüppab!', 'Tap the card: the frog jumps!'],
  'tip.pick': ['Mitu hüpet on kärbseni? Vali õige kaart!', 'How many jumps to the fly? Pick the right card!'],
  'tip.start': ['Konn ei alusta nullist. Loe edasi!', 'The frog does not start at zero. Count on!'],
  'tip.back': ['Kärbes on taga! Miinus hüppab tagasi.', 'The fly is behind! Minus jumps back.'],
  'tip.two': ['Ühest kaardist ei piisa. Võta kaks!', 'One card is not enough. Use two!'],
  'tip.mix': ['Edasi ja tagasi!', 'Forward and back!'],
  'tip.gap': ['Mõni leht on puudu. Vali hea järjekord!', 'Some lily pads are missing. Pick a good order!'],
  'tip.twenty': ['Nüüd on lehti kahekümneni!', 'Now the lily pads go up to twenty!'],
  'tip.last': ['Viimane tase! Mõtle enne läbi.', 'The last level! Think it through first.'],
  'oops.edge': ['Nii kaugele ei saa hüpata!', 'The frog cannot jump that far!'],
  'oops.splash': ['Plartsti! Seal pole lehte.', 'Splash! There is no lily pad there.'],
  'oops.stuck': ['Siit ei jõua kärbseni. Vajuta ↺!', 'The fly cannot be reached from here. Press ↺!'],
  'win.title': ['Krooks! Kärbes käes!', 'Croak! Got the fly!'],
  'win.final': ['Kõik kärbsed püütud! Konn on nii rõõmus!', 'Every fly caught! The frog is so happy!'],
  'aria.corner': ['Tagasi lastenurka', 'Back to the kids’ corner'],
  'aria.levels': ['Tasemed', 'Levels'],
  'aria.hint': ['Vihje', 'Hint'],
  'aria.sound': ['Heli', 'Sound'],
  'aria.undo': ['Hüppa tagasi', 'Jump back'],
  'aria.again': ['Uuesti', 'Again'],
  'aria.next': ['Järgmine tase', 'Next level'],
  'aria.plus': ['pluss {n}', 'plus {n}'],
  'aria.minus': ['miinus {n}', 'minus {n}'],
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
