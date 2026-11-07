# Character bible

Generate a **character sheet** for each princess first, then pass that sheet as the reference image in
every scene (Midjourney `--cref`, ChatGPT/OpenAI image "use this character", Leonardo Character Reference,
Kling/Runway "reference image"). The same sheet in every scene is what keeps Frida looking like Frida on all 15 pages.

## Style anchor (paste at the start of every prompt)

> Soft children's picture-book illustration, gouache and watercolour texture, warm pastel palette,
> rounded friendly shapes, big expressive eyes, gentle lighting, clean uncluttered background,
> suitable for a 5-year-old, 16:9 landscape

## The princesses

| Name | Dress | Hair | Crown | Extra |
|---|---|---|---|---|
| **Frida** (main) | pink bodice, purple full skirt with small yellow polka dots, yellow sash and hem trim, purple shoes | **long straight brown hair** to the waist, bangs | gold crown with **exactly three jewels**: pink, purple, yellow | about 5 years old, the main character |
| **Mia** | light blue dress | blonde bob | small gold tiara, one light-blue jewel | cheerful, waves a lot |
| **Lenna** | light green dress | ginger/orange hair in two pigtails with pink hair ties | small gold tiara, one green jewel | likes tunnels |
| **Eliise** | light purple (lavender) dress | black hair in two space buns | small gold tiara, one lavender jewel | the jumper |
| **Kertu** | yellow dress | light brown ponytail | small gold tiara, one yellow jewel | loves plums |

## The dragon (shared by all five princesses)

Big, friendly, round and soft, never scary. **Mint green** body, **pale pink belly** and chin stripe,
**yellow** back spikes, horns and tail tip, **lavender** wings, big kind dark eyes, rosy cheeks, a wide smile.
It lies on the grass like a giant slide. Before the magic, it is a **grey stone statue** of exactly the same shape.

> [style anchor] Character turnaround sheet of a huge friendly cartoon dragon for small children: round soft body,
> mint-green skin, pale pink belly, yellow back spikes and small horns, lavender wings, big kind eyes, rosy cheeks,
> wide smile, long gentle neck and long tail. Side view lying down, front view, sleeping pose, and a grey stone-statue version.

Pyjamas (pages 1, 2, 12, 13, 21, 22): Frida wears soft light-pink pyjamas with yellow buttons and no crown.

## Character-sheet prompts

**Frida**
> [style anchor] Character turnaround sheet of a 5-year-old princess named Frida: long straight brown hair
> with bangs, gold crown with exactly three jewels (pink, purple, yellow), dress with pink bodice,
> purple full skirt with small yellow polka dots, yellow sash and hem, purple shoes. Front view, side view,
> back view, three-quarter view, plus 4 facial expressions (happy, laughing, yawning, sleeping).
> White background, consistent proportions.

**Group sheet (after each friend has her own sheet)**
> [style anchor] Lineup of five 5-year-old princesses standing side by side, smiling:
> Mia (light blue dress, blonde bob, small tiara), Lenna (light green dress, ginger pigtails),
> Frida in the centre (long brown hair, three-jewel gold crown, pink-purple-yellow dress),
> Eliise (lavender dress, black space buns), Kertu (yellow dress, light-brown ponytail). White background.

Tips
- Generate 8–20 variations, pick one, and **never change it afterwards**.
- If the crown loses jewels or the hair turns wavy, put the detail at the start of the prompt
  ("three-jewel crown, long straight brown hair, …").
- Keep a `art/refs/` folder with the chosen sheets.
