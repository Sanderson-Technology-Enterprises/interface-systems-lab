# Interface Systems Lab

A standalone interactive showcase for `layout-style-css`, `ui-style-kit-css`, and `interactive-surface-css`.

## Publish on GitHub Pages

1. Create a GitHub repository and upload the contents of this folder to its `main` branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Open the repository's **Actions** tab and wait for **Deploy to GitHub Pages** to complete.

The included workflow automatically supports both project sites (`username.github.io/repository`) and root user/organization sites (`username.github.io`).

## Local development

```bash
npm install --legacy-peer-deps
npm run dev
```

Open <http://localhost:3000>.

## Production build

```bash
npm ci --legacy-peer-deps
npm run build
```

The static site is written to `out/`.
