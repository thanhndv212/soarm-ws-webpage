# soarm-ws

This is the repository that contains source code for the [soarm-ws project website](https://thanhndv212.github.io/soarm-ws-webpage), documenting the [soarm-ws](https://github.com/thanhndv212/soarm-ws) full-stack workspace for SO-ARM100 manipulator research.

This site is a living project page, not a point-in-time writeup: as `soarm-ws`'s packages evolve (see its [ARCHITECTURE.md](https://github.com/thanhndv212/soarm-ws/blob/main/ARCHITECTURE.md) and [SOARM_MJLAB_ROADMAP.md](https://github.com/thanhndv212/soarm-ws/blob/main/SOARM_MJLAB_ROADMAP.md)), update `index.html`'s Packages/Roadmap sections to match.

## How to Create a GitHub.io Webpage

GitHub Pages is a free hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub and publishes a website. Learn more here: https://pages.github.com/
Your site may take a few minutes to deploy. GitHub will show a green checkmark when it's ready.

### Website Structure

```
soarm-ws-webpage/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── README.md
```

- `index.html`: the project's landing page (overview, architecture, packages, hardware, simulation/learning, roadmap, installation).
- `static/`: static assets — Bulma/FontAwesome CSS/JS (shared template assets, copied from the other project pages in this family) plus this project's own images (`soarm100.png`, `soarm_ws_architecture.svg`).

### Deploying

```bash
git add .
git commit -m "Update project page"
git push origin main
```

Then visit `https://thanhndv212.github.io/soarm-ws-webpage` to see the live site.

# Website License
<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
