"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import {
  createFadeVariant,
  type MotionDirection,
} from "./motion-variants";

type MotionItemProps = HTMLMotionProps<"div"> & {
  delay?: number;
  direction?: MotionDirection;
  amount?: number;
  staggered?: boolean;
};

export function MotionItem({
  children,
  delay = 0,
  direction = "up",
  amount = 0.18,
  staggered = false,
  ...props
}: MotionItemProps) {
  return (
    <motion.div
      initial={staggered ? undefined : "hidden"}
      whileInView={staggered ? undefined : "visible"}
      viewport={staggered ? undefined : { once: false, amount }}
      variants={createFadeVariant(direction, delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
