// "Väikese Rexi päev" — the dinosaur book. Same engine as the Frida book (book.js + motion.js).
// Each page may set its own v2 motion: camera [[scale, x%, y%] from, to], particles, stickers [[text, colour, x%, y%]].
// Media and narration live in web/dino/media/pNN.* and web/dino/audio/pNN.*

const TITLE = "Väikese Rexi päev";
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Väikese Rexi päev",
    camera: [[1.18, 50, 60], [1, 50, 50]], particles: "glitter",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", icon: "sun" },
    text: "Hommikul paistis päike koopasse. Väike T-rex Rex ärkas üles, sirutas oma lühikesi käsi ja haigutas: „Tere hommikust!”",
    camera: [[1, 50, 50], [1.14, 32, 55]], particles: "bokeh",
    stickers: [["TERE HOMMIKUST!", "#ff8a00", 68, 16]],
  },
  {
    scene: "teeth",
    text: "Rex pesi hambaid. Tal oli nii palju hambaid! Üleval ja all, vasakul ja paremal – kuni kõik hambad särasid!",
    camera: [[1.16, 45, 40], [1.02, 50, 50]], particles: "bubble",
  },
  {
    scene: "breakfast",
    text: "Hommikusöögiks sõi Rex suurelt lehelt magusaid marju. Amps-amps! Kõht sai kenasti täis.",
    camera: [[1, 50, 50], [1.14, 50, 55]], particles: "bokeh",
    stickers: [["AMPS-AMPS!", "#8e44ff", 72, 20]],
  },
  {
    scene: "read",
    text: "Siis luges Rex raamatut vulkaanidest. Kõige naljakam pilt oli munast kooruvast dinobeebist.",
    camera: [[1.04, 40, 50], [1.18, 48, 45]], particles: "bokeh",
  },
  {
    scene: "friends",
    chapter: { title: "Mängime!", icon: "ball" },
    text: "Koopa eest kostis: „Rex, tule mängima!” Seal ootasid sõbrad: triceratops Tipi, stegosaurus Stella, ankülosaurus Anki ja lendsisalik Pteri.",
    camera: [[1.12, 12, 60], [1.12, 78, 55]], particles: "leaf",
  },
  {
    scene: "ball",
    text: "Dinosaurused mängisid palli. Tipi puksis palli sarvedega ja Anki lõi seda oma raske sabaga. Põmm!",
    camera: [[1.12, 15, 50], [1.12, 85, 50]], particles: "leaf",
    stickers: [["PÕMM!", "#ff5c8a", 30, 22]],
  },
  {
    scene: "puddles",
    text: "Siis leidsid nad suured porilombid. Kõik hüppasid sisse – lirts ja lärts! Pori lendas igale poole.",
    camera: [[1, 50, 50], [1.14, 50, 60]], particles: "confetti",
    stickers: [["LIRTS!", "#a1653f", 26, 22], ["LÄRTS!", "#ff8a00", 72, 18]],
  },
  {
    scene: "hide",
    text: "Nüüd mängiti peitust. Kõik peitsid end sõnajalgade taha. Aga Stella seljaplaadid paistsid välja! „Leidsin!” hüüdis Rex.",
    camera: [[1.14, 70, 50], [1.14, 25, 55]], particles: "leaf",
    stickers: [["LEIDSIN!", "#2fb37a", 30, 18]],
  },
  {
    scene: "apples",
    text: "Suure puu otsas kasvasid punased õunad. Rex ei ulatunud, aga Pteri lendas üles ja viskas kõigile õuna. Krõmps!",
    camera: [[1.16, 50, 20], [1.02, 50, 60]], particles: "leaf",
    stickers: [["KRÕMPS!", "#e53935", 76, 24]],
  },
  {
    scene: "goodbye",
    chapter: { title: "Lõunaaeg", icon: "bowl" },
    text: "Varsti oli lõunaaeg. Sõbrad lehvitasid üksteisele: „Head aega! Homme mängime jälle!” Ja kõik läksid koju.",
    camera: [[1, 50, 60], [1.16, 50, 42]], particles: "petal",
  },
  {
    scene: "lunch",
    text: "Kodus ootas Rexi lõunasöök: porgandid ja brokoli. Krõmps-krõmps! „Aitäh, oli väga maitsev!”",
    camera: [[1.14, 50, 55], [1.02, 50, 50]], particles: "bokeh",
    stickers: [["KRÕMPS-KRÕMPS!", "#ff8a00", 74, 20]],
  },
  {
    scene: "nest",
    text: "Enne lõunauinakut tegi Rex oma pesa lehtedest pehmeks ja võttis kaissu oma kaisumuna.",
    camera: [[1, 50, 50], [1.14, 42, 55]], particles: "bokeh",
  },
  {
    scene: "nap",
    text: "Rex keeras end pesas kerra ja sulges silmad. Ka Tipi, Stella, Anki ja Pteri magasid oma pesades. Magusat und!",
    camera: [[1.14, 28, 72], [1, 50, 50]], particles: "star",
  },
  {
    scene: "ready",
    chapter: { title: "Suur Bruuno", icon: "longneck" },
    text: "Pärast uinakut olid kõik jälle reipad. Sõbrad jooksid üle heinamaa järve äärde – trampsti, trampsti!",
    camera: [[1.14, 30, 60], [1.1, 70, 55]], particles: "petal",
    stickers: [["TRAMPSTI!", "#ff8a00", 70, 20]],
  },
  {
    scene: "roar",
    text: "Järve ääres magas nende suur sõber, brahhiosaurus Bruuno. Sõbrad hüüdsid koos: „Üks, kaks, kolm – ärka üles, Bruuno!”",
    camera: [[1.12, 15, 68], [1.12, 55, 40]], particles: "glitter",
    stickers: [["ÜKS!", "#ff5c8a", 62, 14], ["KAKS!", "#8e44ff", 74, 26], ["KOLM!", "#ff8a00", 86, 14]],
  },
  {
    scene: "bruunowake",
    text: "Bruuno tegi silmad lahti, sirutas oma pikka kaela ja naeratas: „Tere, väikesed! Kas mängime?”",
    camera: [[1.2, 30, 35], [1, 50, 50]], particles: "confetti",
    stickers: [["TERE!", "#2fb37a", 60, 14]],
  },
  {
    scene: "bruunoslide",
    text: "Bruuno tõstis sõbrad ükshaaval oma pea peale. Ja siis – viuh! – lasid nad liugu mööda tema pikka kaela, selga ja saba alla!",
    camera: [[1.16, 18, 32], [1.16, 92, 78]], particles: "confetti",
    stickers: [["VIUH!", "#2f9bff", 66, 22]],
  },
  {
    scene: "afternoon",
    text: "Pteri lendas kõrval ja hõiskas. Nii mängisid nad terve pärastlõuna – üles ja alla, ikka ja jälle!",
    camera: [[1, 50, 50], [1.12, 62, 50]], particles: "bokeh",
  },
  {
    scene: "bruunosleep",
    chapter: { title: "Õhtu", icon: "moon" },
    text: "Õhtu poole oli Bruuno väga väsinud. Ta haigutas suurelt, pani pea murule ja jäi magama. „Head ööd, Bruuno!” sosistasid sõbrad.",
    camera: [[1, 50, 50], [1.16, 42, 55]], particles: "firefly",
    stickers: [["Z-z-z…", "#6c5fa6", 40, 18]],
  },
  {
    scene: "dinner",
    text: "Rex läks koju. Õhtusöögiks oli soe juurviljasupp. Lürps!",
    camera: [[1.14, 50, 55], [1.02, 50, 50]], particles: "firefly",
    stickers: [["LÜRPS!", "#ff8a00", 72, 22]],
  },
  {
    scene: "bedtime",
    text: "Siis oli aeg magama minna. Rex pesi hambad – kõik need paljud hambad! – ja valis välja unejutu.",
    camera: [[1, 50, 50], [1.16, 50, 45]], particles: "star",
  },
  {
    scene: "night",
    text: "Väljas süttisid tähed. Rex kallistas oma kaisumuna ja sulges silmad. Ka sõbrad ja suur Bruuno magasid juba. Head ööd!",
    camera: [[1, 50, 50], [1.22, 30, 72]], particles: "star",
  },
  {
    scene: "end",
    text: "Lõpp",
    camera: [[1.22, 50, 30], [1, 50, 50]], particles: "star",
  },
];

globalThis.STORY = { TITLE, PAGES, CHAPTER_CARD, assets: "dino/" };
