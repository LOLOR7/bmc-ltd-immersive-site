# BMC — Private Architecture Collection

Trois expériences immersives **frame sequence** sur une même page (GSAP ScrollTrigger + Lenis).  
Pas de vidéo, pas de GIF — uniquement des images au scroll.

Typographie : **Montserrat** (via `next/font/google`).

## Installation

```bash
cd "BMC LTD"
npm install
```

## ffmpeg (si besoin)

```bash
brew install ffmpeg
```

---

## Projet 1 — Adma Cliff House

### Vidéo source

```
public/videos/main-film.mp4
```

### Extraire les frames

```bash
npm run extract:frames
```

→ `public/frames/frame_0001.jpg`, `frame_0002.jpg`, …

### Config

`lib/experiences/adma.ts` → `totalFrames` (**577**), `framePath: "/frames/frame_"`

---

## Projet 2 — Bekish 6358

### Vidéo source

```
public/videos/bekish-final.mp4
```

(backup : `public/videos/bekish-6358.mp4`)

### Extraire les frames

```bash
npm run extract:frames:bekish:final
```

→ `public/frames/bekish-final/frame_0001.jpg`, …

### Config

`lib/experiences/bekish.ts` → `totalFrames` (**769**), `framePath: "/frames/bekish-final/frame_"`

---

## Projet 3 — Adma 527

### Vidéo source

```
public/videos/adma-527-final.mp4
```

(backup : `public/videos/adma-527.mp4`)

### Extraire les frames

```bash
npm run extract:frames:adma527:final
```

→ `public/frames/adma-527-final/frame_0001.jpg`, `frame_0002.jpg`, …

### Vérifier le nombre de frames

```bash
ls public/frames/adma-527-final/frame_*.jpg | wc -l
```

### Config

`lib/experiences/adma527.ts` → `totalFrames` (**636**), `framePath: "/frames/adma-527-final/frame_"`

### Contact sheet (QA visuelle)

```bash
ffmpeg -pattern_type glob -i "public/frames/adma-527-final/*.jpg" -vf "select='not(mod(n\,30))',scale=320:-1,tile=5x6" -frames:v 1 public/frames/adma-527-final/contact-sheet.jpg
```

---

## Projet 4 — Adma 514

### Vidéo source

```
public/videos/adma-514-final.mp4
```

### Extraire les frames

```bash
npm run extract:frames:adma514
```

→ `public/frames/adma-514/frame_0001.jpg`, …

### Config

`lib/experiences/adma514.ts` → `totalFrames` (**597**), `framePath: "/frames/adma-514/frame_"`

### Contact sheet (QA visuelle)

```bash
ffmpeg -pattern_type glob -i "public/frames/adma-514/*.jpg" -vf "select='not(mod(n\,30))',scale=320:-1,tile=5x6" -frames:v 1 public/frames/adma-514/contact-sheet.jpg
```

---

## Lancer le site

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

Ordre de la page : Header → intro BMC → **Adma Cliff House** (300vh) → transition → **Bekish 6358** (400vh) → transition → **Adma 527** (400vh) → transition → **Adma 514** (400vh) → contact.

## Modifier les textes

| Projet | Fichier |
|--------|---------|
| Adma Cliff House | `lib/scenes.ts` + `lib/experiences/adma.ts` |
| Bekish 6358 | `lib/experiences/bekish.ts` |
| Adma 527 | `lib/experiences/adma527.ts` |
| Adma 514 | `lib/experiences/adma514.ts` |

## Architecture

| Fichier | Rôle |
|---------|------|
| `components/FrameExperience.tsx` | Composant réutilisable (4 projets) |
| `lib/experiences/adma.ts` | Config Adma Cliff House |
| `lib/experiences/bekish.ts` | Config Bekish 6358 |
| `lib/experiences/adma527.ts` | Config Adma 527 |
| `lib/experiences/adma514.ts` | Config Adma 514 |
| `app/page.tsx` | Les quatre expériences + transitions |

Chaque projet a son **dossier de frames** séparé — jamais mélangés.

## Fallback

Frames absentes → fond noir + message d’extraction (`extractHint` ou `fallbackMessage` pour Adma 527).
