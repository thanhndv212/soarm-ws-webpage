// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'soarm-ws',
  tagline: 'A full-stack workspace for SO-ARM100 manipulator research',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://thanhndv212.github.io',
  baseUrl: '/soarm-ws-webpage/',

  organizationName: 'thanhndv212',
  projectName: 'soarm-ws-webpage',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/thanhndv212/soarm-ws-webpage/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/soarm_social_card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'soarm-ws',
        logo: {
          alt: 'SO-ARM100 follower arm',
          src: 'img/soarm_logo.jpg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/thanhndv212/soarm-ws',
            label: 'Code',
            position: 'right',
          },
          {
            href: 'https://github.com/TheRobotStudio/SO-ARM100',
            label: 'Hardware',
            position: 'right',
          },
          {
            href: 'https://github.com/thanhndv212/soarm-ws/blob/main/SOARM_MJLAB_ROADMAP.md',
            label: 'Roadmap',
            position: 'right',
          },
          {
            type: 'dropdown',
            label: 'More Research',
            position: 'right',
            items: [
              {
                label: 'Figaroh — Robotic SysID toolbox',
                href: 'https://thanhndv212.github.io/figaroh-plus-webpage/',
              },
              {
                label: 'Tiago — Mobile Manipulator Calibration',
                href: 'https://thanhndv212.github.io/tiago-calibration-webpage/',
              },
              {
                label: 'TALOS — Humanoid Calibration',
                href: 'https://thanhndv212.github.io/talos-calibration-webpage/',
              },
              {
                label: 'Walka RL — Bipedal Locomotion',
                href: 'https://thanhndv212.github.io/walka-rl-webpage/',
              },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {label: 'Introduction', to: '/'},
              {label: 'Architecture', to: '/architecture'},
              {label: 'Packages', to: '/packages'},
            ],
          },
          {
            title: 'Links',
            items: [
              {label: 'soarm-ws on GitHub', href: 'https://github.com/thanhndv212/soarm-ws'},
              {label: 'SO-ARM100 hardware', href: 'https://github.com/TheRobotStudio/SO-ARM100'},
              {label: 'Author', href: 'https://thanhndv212.github.io'},
            ],
          },
        ],
        copyright: `This website is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
