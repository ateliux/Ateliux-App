"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { createStaggerContainer } from "./motion-variants";

export function MotionForm({
  children,
  ...props
}: HTMLMotionProps<"form">) {
  return (
    <motion.form
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.12 }}
      variants={createStaggerContainer()}
      {...props}
    >
      {children}
    </motion.form>
  );
}
