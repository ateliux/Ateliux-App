"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import {
  createFadeVariant,
  type MotionDirection,
} from "./motion-variants";

type MotionSectionProps = HTMLMotionProps<"section"> & {
  delay?: number;
  direction?: MotionDirection;
  amount?: number;
};

export function MotionSection({
  children,
  delay = 0,
  direction = "up",
  amount = 0.18,
  ...props
}: MotionSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount }}
      variants={createFadeVariant(direction, delay)}
      {...props}
    >
      {children}
    </motion.section>
  );
}
