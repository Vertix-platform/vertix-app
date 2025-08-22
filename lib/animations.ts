import { Variants } from 'framer-motion';

// Mobile menu slide-in animation
export const mobileMenuVariants: Variants = {
  closed: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Backdrop fade animation
export const backdropVariants: Variants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

// Stagger animation for menu items
export const menuItemVariants: Variants = {
  closed: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
  open: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
};

// Fade in animation
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Scale animation
export const scaleVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Slide up animation
export const slideUpVariants: Variants = {
  hidden: {
    y: 50,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Page transition animation
export const pageTransitionVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};
