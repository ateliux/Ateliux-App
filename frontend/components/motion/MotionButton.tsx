"use client";

import Link from "next/link";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ComponentProps } from "react";

export function MotionButton({
  children,
  ...props
}: HTMLMotionProps<"button">) {
  return (
    <motion.button
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

const AnimatedLink = motion.create(Link);

export function MotionLink({
  children,
  ...props
}: ComponentProps<typeof AnimatedLink>) {
  return (
    <AnimatedLink
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      {...props}
    >
      {children}
    </AnimatedLink>
  );
}
