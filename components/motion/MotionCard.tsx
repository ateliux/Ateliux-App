"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { createScaleVariant, smoothEase } from "./motion-variants";

type MotionCardProps = HTMLMotionProps<"div"> & {
  delay?: number;
  hover?: boolean;
};

export function MotionCard({
  children,
  delay = 0,
  hover = true,
  ...props
}: MotionCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.18 }}
      variants={createScaleVariant(delay)}
      whileHover={hover ? { y: -4, scale: 1.015 } : undefined}
      transition={{ duration: 0.25, ease: smoothEase }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
