# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] — 2026-04-05

### Added
- **L-shaped room support** — two-section rectangular rooms calculated as the sum of both sections; shared height, independent length/width for each section; 6-segment outer perimeter
- **Circular room support** — full circle area (πr²) and circumference (2πr) calculations; diameter displayed as read-only derived value

### Changed
- Room shape selector (3-way toggle: Rectangular / L-shape / Circular) added to the toolbar
- Result summary adapts per shape type ("Circumference" for circular, "Outer perimeter" for L-shape)
- Input panel dynamically shows shape-specific fields (Section A/B for L-shape, Radius for circular)
- Calculation history preserves shape type and restores all shape-specific fields

## [0.1.0] — 2026-04-04

### Added
- Rectangular room area and perimeter calculation
- Wall area estimation from optional wall height input
- Flooring requirement estimate with configurable waste percentage
- Paint usage estimate from configurable coverage rate
- Metric / Imperial unit toggle (synchronizes paint coverage units)
- Built-in room preset chips for quick demos and screenshots
- One-click copy of compact result summary
- Vitest test suite covering core calculation logic
- Vite + React static build (deployable to GitHub Pages)
- GitHub Pages deployment workflow (`.github/workflows/deploy-pages.yml`)
- Open Graph / Twitter Card meta tags in `index.html`
- `public/social-preview.svg` — social preview image for GitHub link sharing
- `docs-preview.png` — UI screenshot for README
- MIT License
- Bilingual README (English + Simplified Chinese)

### Fixed
- SVG placeholder replaced with real UI screenshot

---

## Template

```markdown
## [Unreleased]

### Added
### Changed
### Fixed
### Deprecated
### Removed
### Security
```
