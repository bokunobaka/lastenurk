// "Printsess Frida rannas" — Frida's family day at the seaside. Drawings in beach-scenes.js.
// Each page may set its own v2 motion: camera [[scale, x%, y%] from, to], particles, stickers [[text, colour, x%, y%]].
// `text` is Estonian, `en` the English shown when the reader picks EN. Media/narration: web/beach/media|audio/pNN.*

const TITLE = "Printsess Frida rannas";
const TITLE_EN = "Princess Frida at the Beach";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida rannas",
    en: "Princess Frida at the Beach",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "glitter",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" },
    text: "Hommikul paistis päike eriti soojalt. „Täna läheme randa!” hüüdis Frida ja hüppas voodist välja.",
    en: "In the morning the sun shone extra warm. “Today we’re going to the beach!” shouted Frida and jumped out of bed.",
    camera: [[1, 50, 50], [1.14, 30, 45]], particles: "bokeh",
  },
  {
    scene: "pack",
    text: "Ema pakkis kotti rätikud ja päikesekreemi. Isa võttis kaasa labidad, ämbrid ja suure täispuhutava rõnga.",
    en: "Mum packed towels and sun cream. Dad brought spades, buckets and a big inflatable ring.",
    camera: [[1.12, 30, 60], [1.12, 66, 60]], particles: "petal",
  },
  {
    scene: "arrive",
    chapter: { title: "Rand", en: "The beach", icon: "wave" },
    text: "Rannas oli liiv soe ja meri sinine. Uku jooksis paljajalu ja kilkas: „Liiv kõdistab!”",
    en: "At the beach the sand was warm and the sea was blue. Uku ran barefoot and squealed: “The sand tickles!”",
    camera: [[1, 50, 50], [1.12, 55, 62]], particles: "bokeh",
  },
  {
    scene: "suncream",
    text: "Kõigepealt määris ema kõigile päikesekreemi. Ka ninaotsale! Nüüd ei saa päike nahka kõrvetada.",
    en: "First Mum put sun cream on everyone. Even on the tip of the nose! Now the sun can’t burn their skin.",
    camera: [[1.16, 45, 50], [1.04, 50, 52]], particles: "bokeh",
  },
  {
    scene: "sandcastle",
    text: "Frida ja isa ehitasid suure liivalossi. Sellel olid tornid, müür ja vallikraav. Kõige kõrgemas tornis lehvis lipp.",
    en: "Frida and Dad built a big sandcastle. It had towers, a wall and a moat. A flag waved on the tallest tower.",
    camera: [[1.04, 50, 55], [1.18, 52, 60]], particles: "glitter",
  },
  {
    scene: "wave",
    text: "Siis tuli suur laine – plärts! Loss sai märjaks ja vajus kokku. Frida naeris: „Ehitame uue!”",
    en: "Then a big wave came – splat! The castle got wet and slumped down. Frida laughed: “Let’s build a new one!”",
    camera: [[1.14, 60, 55], [1.02, 50, 50]], particles: "bubble",
    stickers: [["PLÄRTS!", "#2f9bff", 66, 18]],
  },
  {
    scene: "crab",
    text: "Kivi alt tuli välja väike punane krabi. Ta kõndis külg ees! Uku proovis ka külg ees kõndida ja kukkus pehmesse liiva.",
    en: "A little red crab came out from under a rock. It walked sideways! Uku tried walking sideways too and fell into the soft sand.",
    camera: [[1.2, 40, 70], [1.06, 50, 60]], particles: "bokeh",
  },
  {
    scene: "swim",
    chapter: { title: "Vees", en: "In the water", icon: "wave" },
    text: "Frida läks koos isaga vette. Ta hoidis kõvasti rõngast kinni ja sulistas jalgadega: sulpsti-sulpsti!",
    en: "Frida went into the water with Dad. She held on tight to the ring and kicked her legs: splosh-splosh!",
    camera: [[1.1, 40, 55], [1.1, 62, 55]], particles: "bubble",
    stickers: [["SULPSTI!", "#2f9bff", 30, 18]],
  },
  {
    scene: "buried",
    text: "Uku tahtis liiva sisse peitu minna. Ema kattis ta liivaga kuni kaelani. Välja paistis ainult naerev nägu!",
    en: "Uku wanted to hide in the sand. Mum covered him with sand right up to his neck. Only his laughing face peeked out!",
    camera: [[1, 50, 50], [1.2, 52, 66]], particles: "bokeh",
  },
  {
    scene: "lunch",
    chapter: { title: "Lõunaaeg", en: "Lunchtime", icon: "bowl" },
    text: "Lõunaks sõid nad päikesevarju all võileibu. Üks julge kajakas tuli lähemale: „Kää-kää!” Aga Frida hoidis võileiba kõvasti kinni.",
    en: "For lunch they ate sandwiches under the sunshade. A cheeky seagull came closer: “Squawk!” But Frida held on tight to her sandwich.",
    camera: [[1.12, 40, 55], [1.12, 66, 50]], particles: "bokeh",
    stickers: [["KÄÄ-KÄÄ!", "#ff8a00", 76, 16]],
  },
  {
    scene: "shells",
    text: "Pärast sööki korjasid Frida ja Uku karpe ja siledaid kivikesi. Kõige ilusam karp oli roosa nagu Frida kleit.",
    en: "After eating, Frida and Uku collected shells and smooth pebbles. The prettiest shell was pink like Frida’s dress.",
    camera: [[1, 50, 50], [1.16, 46, 68]], particles: "glitter",
  },
  {
    scene: "icecream",
    text: "Rannakioskist sai jäätist. See sulas nii kiiresti, et pidi ruttu limpsima. Limps-limps!",
    en: "They got ice cream from the beach kiosk. It melted so fast that they had to lick it quickly. Lick-lick!",
    camera: [[1.12, 40, 55], [1.04, 55, 52]], particles: "confetti",
    stickers: [["LIMPS-LIMPS!", "#ff5c8a", 30, 18]],
  },
  {
    scene: "sunset",
    chapter: { title: "Õhtu", en: "Evening", icon: "moon" },
    text: "Õhtul läks päike punaseks ja vajus vaikselt merre. „Head ööd, meri!” lehvitas Frida.",
    en: "In the evening the sun turned red and slowly sank into the sea. “Good night, sea!” waved Frida.",
    camera: [[1, 50, 50], [1.14, 58, 55]], particles: "firefly",
  },
  {
    scene: "bedtime",
    text: "Kodus voodis jäi Frida kohe magama. Unes kuulis ta veel lainete kohinat. Head ööd!",
    en: "At home in bed Frida fell asleep straight away. In her dreams she could still hear the waves. Good night!",
    camera: [[1, 50, 50], [1.18, 30, 72]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "star",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD, assets: "beach/" };
