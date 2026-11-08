// "Printsess Frida kelgutamas" — a snowy winter day of sledding with the family. Drawings in winter-scenes.js.
// Each page may set its own v2 motion: camera [[scale, x%, y%] from, to], particles, stickers [[text, colour, x%, y%]].
// `text` is Estonian, `en` the English shown when the reader picks EN. Media/narration: web/winter/media|audio/pNN.*

const TITLE = "Printsess Frida kelgutamas";
const TITLE_EN = "Princess Frida Goes Sledding";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida kelgutamas",
    en: "Princess Frida Goes Sledding",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "snow",
  },
  {
    scene: "window",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" },
    text: "Hommikul vaatas Frida aknast välja. Kõik oli valge! Öösel oli sadanud palju-palju lund.",
    en: "In the morning Frida looked out of the window. Everything was white! Lots and lots of snow had fallen in the night.",
    camera: [[1, 50, 50], [1.16, 62, 42]], particles: "bokeh",
  },
  {
    scene: "dressup",
    text: "Enne õue minekut pandi selga soojad riided: kombe, müts, sall, labakindad ja saapad. Uku mähiti nii paksult, et ta nägi välja nagu pall!",
    en: "Before going out they put on warm clothes: snowsuit, hat, scarf, mittens and boots. Uku was wrapped up so thick that he looked like a ball!",
    camera: [[1.12, 40, 55], [1.12, 62, 55]], particles: "bokeh",
  },
  {
    scene: "outside",
    chapter: { title: "Lumi", en: "Snow", icon: "snow" },
    text: "Õues krudises lumi saabaste all: krõks-krõks! Isa tõmbas kelku ja Uku istus kelgu peal nagu väike kuningas.",
    en: "Outside the snow crunched under their boots: crunch-crunch! Dad pulled the sled and Uku sat on it like a little king.",
    camera: [[1.12, 30, 60], [1.12, 66, 60]], particles: "snow",
    stickers: [["KRÕKS-KRÕKS!", "#6fb6e8", 70, 18]],
  },
  {
    scene: "snowman",
    text: "Kõigepealt tegid nad lumememme. Kolm suurt lumepalli, porgand ninaks ja söed silmadeks. Ema andis talle oma salli.",
    en: "First they built a snowman. Three big snowballs, a carrot for a nose and coal for eyes. Mum gave him her scarf.",
    camera: [[1.04, 50, 55], [1.18, 50, 42]], particles: "snow",
  },
  {
    scene: "sledding",
    chapter: { title: "Kelgumägi", en: "The sledding hill", icon: "snow" },
    text: "Siis läksid nad suurele kelgumäele. Frida ja isa istusid kelgule ja – viuh! – sõitsid alla nagu tuul!",
    en: "Then they went to the big sledding hill. Frida and Dad sat on the sled and – whoosh! – raced down like the wind!",
    camera: [[1.14, 25, 35], [1.1, 70, 65]], particles: "snow",
    stickers: [["VIUH!", "#2f9bff", 56, 22]],
  },
  {
    scene: "tumble",
    text: "Uku ja ema sõitsid väikese kelguga. Põmaki! Kelk läks ümber ja Uku kukkus pehmesse lumme. Ta naeris ja tahtis kohe uuesti!",
    en: "Uku and Mum rode the little sled. Bump! The sled tipped over and Uku fell into the soft snow. He laughed and wanted to go again!",
    camera: [[1, 50, 50], [1.16, 56, 62]], particles: "snow",
    stickers: [["PÕMAKI!", "#ff5c8a", 62, 20]],
  },
  {
    scene: "climb",
    text: "Üles mäele tuli kelku ise vedada. See oli raske töö! Aga alla sõita oli nii lõbus, et Frida vedas kelku ikka ja jälle.",
    en: "They had to pull the sled back up the hill themselves. That was hard work! But sliding down was so much fun that Frida pulled it up again and again.",
    camera: [[1.12, 70, 60], [1.12, 35, 40]], particles: "snow",
  },
  {
    scene: "angels",
    text: "Siis heitsid Frida ja Uku selili lumme ja tegid lumeingleid. Käed üles-alla, jalad lahku-kokku!",
    en: "Then Frida and Uku lay on their backs in the snow and made snow angels. Arms up and down, legs out and in!",
    camera: [[1, 50, 50], [1.14, 45, 55]], particles: "snow",
  },
  {
    scene: "snowballs",
    text: "Isa viskas pehme lumepalli – plärts! Frida viskas vastu. Algas suur ja lõbus lumesõda!",
    en: "Dad threw a soft snowball – splat! Frida threw one back. A big, fun snowball fight began!",
    camera: [[1.12, 35, 55], [1.12, 65, 55]], particles: "snow",
    stickers: [["PLÄRTS!", "#2f9bff", 50, 20]],
  },
  {
    scene: "cocoa",
    chapter: { title: "Soe kakao", en: "Warm cocoa", icon: "bowl" },
    text: "Varsti olid ninad punased ja varbad külmad. Kodus jõid kõik sooja kakaod vahukommidega. Mmm!",
    en: "Soon their noses were red and their toes were cold. At home everyone drank warm cocoa with marshmallows. Mmm!",
    camera: [[1.14, 50, 55], [1.02, 50, 50]], particles: "bokeh",
    stickers: [["MMM!", "#a1653f", 74, 20]],
  },
  {
    scene: "evening",
    chapter: { title: "Õhtu", en: "Evening", icon: "moon" },
    text: "Õhtul vaatas Frida aknast, kuidas lumememm kuuvalgel õue valvas. Tal oli ikka veel ema sall kaelas.",
    en: "In the evening Frida watched from the window as the snowman kept guard outside in the moonlight. He still had Mum’s scarf round his neck.",
    camera: [[1, 50, 50], [1.16, 62, 45]], particles: "snow",
  },
  {
    scene: "bedtime",
    text: "Frida pugis sooja teki alla. Unes sõitis ta kelguga mööda kõige pikemat mäge. Head ööd!",
    en: "Frida snuggled under the warm blanket. In her dreams she sledded down the longest hill of all. Good night!",
    camera: [[1, 50, 50], [1.18, 30, 72]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "snow",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD, assets: "winter/" };
