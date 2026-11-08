// "Printsess Frida loomaaias" — Frida goes to the zoo with Mum, Dad and her little brother Uku.
// Same engine as the other books (book.js + motion.js); drawings in zoo-scenes.js.
// Each page may set its own v2 motion: camera [[scale, x%, y%] from, to], particles, stickers [[text, colour, x%, y%]].
// `text` is Estonian, `en` the English shown when the reader picks EN.
// Media and narration live in web/zoo/media/pNN.* and web/zoo/audio/pNN.*

const TITLE = "Printsess Frida loomaaias";
const TITLE_EN = "Princess Frida at the Zoo";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida loomaaias",
    en: "Princess Frida at the Zoo",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "glitter",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" },
    text: "Hommikul ärkas printsess Frida varakult. „Täna on eriline päev,” mõtles ta. „Täna läheme loomaaeda!”",
    en: "In the morning Princess Frida woke up early. “Today is a special day,” she thought. “Today we are going to the zoo!”",
    camera: [[1, 50, 50], [1.14, 30, 45]], particles: "bokeh",
  },
  {
    scene: "family",
    text: "Ema pakkis kotti võileivad ja vee. Isa võttis väikevennal Ukul käest kinni. Ja kogu pere läks teele!",
    en: "Mum packed sandwiches and water in a bag. Dad took little brother Uku by the hand. And the whole family set off!",
    camera: [[1.12, 25, 60], [1.12, 70, 60]], particles: "petal",
  },
  {
    scene: "gate",
    chapter: { title: "Loomaaed", en: "The zoo", icon: "longneck" },
    text: "Loomaaia väravas oli palju rõõmsaid inimesi. Uku hüppas ja hüüdis: „Loomad! Lähme loomi vaatama!”",
    en: "There were lots of happy people at the zoo gate. Uku jumped and shouted: “Animals! Let’s go and see the animals!”",
    camera: [[1, 50, 50], [1.14, 50, 60]], particles: "confetti",
  },
  {
    scene: "giraffe",
    text: "Kõigepealt nägid nad kaelkirjakut. Tal oli nii pikk kael, et ta sõi lehti otse puu otsast. Amps!",
    en: "First they saw a giraffe. Its neck was so long that it ate leaves right from the top of the tree. Chomp!",
    camera: [[1.1, 40, 75], [1.16, 60, 25]], particles: "leaf",
    stickers: [["AMPS!", "#8e44ff", 80, 16]],
  },
  {
    scene: "elephant",
    text: "Elevant imes londiga vett ja pritsis selle laiali – pritsti! Uku kilkas ja peitis end isa selja taha.",
    en: "The elephant sucked up water with its trunk and sprayed it all around – splash! Uku squealed and hid behind Dad.",
    camera: [[1.16, 35, 45], [1.04, 55, 55]], particles: "bubble",
    stickers: [["PRITSTI!", "#2f9bff", 50, 16]],
  },
  {
    scene: "lion",
    text: "Lõvi lesis päikese käes ja haigutas suurelt. „Kas lõvi tohib silitada?” küsis Frida. „Ei,” ütles ema. „Lõvi on metsik loom. Teda vaatame ainult eemalt.”",
    en: "The lion lay in the sun and gave a big yawn. “Can we pet the lion?” asked Frida. “No,” said Mum. “A lion is a wild animal. We only look at it from far away.”",
    camera: [[1.18, 62, 40], [1.02, 45, 55]], particles: "bokeh",
  },
  {
    scene: "monkeys",
    text: "Ahvid kiikusid köite otsas ja hüppasid oksalt oksale. Hopp! Uku tegi neid järele: „Uu-uu-aa-aa!”",
    en: "The monkeys swung on ropes and jumped from branch to branch. Hop! Uku copied them: “Oo-oo-aa-aa!”",
    camera: [[1.14, 50, 25], [1.08, 40, 65]], particles: "leaf",
    stickers: [["HOPP!", "#ff8a00", 34, 16], ["UU-AA!", "#8e44ff", 70, 22]],
  },
  {
    scene: "penguins",
    text: "Pingviinid vudisid üksteise järel mööda kivi ja libisesid kõhuli vette – viuh! Frida vudis ka nagu väike pingviin.",
    en: "The penguins waddled along a rock one after another and slid into the water on their tummies – whoosh! Frida waddled like a little penguin too.",
    camera: [[1.14, 35, 40], [1.08, 65, 60]], particles: "bubble",
    stickers: [["VIUH!", "#2f9bff", 58, 20]],
  },
  {
    scene: "zebra",
    text: "Sebral olid valged ja mustad triibud. Uku hakkas triipe lugema: „Üks, kaks, kolm … väga palju!”",
    en: "The zebra had white and black stripes. Uku started counting the stripes: “One, two, three … lots and lots!”",
    camera: [[1, 50, 50], [1.16, 58, 45]], particles: "petal",
  },
  {
    scene: "lunch",
    chapter: { title: "Lõunaaeg", en: "Lunchtime", icon: "bowl" },
    text: "Siis oli lõunaaeg. Pere istus tekile ja sõi ema võileibu. Väike varblane hüppas ligi ja korjas puru. Nokk-nokk!",
    en: "Then it was lunchtime. The family sat on a blanket and ate Mum’s sandwiches. A little sparrow hopped up and picked up the crumbs. Peck-peck!",
    camera: [[1.12, 40, 60], [1.12, 62, 60]], particles: "petal",
    stickers: [["NOKK-NOKK!", "#ff8a00", 74, 22]],
  },
  {
    scene: "pettingzoo",
    chapter: { title: "Silitame!", en: "Let’s pet!", icon: "paw" },
    text: "Pärast lõunat läksid nad lasteloomaaeda. „Siin elavad loomad, keda tohib silitada,” ütles isa. „Aga ainult õrnalt!”",
    en: "After lunch they went to the children’s zoo. “The animals here are ones you may pet,” said Dad. “But only gently!”",
    camera: [[1, 50, 50], [1.14, 45, 55]], particles: "petal",
  },
  {
    scene: "goats",
    text: "Väikesed kitsed tulid kohe uudistama. Frida silitas kitse pehmet selga. „Mää!” ütles kits rõõmsalt.",
    en: "The little goats came straight over to have a look. Frida stroked a goat’s soft back. “Baa!” said the goat happily.",
    camera: [[1.04, 50, 55], [1.18, 50, 55]], particles: "petal",
    stickers: [["MÄÄ!", "#ff5c8a", 64, 22]],
  },
  {
    scene: "rabbits",
    text: "Küülikul olid pikad kõrvad ja pehme kasukas. Uku silitas teda väga ettevaatlikult – ainult ühe sõrmega.",
    en: "The rabbit had long ears and a soft fur coat. Uku stroked it very carefully – with just one finger.",
    camera: [[1, 50, 50], [1.2, 48, 70]], particles: "bokeh",
  },
  {
    scene: "pony",
    text: "Isa tõstis Frida poni selga. Poni kõndis aeglaselt ringi: kopp-kopp! Frida tundis end nagu päris ratsanik.",
    en: "Dad lifted Frida onto a pony. The pony walked slowly round and round: clip-clop! Frida felt like a real rider.",
    camera: [[1.14, 30, 55], [1.14, 66, 50]], particles: "petal",
    stickers: [["KOPP-KOPP!", "#a1653f", 72, 18]],
  },
  {
    scene: "tortoise",
    text: "Suur kilpkonn sõi salatilehte. Frida ja Uku silitasid tema kõva kilpi. Kilpkonnal polnud kuhugi kiiret.",
    en: "A big tortoise was eating a lettuce leaf. Frida and Uku stroked its hard shell. The tortoise was in no hurry at all.",
    camera: [[1.16, 55, 70], [1.02, 50, 55]], particles: "leaf",
  },
  {
    scene: "handwash",
    text: "Pärast loomade silitamist pesid kõik käed seebiga puhtaks. Sulpsti-sulpsti! Nüüd olid käed jälle puhtad.",
    en: "After petting the animals everyone washed their hands with soap. Splosh-splosh! Now their hands were clean again.",
    camera: [[1.14, 50, 55], [1.02, 50, 50]], particles: "bubble",
    stickers: [["SULPSTI!", "#2f9bff", 74, 18]],
  },
  {
    scene: "icecream",
    text: "Lõpuks sai igaüks ühe jäätise. Uku jäätis sulas ja tilkus talle ninale. Kõik naersid!",
    en: "At last everyone got an ice cream. Uku’s ice cream melted and dripped onto his nose. Everyone laughed!",
    camera: [[1, 50, 50], [1.16, 62, 58]], particles: "confetti",
    stickers: [["NÄMM!", "#ff5c8a", 30, 18]],
  },
  {
    scene: "goinghome",
    chapter: { title: "Õhtu", en: "Evening", icon: "moon" },
    text: "Õhtul läks pere koju. Uku jäi isa süles magama. Frida lehvitas: „Head aega, loomad! Me tuleme varsti tagasi!”",
    en: "In the evening the family went home. Uku fell asleep in Dad’s arms. Frida waved: “Goodbye, animals! We’ll come back soon!”",
    camera: [[1, 50, 50], [1.14, 40, 55]], particles: "firefly",
    stickers: [["Z-z-z…", "#6c5fa6", 24, 20]],
  },
  {
    scene: "bedtime",
    text: "Voodis mõtles Frida kõigile loomadele: kaelkirjakule, elevandile, pingviinidele ja pehmele väikesele kitsele. Head ööd!",
    en: "In bed Frida thought about all the animals: the giraffe, the elephant, the penguins and the soft little goat. Good night!",
    camera: [[1, 50, 50], [1.18, 30, 72]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "star",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD, assets: "zoo/" };
