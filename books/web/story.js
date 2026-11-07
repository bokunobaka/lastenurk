// Story pages. Shared by the web book (browser) and tools/ (Node).
// `scene` picks the SVG drawing in scenes.js. Drop AI art into web/media/pNN.png|.jpg|.mp4
// (NN = page number, 00 = cover) and it replaces the drawing automatically.

const TITLE = "Printsess Frida päev";

// v2 (motion graphics) shows a chapter card this many seconds long before chapter pages
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida päev",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", icon: "sun" }, // v2: animated chapter card before this page
    text: "Hommikul paistis päike aknast sisse. Printsess Frida ärkas üles, sirutas käsi ja haigutas: „Tere hommikust!”",
  },
  {
    scene: "teeth",
    text: "Frida läks vannituppa ja pesi hambaid. Üleval ja all, vasakul ja paremal – kuni hambad särasid!",
  },
  {
    scene: "dress",
    text: "Siis pani Frida selga oma lemmikkleidi – roosa, lilla ja kollase. Pähe pani ta krooni, millel oli kolm säravat kalliskivi.",
  },
  {
    scene: "read",
    text: "Frida istus pehmesse tugitooli ja luges raamatuid. Raamatutes olid lohed, haldjad ja üks väga naljakas konn.",
  },
  {
    scene: "friends",
    chapter: { title: "Mängime!", icon: "ball" }, // v2: animated chapter card before this page
    text: "Õuest kostis naeru. Seal ootasid Fridat tema sõbrad: Mia, Lenna, Eliise ja Kertu. „Tule mängima!” hüüdsid nad.",
  },
  {
    scene: "ball",
    text: "Printsessid mängisid palli. Pall lendas kõrgele-kõrgele ja kõik jooksid palli järele. Hopp!",
  },
  {
    scene: "slide",
    text: "Siis jooksid nad suurele mänguväljakule. Seal oli väga kõrge liumägi! Üksteise järel lasid printsessid alla: viuh, viuh, viuh, viuh, viuh!",
  },
  {
    scene: "bouncy",
    text: "Järgmisena läksid nad hüppelossi. Seal sai hüpata, roomata läbi tunnelite ja lasta liumäest alla. Hopp-hopp-hopp!",
  },
  {
    scene: "plums",
    text: "Aias kasvas suur ploomipuu. Printsessid ronisid puu otsa ja korjasid küpseid lillasid ploome. Amps! Kui magusad!",
  },
  {
    scene: "goodbye",
    chapter: { title: "Lõunaaeg", icon: "bowl" }, // v2: animated chapter card before this page
    text: "Varsti oli lõunaaeg. Printsessid lehvitasid üksteisele: „Head aega! Homme mängime jälle!” Ja kõik läksid koju.",
  },
  {
    scene: "lunch",
    text: "Kodus ootas Fridat soe lõunasöök. Frida sõi kõhu täis ja ütles: „Aitäh, oli väga maitsev!”",
  },
  {
    scene: "pajamas",
    text: "Enne lõunauinakut vahetas Frida riided. Kleit läks kappi, selga tuli pehme pidžaama ja kroon jäi öökapile puhkama.",
  },
  {
    scene: "nap",
    text: "Frida pugis teki alla ja sulges silmad. Ka Mia, Lenna, Eliise ja Kertu magasid oma kodudes. Magusat und, printsessid!",
  },
  {
    scene: "ready",
    chapter: { title: "Võlulohe", icon: "dragon" }, // v2: animated chapter card before this page
    text: "Pärast uinakut olid printsessid jälle reipad. Nad panid kleidid selga, kroonid pähe ja võtsid kaasa oma võlukepid.",
  },
  {
    scene: "wands",
    text: "Aia taga seisis nende ühine suur lohe. Ta oli liikumatu nagu kivikuju. Printsessid tõstsid võlukepid ja hüüdsid: „Üks, kaks, kolm – ärka üles, lohe!”",
  },
  {
    scene: "dragonwake",
    text: "Võlusädemeid lendas igale poole. Lohe tegi silmad lahti, lehvitas tiibu ja naeratas: „Tere, printsessid! Kas mängime?”",
  },
  {
    scene: "dragonslide",
    text: "Lohe tõstis printsessid ükshaaval oma pea peale. Ja siis – viuh! – libisesid nad mööda lohe selga ja saba alla nagu liumäest!",
  },
  {
    scene: "afternoon",
    text: "Nii mängisid nad terve pärastlõuna. Üles ja alla, üles ja alla – ikka ja jälle!",
  },
  {
    scene: "dragonsleep",
    chapter: { title: "Õhtu", icon: "moon" }, // v2: animated chapter card before this page
    text: "Õhtu poole oli lohe väga väsinud. Ta haigutas suurelt, keeras end kerra ja jäi magama. „Head ööd, lohe!” sosistasid printsessid.",
  },
  {
    scene: "dinner",
    text: "Printsessid läksid koju. Fridat ootas õhtusöök: soe kartulipuder ja klaas piima.",
  },
  {
    scene: "bedtime",
    text: "Siis oli aeg magama minna. Frida pesi hambad puhtaks, pani selga pidžaama ja valis välja unejutu.",
  },
  {
    scene: "night",
    text: "Väljas süttisid tähed. Frida kallistas kaisukaru ja sulges silmad. Ka sõbrad ja suur lohe magasid juba. Head ööd!",
  },
  {
    scene: "end",
    text: "Lõpp",
  },
];

globalThis.STORY = { TITLE, PAGES, CHAPTER_CARD };
