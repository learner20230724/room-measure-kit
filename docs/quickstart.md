# Quickstart — Room Measure Kit

Get a room estimate in under 2 minutes. No account, no install needed — just open the app and start entering your room dimensions.

**Live app:** https://learner20230724.github.io/room-measure-kit/

---

## Step 1 — Choose Your Units

Click the **m / ft** toggle in the toolbar (top-right area) to switch between metric and imperial units.

| Mode | Length/Width/Height | Waste % | Coverage |
|------|---------------------|---------|---------|
| Metric | meters (m) | % | m²/L |
| Imperial | feet (ft) | % | ft²/gal |

Your preference is saved to localStorage and persists across visits.

---

## Step 2 — Pick a Preset (Optional)

The toolbar has three **preset chips** that fill in typical room dimensions:

- **Small bedroom** — 4 m × 3 m × 2.5 m (EU standard)
- **Living room** — 6 m × 4 m × 2.8 m (generous)
- **Studio office** — 8 ft × 10 ft × 9 ft (US standard)

Click any chip to load those values instantly. You can then adjust any field to match your actual room.

---

## Step 3 — Enter Your Room Dimensions

Fill in the input fields:

| Field | What it means |
|-------|---------------|
| **Length** | Longest wall, floor-level |
| **Width** | Shortest wall, floor-level |
| **Height** | Wall height (floor to ceiling) |
| **Flooring waste %** | Extra material to order for cuts/offcuts (10–15% is typical for rectangular rooms) |
| **Paint coverage** | m²/L or ft²/gal your paint can covers (check the paint can label; typical: 10 m²/L or 400 ft²/gal) |

Results update in real time as you type — no "Calculate" button needed.

---

## Step 4 — Read the Results

Five calculations are shown simultaneously:

| Result | Formula |
|--------|---------|
| **Floor area** | length × width |
| **Perimeter** | 2 × (length + width) |
| **Wall area** | perimeter × height |
| **Flooring needed** | floor area × (1 + waste%) |
| **Paint needed** | wall area ÷ paint coverage |

> **Note:** Wall area assumes four full walls with no deductions for windows or doors. It's a planning estimate, not a contractor quote.

---

## Step 5 — Share the Link

Click **Share link** in the toolbar. The current inputs are encoded into the URL — copy it and paste anywhere (chat, email, notes). Anyone who opens the link will see the same room configuration pre-filled.

The link format: `https://learner20230724.github.io/room-measure-kit/?state=<encoded>`

---

## Step 6 — Export Results

In the results panel header:

- **PNG** — Downloads a high-resolution (2×) screenshot of the results panel with the dark theme background.
- **PDF** — Generates a PDF document of the results panel. Orientation (landscape/portrait) is chosen automatically based on the layout.

---

## Common Use Cases

### Flooring shopping list
Enter your room dimensions, set waste % to 10–15%, and use **Flooring needed** as your order quantity. Round up to the nearest pack.

### Paint planning
Enter dimensions, set paint coverage from your paint can (e.g. 10 m²/L), and use **Paint needed** to estimate litres. Most rooms need 2 coats — double the result.

### Real estate listing
Use the **Copy summary** button to grab a one-line result summary for pasting into a listing description or chat.

---

## FAQ

**Q: Can I use this for non-rectangular rooms?**
Not yet. L-shaped and circular rooms are on the roadmap (M6). For now, break an L-shaped room into two rectangles and add the results manually.

**Q: The imperial results seem off. What coverage rate should I use?**
Paint coverage rates vary by brand. US latex paint is typically rated at ~400 ft²/gal. Check your paint can label — if it says "one gallon covers 400 sq ft", that's your coverage rate.

**Q: Does the app work offline?**
Yes — v0.1.1 added PWA support. On first load, the app shell is cached. Subsequent visits work without internet.

**Q: Where is my data stored?**
All data stays in your browser's localStorage (`room-measure-kit-history`). Nothing is sent to any server.

---

## Keyboard / Touch Tips

- On mobile, swipe left/right to switch between the input panel and results panel
- Tab through fields in logical order
- The URL updates automatically as you type — bookmark the page at any point to save that configuration

---

## Running Locally

```bash
git clone https://github.com/learner20230724/room-measure-kit.git
cd room-measure-kit
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Tech Stack

Room Measure Kit is built with React 19 + TypeScript + Vite. It has no backend and no external dependencies beyond React. The entire app ships as a static site deployable to GitHub Pages, Cloudflare Pages, Netlify, or any static host.
