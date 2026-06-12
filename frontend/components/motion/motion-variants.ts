import type { Transition, Variants } from "framer-motion";

export type MotionDirection = "up" | "down" | "left" | "right" | "none";

export const smoothEase = [0.22, 1, 0.36, 1] as const;

export const smoothTransition: Transition = {
  duration: 0.65,
  ease: smoothEase,
};

export function createFadeVariant(
  direction: MotionDirection = "up",
  delay = 0,
): Variants {
  const distance = 32;
  const offset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }[direction];

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.65,
        delay,
        ease: smoothEase,
      },
    },
  };
}

export function createScaleVariant(delay = 0): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: 0.975,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: smoothEase,
      },
    },
  };
}

export function createStaggerContainer(delay = 0.05): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: 0.08,
      },
    },
  };
}
