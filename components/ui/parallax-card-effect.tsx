"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, useTransform } from "motion/react";

interface CardProps {
  id: number;
  className?: string;
  progress: any;
  range: number[];
  targetScale: number;
  children?: React.ReactNode;
}

export default function ParallaxCardEffect({
  id,
  className,
  progress,
  range,
  targetScale,
  children
}: CardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-0 flex h-screen items-start justify-center pt-24 md:pt-[15vh]">
      <motion.div
        style={{
          scale,
          top: `${id * 24}px`,
          transformOrigin: "top center"
        }}
        className={className}>
        {children}
      </motion.div>
    </div>
  );
}
