# soarm-ws

This is the repository that contains source code for the [soarm-ws project website](https://thanhndv212.github.io/soarm-ws-webpage), documenting the [soarm-ws](https://github.com/thanhndv212/soarm-ws) full-stack workspace for SO-ARM100 manipulator research.

This site is a living project page, not a point-in-time writeup: as `soarm-ws`'s packages evolve (see its [ARCHITECTURE.md](https://github.com/thanhndv212/soarm-ws/blob/main/ARCHITECTURE.md) and [SOARM_MJLAB_ROADMAP.md](https://github.com/thanhndv212/soarm-ws/blob/main/SOARM_MJLAB_ROADMAP.md)), update `index.html`'s Packages/Roadmap sections to match.

## Docs site

This is a [Docusaurus](https://docusaurus.io/) site: a multi-page documentation hub (sidebar nav, search-ready,
one page per topic) rather than the single scrolling page this repo used to be. It's modeled on
[docs.robotis.com](https://docs.robotis.com/)'s structure, adapted to `soarm-ws`'s actual packages.

### Website Structure

```
soarm-ws-webpage/
├── docs/                  # all doc pages (Markdown), organized per sidebars.js
├── docusaurus.config.js   # site config (nav, footer, GitHub Pages settings)
├── sidebars.js            # sidebar structure
├── src/css/custom.css     # theme overrides
├── static/img/            # diagrams and images referenced from docs/
└── package.json
```

Run locally:

```bash
npm install
npm start        # dev server with hot reload
npm run build    # production build into build/
```

### Deploying

Deployment is automated by `.github/workflows/deploy.yml`: every push to `main` builds the site and publishes it
via GitHub Pages. **One-time setup:** in the repo's Settings → Pages, set "Source" to **GitHub Actions** (not
"Deploy from a branch") for this workflow to take effect.

Then visit `https://thanhndv212.github.io/soarm-ws-webpage` to see the live site.

# Website License
<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
