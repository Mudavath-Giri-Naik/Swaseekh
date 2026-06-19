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
    <div className="sticky top-4 md:top-8 flex h-[85vh] md:h-[90vh] items-start justify-center pt-8 md:pt-[12vh]">
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
