// Story pages. Shared by the web book (browser) and tools/ (Node).
// `text` is Estonian, `en` the English shown when the reader picks EN (chapter cards: `en` too).
// `scene` picks the SVG drawing in scenes.js. Drop AI art into web/media/pNN.png|.jpg|.mp4
// (NN = page number, 00 = cover) and it replaces the drawing automatically.

const TITLE = "Printsess Frida päev";
const TITLE_EN = "Princess Frida’s Day";

// v2 (motion graphics) shows a chapter card this many seconds long before chapter pages
const CHAPTER_CARD = 2.4;

const PAGES = [
  {
    scene: "cover",
    text: "Printsess Frida päev",
    en: "Princess Frida’s Day",
  },
  {
    scene: "wake",
    chapter: { title: "Hommik", en: "Morning", icon: "sun" }, // v2: animated chapter card before this page
    text: "Hommikul paistis päike aknast sisse. Printsess Frida ärkas üles, sirutas käsi ja haigutas: „Tere hommikust!”",
    en: "In the morning the sun shone through the window. Princess Frida woke up, stretched her arms and yawned: “Good morning!”",
  },
  {
    scene: "teeth",
    text: "Frida läks vannituppa ja pesi hambaid. Üleval ja all, vasakul ja paremal – kuni hambad särasid!",
    en: "Frida went to the bathroom and brushed her teeth. Top and bottom, left and right – until her teeth sparkled!",
  },
  {
    scene: "dress",
    text: "Siis pani Frida selga oma lemmikkleidi – roosa, lilla ja kollase. Pähe pani ta krooni, millel oli kolm säravat kalliskivi.",
    en: "Then Frida put on her favourite dress – pink, purple and yellow. On her head she put her crown with three shining jewels.",
  },
  {
    scene: "read",
    text: "Frida istus pehmesse tugitooli ja luges raamatuid. Raamatutes olid lohed, haldjad ja üks väga naljakas konn.",
    en: "Frida sat in a soft armchair and read books. In the books there were dragons, fairies and one very funny frog.",
  },
  {
    scene: "friends",
    chapter: { title: "Mängime!", en: "Let’s play!", icon: "ball" }, // v2: animated chapter card before this page
    text: "Õuest kostis naeru. Seal ootasid Fridat tema sõbrad: Mia, Lenna, Eliise ja Kertu. „Tule mängima!” hüüdsid nad.",
    en: "Laughter came from outside. Her friends Mia, Lenna, Eliise and Kertu were waiting. “Come and play!” they called.",
  },
  {
    scene: "ball",
    text: "Printsessid mängisid palli. Pall lendas kõrgele-kõrgele ja kõik jooksid palli järele. Hopp!",
    en: "The princesses played ball. The ball flew high, high up and everyone ran after it. Hop!",
  },
  {
    scene: "slide",
    text: "Siis jooksid nad suurele mänguväljakule. Seal oli väga kõrge liumägi! Üksteise järel lasid printsessid alla: viuh, viuh, viuh, viuh, viuh!",
    en: "Then they ran to the big playground. There was a very tall slide! One after another the princesses slid down: whoosh, whoosh, whoosh, whoosh, whoosh!",
  },
  {
    scene: "bouncy",
    text: "Järgmisena läksid nad hüppelossi. Seal sai hüpata, roomata läbi tunnelite ja lasta liumäest alla. Hopp-hopp-hopp!",
    en: "Next they went to the bouncy castle. You could jump, crawl through tunnels and go down the slide. Hop-hop-hop!",
  },
  {
    scene: "plums",
    text: "Aias kasvas suur ploomipuu. Printsessid ronisid puu otsa ja korjasid küpseid lillasid ploome. Amps! Kui magusad!",
    en: "A big plum tree grew in the garden. The princesses climbed up and picked ripe purple plums. Chomp! So sweet!",
  },
  {
    scene: "goodbye",
    chapter: { title: "Lõunaaeg", en: "Lunchtime", icon: "bowl" }, // v2: animated chapter card before this page
    text: "Varsti oli lõunaaeg. Printsessid lehvitasid üksteisele: „Head aega! Homme mängime jälle!” Ja kõik läksid koju.",
    en: "Soon it was lunchtime. The princesses waved: “Goodbye! Let's play again tomorrow!” And everyone went home.",
  },
  {
    scene: "lunch",
    text: "Kodus ootas Fridat soe lõunasöök. Frida sõi kõhu täis ja ütles: „Aitäh, oli väga maitsev!”",
    en: "A warm lunch was waiting for Frida at home. She ate until she was full and said: “Thank you, it was delicious!”",
  },
  {
    scene: "pajamas",
    text: "Enne lõunauinakut vahetas Frida riided. Kleit läks kappi, selga tuli pehme pidžaama ja kroon jäi öökapile puhkama.",
    en: "Before her nap Frida changed clothes. The dress went into the wardrobe, soft pyjamas went on, and the crown rested on the nightstand.",
  },
  {
    scene: "nap",
    text: "Frida pugis teki alla ja sulges silmad. Ka Mia, Lenna, Eliise ja Kertu magasid oma kodudes. Magusat und, printsessid!",
    en: "Frida snuggled under the blanket and closed her eyes. Mia, Lenna, Eliise and Kertu slept in their homes too. Sweet dreams, princesses!",
  },
  {
    scene: "ready",
    chapter: { title: "Võlulohe", en: "Magic dragon", icon: "dragon" }, // v2: animated chapter card before this page
    text: "Pärast uinakut olid printsessid jälle reipad. Nad panid kleidid selga, kroonid pähe ja võtsid kaasa oma võlukepid.",
    en: "After the nap the princesses were full of energy again. They put on their dresses and crowns and took their magic wands.",
  },
  {
    scene: "wands",
    text: "Aia taga seisis nende ühine suur lohe. Ta oli liikumatu nagu kivikuju. Printsessid tõstsid võlukepid ja hüüdsid: „Üks, kaks, kolm – ärka üles, lohe!”",
    en: "Behind the garden stood their shared big dragon, still as a stone statue. The princesses raised their wands and called: “One, two, three – wake up, dragon!”",
  },
  {
    scene: "dragonwake",
    text: "Võlusädemeid lendas igale poole. Lohe tegi silmad lahti, lehvitas tiibu ja naeratas: „Tere, printsessid! Kas mängime?”",
    en: "Magic sparkles flew everywhere. The dragon opened its eyes, flapped its wings and smiled: “Hello, princesses! Shall we play?”",
  },
  {
    scene: "dragonslide",
    text: "Lohe tõstis printsessid ükshaaval oma pea peale. Ja siis – viuh! – libisesid nad mööda lohe selga ja saba alla nagu liumäest!",
    en: "The dragon lifted the princesses onto its head one by one. And then – whoosh! – they slid down its back and tail like a slide!",
  },
  {
    scene: "afternoon",
    text: "Nii mängisid nad terve pärastlõuna. Üles ja alla, üles ja alla – ikka ja jälle!",
    en: "They played like that the whole afternoon. Up and down, up and down – again and again!",
  },
  {
    scene: "dragonsleep",
    chapter: { title: "Õhtu", en: "Evening", icon: "moon" }, // v2: animated chapter card before this page
    text: "Õhtu poole oli lohe väga väsinud. Ta haigutas suurelt, keeras end kerra ja jäi magama. „Head ööd, lohe!” sosistasid printsessid.",
    en: "Towards evening the dragon was very tired. It gave a big yawn, curled up and fell asleep. “Good night, dragon!” whispered the princesses.",
  },
  {
    scene: "dinner",
    text: "Printsessid läksid koju. Fridat ootas õhtusöök: soe kartulipuder ja klaas piima.",
    en: "The princesses went home. Dinner was waiting for Frida: warm mashed potatoes and a glass of milk.",
  },
  {
    scene: "bedtime",
    text: "Siis oli aeg magama minna. Frida pesi hambad puhtaks, pani selga pidžaama ja valis välja unejutu.",
    en: "Then it was time for bed. Frida brushed her teeth, put on her pyjamas and picked a bedtime story.",
  },
  {
    scene: "night",
    text: "Väljas süttisid tähed. Frida kallistas kaisukaru ja sulges silmad. Ka sõbrad ja suur lohe magasid juba. Head ööd!",
    en: "Outside the stars came out. Frida hugged her teddy bear and closed her eyes. Her friends and the big dragon were already asleep. Good night!",
  },
  {
    scene: "end",
    text: "Lõpp",
    en: "The End",
  },
];

globalThis.STORY = { TITLE, TITLE_EN, PAGES, CHAPTER_CARD };
