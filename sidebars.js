// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'intro',
    'architecture',
    {
      type: 'category',
      label: 'Deep Dives',
      collapsed: false,
      items: [
        'deep-dives/teleoperation-loop',
        'deep-dives/rl-training-pipeline',
        'deep-dives/tamp-pipeline',
      ],
    },
    'packages',
    {
      type: 'category',
      label: 'Quick Start',
      items: ['quick-start/workspace-installation'],
    },
    {
      type: 'category',
      label: 'Specifications',
      items: ['specifications/hardware'],
    },
  ],
};

export default sidebars;
