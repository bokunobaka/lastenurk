// "Printsess Frida arsti juures" — a gentle check-up at the doctor's, to make a first visit less scary.
// Drawings in doctor-scenes.js. Each page may set its own v2 motion: camera, particles, stickers.
// `text` is Estonian, `en` the English shown when the reader picks EN. Media/narration: web/doctor/media|audio/pNN.*

const TITLE = "Printsess Frida arsti juures";
const TITLE_EN = "Princess Frida Visits the Doctor";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida arsti juures",
    en: "Princess Frida Visits the Doctor",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "glitter",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" },
    text: "Hommikul ütles ema: „Täna läheme arsti juurde. Arst vaatab, kas sa kasvad hästi ja oled terve.” Frida võttis kaasa oma kaisukaru.",
    en: "In the morning Mum said: “Today we’re going to the doctor. The doctor will check that you’re growing well and healthy.” Frida took her teddy bear along.",
    camera: [[1, 50, 50], [1.14, 30, 45]], particles: "bokeh",
  },
  {
    scene: "waiting",
    chapter: { title: "Arsti juures", en: "At the doctor’s", icon: "heart" },
    text: "Ootetoas olid mänguasjad ja raamatud. Uku ehitas klotsidest torni. Frida hoidis kaisukaru kõvasti kaisus.",
    en: "In the waiting room there were toys and books. Uku built a tower of blocks. Frida held her teddy bear tight.",
    camera: [[1.12, 35, 55], [1.12, 62, 55]], particles: "bokeh",
  },
  {
    scene: "hello",
    text: "„Tere, Frida!” ütles doktor Liis ja naeratas. Tal oli valge kittel ja kaelas huvitav kuulamistoru.",
    en: "“Hello, Frida!” said Doctor Liis with a smile. She wore a white coat and had an interesting listening tube around her neck.",
    camera: [[1.14, 62, 45], [1.04, 50, 50]], particles: "bokeh",
  },
  {
    scene: "measure",
    text: "Kõigepealt mõõdeti, kui pikk Frida on. Ta oli kasvanud – terve käelaiuse! Siis astus ta kaalule.",
    en: "First they measured how tall Frida was. She had grown – a whole hand’s width! Then she stepped on the scales.",
    camera: [[1.16, 40, 35], [1.06, 48, 55]], particles: "glitter",
  },
  {
    scene: "heart",
    text: "Doktor kuulas toruga Frida südant. „Kas tahad ka ise kuulata?” Frida kuulis: tuks-tuks, tuks-tuks!",
    en: "The doctor listened to Frida’s heart with the tube. “Would you like to listen too?” Frida heard: ba-dum, ba-dum!",
    camera: [[1.04, 50, 50], [1.18, 52, 45]], particles: "bokeh",
    stickers: [["TUKS-TUKS!", "#ff5c8a", 72, 18]],
  },
  {
    scene: "throat",
    text: "Siis vaatas doktor väikese lambiga Frida kõrvadesse. „Nüüd tee suu lahti ja ütle aaa!” – „Aaaa!”",
    en: "Then the doctor looked into Frida’s ears with a little light. “Now open your mouth and say ahh!” – “Ahhhh!”",
    camera: [[1.16, 45, 40], [1.06, 50, 50]], particles: "bokeh",
    stickers: [["AAAA!", "#ff8a00", 30, 18]],
  },
  {
    scene: "knee",
    text: "Doktor koputas pehme haamriga Frida põlvele. Jalg hüppas ise üles – hopp! Frida naeris.",
    en: "The doctor tapped Frida’s knee with a soft hammer. Her leg jumped up all by itself – hop! Frida laughed.",
    camera: [[1.14, 50, 62], [1.04, 50, 50]], particles: "bokeh",
    stickers: [["HOPP!", "#2fb37a", 64, 22]],
  },
  {
    scene: "teddy",
    text: "„Kas mu kaisukaru võib ka arsti juurde tulla?” küsis Frida. Doktor kuulas ka karu südant. „Karu on täiesti terve!”",
    en: "“Can my teddy see the doctor too?” asked Frida. The doctor listened to the bear’s heart as well. “Teddy is perfectly healthy!”",
    camera: [[1.04, 50, 50], [1.18, 50, 48]], particles: "glitter",
  },
  {
    scene: "shot",
    chapter: { title: "Julge Frida", en: "Brave Frida", icon: "star" },
    text: "Siis oli aeg väikeseks süstiks. Frida hoidis emal käest kinni ja vaatas kaisukaru. Pisike torge – ja oligi läbi!",
    en: "Then it was time for a little injection. Frida held Mum’s hand and looked at her teddy. A tiny prick – and it was all over!",
    camera: [[1.12, 45, 50], [1.04, 50, 50]], particles: "bokeh",
  },
  {
    scene: "plaster",
    text: "Doktor pani Frida käele plaastri, millel olid tähed. „Sa olid väga julge,” ütles ta.",
    en: "The doctor put a plaster with stars on Frida’s arm. “You were very brave,” she said.",
    camera: [[1.18, 42, 45], [1.04, 50, 50]], particles: "glitter",
  },
  {
    scene: "sticker",
    text: "Julguse eest sai Frida kleepsu ja Uku ka. Uku kleepis enda oma otse otsaesisele!",
    en: "For being brave Frida got a sticker, and so did Uku. Uku stuck his right on his forehead!",
    camera: [[1, 50, 50], [1.16, 62, 45]], particles: "confetti",
  },
  {
    scene: "playground",
    chapter: { title: "Pärastlõuna", en: "Afternoon", icon: "ball" },
    text: "Pärast arsti juures käimist läksid nad mänguväljakule. Frida näitas kõigile oma tähtedega plaastrit.",
    en: "After the doctor’s they went to the playground. Frida showed everyone her plaster with stars.",
    camera: [[1.1, 35, 55], [1.1, 62, 55]], particles: "petal",
  },
  {
    scene: "bedtime",
    text: "Õhtul mängis Frida oma kaisukaruga arsti. „Ütle aaa!” Karu oli väga julge. Head ööd!",
    en: "In the evening Frida played doctor with her teddy bear. “Say ahh!” Teddy was very brave. Good night!",
    camera: [[1, 50, 50], [1.16, 50, 55]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "star",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD, assets: "doctor/" };
