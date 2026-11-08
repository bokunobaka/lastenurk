// "Printsess Frida lõbustuspargis" — Frida's family day at the funfair. Drawings in funfair-scenes.js.
// Each page may set its own v2 motion: camera [[scale, x%, y%] from, to], particles, stickers [[text, colour, x%, y%]].
// `text` is Estonian, `en` the English shown when the reader picks EN. Media/narration: web/funfair/media|audio/pNN.*

const TITLE = "Printsess Frida lõbustuspargis";
const TITLE_EN = "Princess Frida at the Funfair";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida lõbustuspargis",
    en: "Princess Frida at the Funfair",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "confetti",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" },
    text: "Hommikul ütles isa: „Täna on üllatus! Me läheme lõbustusparki!” Frida ja Uku hüppasid rõõmust.",
    en: "In the morning Dad said: “Today there’s a surprise! We’re going to the funfair!” Frida and Uku jumped for joy.",
    camera: [[1, 50, 50], [1.14, 30, 45]], particles: "bokeh",
  },
  {
    scene: "arrive",
    chapter: { title: "Lõbustuspark", en: "The funfair", icon: "star" },
    text: "Lõbustuspargis mängis muusika ja vilkusid tuled. Igal pool oli nii palju vaadata!",
    en: "At the funfair music was playing and lights were flashing. There was so much to see everywhere!",
    camera: [[1, 50, 50], [1.14, 50, 58]], particles: "confetti",
  },
  {
    scene: "carousel",
    text: "Kõigepealt sõitsid nad karusselliga. Frida istus valge hobuse selga ja Uku kollase lõvi selga. Ringiratast, ringiratast!",
    en: "First they rode the carousel. Frida sat on a white horse and Uku on a yellow lion. Round and round and round!",
    camera: [[1.16, 40, 55], [1.04, 55, 50]], particles: "glitter",
  },
  {
    scene: "teacups",
    text: "Siis keerlesid nad suurte teetasside sees. Isa keeras rooli ja tass pöörles – vurr-vurr! Pea hakkas natuke ringi käima.",
    en: "Then they spun round in big teacups. Dad turned the wheel and the cup spun – whirr-whirr! Their heads felt a little dizzy.",
    camera: [[1.1, 45, 55], [1.1, 58, 55]], particles: "confetti",
    stickers: [["VURR-VURR!", "#a66cff", 72, 16]],
  },
  {
    scene: "bumpercars",
    text: "Põrkautodes sõitsid Frida ja ema koos. Põmm! Isa ja Uku sõitsid neile pehmelt otsa. Kõik naersid.",
    en: "Frida and Mum drove a bumper car together. Boom! Dad and Uku bumped into them gently. Everyone laughed.",
    camera: [[1.04, 50, 55], [1.16, 50, 58]], particles: "confetti",
    stickers: [["PÕMM!", "#ff5c8a", 50, 22]],
  },
  {
    scene: "ducks",
    text: "Mängutelgis sai õngega parte püüda. Uku püüdis kollase pardi ja võitis auhinna – väikese kaisukaru!",
    en: "In the games tent you could catch ducks with a fishing rod. Uku caught a yellow duck and won a prize – a little teddy bear!",
    camera: [[1.12, 40, 60], [1.12, 60, 55]], particles: "glitter",
  },
  {
    scene: "candyfloss",
    chapter: { title: "Maiustus", en: "A treat", icon: "bowl" },
    text: "Siis osteti suhkruvatti. See oli roosa ja pehme nagu pilv. Fridal ja Ukul jäid ninad kleepuvaks!",
    en: "Then they bought candyfloss. It was pink and soft like a cloud. Frida’s and Uku’s noses got all sticky!",
    camera: [[1, 50, 50], [1.16, 50, 50]], particles: "bokeh",
  },
  {
    scene: "bigwheel",
    chapter: { title: "Kõrgel", en: "Up high", icon: "star" },
    text: "Vaateratas viis nad kõrgele-kõrgele. Üleval nägid nad kogu parki ja kaugel isegi Frida lossi!",
    en: "The big wheel took them high, high up. From the top they could see the whole park, and far away even Frida’s castle!",
    camera: [[1.1, 50, 70], [1.16, 50, 25]], particles: "bokeh",
  },
  {
    scene: "coaster",
    text: "Siis sõitsid Frida ja isa väikese ameerika mäega. Üles-üles ja siis alla – viuh! „Veel!” hüüdis Frida. Uku oli veel liiga väike ja vaatas emaga alt.",
    en: "Then Frida and Dad rode the little rollercoaster. Up, up and then down – whoosh! “Again!” shouted Frida. Uku was still too small and watched with Mum.",
    camera: [[1.1, 35, 40], [1.1, 65, 55]], particles: "confetti",
    stickers: [["VIUH!", "#2f9bff", 58, 18]],
  },
  {
    scene: "mirrors",
    text: "Peeglimajas olid naljakad peeglid. Ühes oli Frida pikk ja peenike, teises lai ja ümmargune. Hihii!",
    en: "In the house of mirrors there were funny mirrors. In one Frida was tall and thin, in another wide and round. Hee-hee!",
    camera: [[1.14, 35, 50], [1.14, 65, 50]], particles: "glitter",
    stickers: [["HIHII!", "#ff5c8a", 50, 14]],
  },
  {
    scene: "balloons",
    text: "Igaüks sai ühe õhupalli. Uku õhupall tahtis ära lennata, aga isa sai sellest viimasel hetkel kinni!",
    en: "Everyone got a balloon. Uku’s balloon tried to fly away, but Dad caught it just in time!",
    camera: [[1.12, 55, 40], [1.02, 50, 52]], particles: "confetti",
  },
  {
    scene: "lights",
    chapter: { title: "Õhtu", en: "Evening", icon: "moon" },
    text: "Õhtul süttisid pargis tuhanded tuled. Vaateratas helkis nagu suur täht. „Aitäh, isa! See oli parim päev!” ütles Frida.",
    en: "In the evening thousands of lights came on in the park. The big wheel sparkled like a big star. “Thank you, Dad! This was the best day!” said Frida.",
    camera: [[1, 50, 50], [1.14, 50, 55]], particles: "firefly",
  },
  {
    scene: "bedtime",
    text: "Voodis kallistas Uku oma uut kaisukaru. Frida sulges silmad ja tundis, kuidas karussell unes ikka veel ringi käis. Head ööd!",
    en: "In bed Uku hugged his new teddy. Frida closed her eyes and felt the carousel still going round in her dreams. Good night!",
    camera: [[1, 50, 50], [1.18, 30, 72]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "star",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD, assets: "funfair/" };
