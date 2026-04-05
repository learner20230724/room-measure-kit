# Room Measure Kit

English · [中文](./README.md)

[![Validate](https://github.com/learner20230724/room-measure-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/learner20230724/room-measure-kit/actions/workflows/validate.yml)
[![Deploy to GitHub Pages](https://github.com/learner20230724/room-measure-kit/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/learner20230724/room-measure-kit/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB)](https://react.dev/)

A small web tool for estimating room area, perimeter, wall area, flooring allowance, and paint usage.

It is meant for the common case: a rectangular room, quick numbers, and a cleaner UI than the average one-off calculator.

## Why this exists

A quick landscape scan showed plenty of single-purpose tools already exist for flooring-only or paint-only estimation, plus a few hobby repos that stop at raw form inputs. The practical gap is not new math. It is a lightweight, decent-looking all-in-one page that is easy to host, easy to fork, and easy to screenshot in a public repo.

References checked before building:

- `CoreyMcCoy/flooring-calculator` on GitHub
- `MikeTheWayne/Paint-Calculator` on GitHub
- a few standalone flooring estimator pages with mixed UX quality

## What it does

- switch between metric and imperial inputs, including paint coverage units
- try built-in room preset chips for faster demos and screenshots
- calculate floor area and room perimeter
- calculate wall area from optional wall height
- estimate flooring requirement with waste percentage
- estimate paint requirement from a coverage rate
- copy a compact result summary for chat or docs
- shareable links: changing any input updates the URL in-place; a "Share link" button copies a link that restores the exact room inputs when opened
- keep the calculation logic covered by a small Vitest suite
- ship as a static Vite + React app

## Screenshot

A preview screenshot is included at `docs-preview.png`.

A social sharing preview is also included at `public/social-preview.svg`, and `index.html` already ships with Open Graph and Twitter card metadata so the deployed link has a cleaner preview.

If you want a real runtime screenshot instead of the preview card, run:

```bash
npm install
npm run dev
```

Then open the local URL and capture the main viewport.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run test
npm run build
```

## Build

```bash
npm run build
npm run preview
```

## Live Demo

https://learner20230724.github.io/room-measure-kit/

## Deploy

A GitHub Pages workflow is included at `.github/workflows/deploy-pages.yml`.

After pushing the repository to GitHub:

1. open **Settings → Pages**
2. set **Source** to **GitHub Actions**
3. push to `main` or run the workflow manually

Because Vite is configured with `base: './'`, the generated build also works as a plain static bundle if you want to drop `dist/` into another static host.

## Chinese version

For Chinese-first documentation, see [README.md](./README.md).

## Notes

- Wall area assumes four full walls and does not subtract doors or windows.
- Paint usage is only a quick estimate. Real projects depend on coats, surface condition, and product coverage.
- Flooring waste defaults to a practical planning allowance, not a guarantee.

## Tech stack

- React
- TypeScript
- Vite

## License

MIT

## Other Resources

- [CHANGELOG](./CHANGELOG.md) — version history
- [ROADMAP](./ROADMAP.md) — project roadmap

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=learner20230724/room-measure-kit&type=Date)](https://www.star-history.com/#learner20230724/room-measure-kit&Date)
