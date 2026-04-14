export const EASING = {
  standard: [0.22, 1, 0.36, 1],
  emphasized: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
};

export const TIMING = {
  instant: 0.12,
  fast: 0.18,
  base: 0.28,
  medium: 0.42,
  slow: 0.62,
};

export const SPRING = {
  type: 'spring',
  stiffness: 230,
  damping: 24,
  mass: 0.86,
};

export const tabOrder = ['home', 'dashboard', 'bookings', 'feedback', 'calendar', 'profile'];

export const getTabDirection = (previousTab, nextTab) => {
  const previousIndex = tabOrder.indexOf(previousTab);
  const nextIndex = tabOrder.indexOf(nextTab);

  if (previousIndex === -1 || nextIndex === -1) {
    return 1;
  }

  return nextIndex >= previousIndex ? 1 : -1;
};

export const pageDirectionalVariants = {
  initial: (direction = 1) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
    y: 8,
    scale: 0.985,
    filter: 'blur(4px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: TIMING.medium,
      ease: EASING.standard,
    },
  },
  exit: (direction = 1) => ({
    opacity: 0,
    x: direction > 0 ? -22 : 22,
    y: -4,
    scale: 0.992,
    filter: 'blur(2px)',
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  }),
};

export const modalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: TIMING.base,
      ease: EASING.standard,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

export const popoverVariants = {
  initial: { opacity: 0, y: -12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.base,
      ease: EASING.emphasized,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

export const modalSheetVariants = {
  initial: { y: '100%', opacity: 0.5 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      ...SPRING,
      damping: 28,
    },
  },
  exit: {
    y: '100%',
    opacity: 0.3,
    transition: {
      duration: TIMING.base,
      ease: EASING.exit,
    },
  },
};

export const fadeScaleVariants = {
  initial: { opacity: 0, y: 14, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.base,
      ease: EASING.emphasized,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.97,
    transition: {
      duration: TIMING.fast,
      ease: EASING.exit,
    },
  },
};

export const staggerContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: TIMING.base,
      ease: EASING.standard,
    },
  },
};

export const microInteraction = {
  whileTap: { scale: 0.95 },
  whileHover: {
    y: -2,
    scale: 1.015,
    transition: {
      duration: TIMING.fast,
      ease: EASING.standard,
    },
  },
};

export const card3dInteraction = {
  whileTap: { scale: 0.985 },
  whileHover: {
    y: -8,
    scale: 1.01,
    rotateX: 3,
    rotateY: -2,
    transition: {
      duration: TIMING.base,
      ease: EASING.standard,
    },
  },
};

export const iconLoopVariants = {
  idle: {
    scale: 1,
    y: 0,
    rotate: 0,
  },
  active: {
    scale: [1, 1.12, 1],
    y: [0, -1.5, 0],
    rotate: [0, -4, 4, 0],
    transition: {
      duration: TIMING.slow,
      ease: EASING.standard,
    },
  },
};

export const pulseVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.08, 1],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const anticipatoryButtonVariants = {
  rest: { scale: 1, y: 0 },
  nudge: {
    scale: [1, 1.03, 1],
    y: [0, -2, 0],
    transition: {
      duration: 1.7,
      repeat: Infinity,
      repeatDelay: 2.1,
      ease: EASING.standard,
    },
  },
};

export const clampProgress = (value) => {
  const boundedValue = Math.max(0, Math.min(value, 100));
  return `${boundedValue}%`;
};
