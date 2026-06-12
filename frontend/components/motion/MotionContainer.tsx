"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { createStaggerContainer } from "./motion-variants";

type MotionContainerProps = HTMLMotionProps<"div"> & {
  delay?: number;
  amount?: number;
};

export function MotionContainer({
  children,
  delay = 0.05,
  amount = 0.18,
  ...props
}: MotionContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount }}
      variants={createStaggerContainer(delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
