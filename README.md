# Theme Organization (Halo v2)

## Build assets (Vite)

1. Install dependencies:

```bash
npm install
```

2. Build assets:

```bash
npm run build
```

Output assets are written to:

- `templates/assets/build`

## Notes

- `templates/modules/base-head.html` loads `build/main.css` and `build/main.js`.
- Page templates load their own `build/page-*.css` and optional `build/page-*.js`.
- Run `npm run build:watch` while editing files under `src/`.
- Build output `templates/assets/build` is ignored by git; run `npm run build` before publishing.
