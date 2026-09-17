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
      items: [
        'quick-start/getting-your-so-101',
        'quick-start/assembly-and-wiring',
        'quick-start/workspace-installation',
        'quick-start/calibration',
        'quick-start/bringup-and-dashboard',
      ],
    },
    {
      type: 'category',
      label: 'Specifications',
      items: [
        'specifications/hardware',
        'specifications/servo-control-table',
        'specifications/software',
      ],
    },
    {
      type: 'category',
      label: 'Teleoperation',
      items: [
        'teleoperation/imu-setup',
        'teleoperation/running-teleop',
        'teleoperation/tuning-guide',
        'teleoperation/recording-demonstrations',
      ],
    },
    {
      type: 'category',
      label: 'Imitation Learning',
      items: [
        'imitation-learning/index',
        'imitation-learning/dataset-recording-and-format',
        'imitation-learning/training',
      ],
    },
    {
      type: 'category',
      label: 'Reinforcement Learning & Simulation',
      items: [
        'reinforcement-learning/index',
        'reinforcement-learning/environment-and-task-config',
        'reinforcement-learning/training-runs',
        'reinforcement-learning/roadmap',
      ],
    },
    {
      type: 'category',
      label: 'Task & Motion Planning',
      items: [
        'task-and-motion-planning/index',
        'task-and-motion-planning/dashboard',
        'task-and-motion-planning/example-walkthrough',
        'task-and-motion-planning/writing-a-new-task',
      ],
    },
    'vision-and-camera-calibration',
    'troubleshooting-and-faq',
    'release-notes',
    'open-source',
  ],
};

export default sidebars;
