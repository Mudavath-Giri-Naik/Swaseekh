"use client";

import { useEffect, useRef } from "react";
import { ChevronRightIcon } from "lucide-react";
import { useScroll, cancelFrame, frame } from "motion/react";
import { ReactLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";

import ParallaxCardEffect from "./ui/parallax-card-effect";
import { cn } from "@/lib/utils";

const cardItems = [
  {
    title: "Decode Layers",
    headline: "Stop memorizing. Start decoding.",
    description: "Every concept is broken down to its root — etymology, intuition, and the \"why\" behind it. No more cramming definitions you'll forget in a week. Once you decode a concept, it stays decoded.",
    cta: "Decode a concept",
    className: "bg-[#FFC4C4] text-[#1A1A2E]" // Pink
  },
  {
    title: "PYQ Intelligence",
    headline: "Every PYQ, tagged with intent.",
    description: "2000+ previous year questions tagged by cognitive type and distractor pattern. Don't just solve the question — know exactly why each wrong option was placed there to trap you.",
    cta: "Explore tagged PYQs",
    className: "bg-[#C4FFCE] text-[#1A1A2E]" // Green
  },
  {
    title: "Built for GATE CSE 2027",
    headline: "Not generic. Not recycled. Built for your exam.",
    description: "No bloated content dump copied from 10 different sources. Every topic, every PYQ, every layer is structured specifically around the GATE CSE pattern — nothing you don't need.",
    cta: "See the syllabus map",
    className: "bg-[#FFE4C4] text-[#1A1A2E]" // Peach/Orange
  },
  {
    title: "Weak Area Tracking",
    headline: "Know exactly where you're bleeding marks.",
    description: "Your dashboard tracks performance across topics and cognitive tags, so you stop guessing what to revise next and start fixing your actual gaps.",
    cta: "View your dashboard",
    className: "bg-[#C4D7FF] text-[#1A1A2E]" // Blue
  },
  {
    title: "Peer-Validated Community",
    headline: "500+ aspirants already trust this.",
    description: "Swaseekh isn't a solo experiment — it's been tested and validated inside a 500+ member GATE CSE peer community before it ever reached you.",
    cta: "Join the community",
    className: "bg-[#EAC4FF] text-[#1A1A2E]" // Purple
  },
  {
    title: "Pricing",
    headline: "Less than one coaching test series.",
    description: "₹999/year. Unlimited decode layers, full PYQ bank, complete tracking. No hidden tiers, no surprise upsells.",
    cta: "Start at ₹999/year",
    className: "bg-[#FFF9C4] text-[#1A1A2E]" // Yellow
  }
];

export default function FeaturesParallax() {
  const lenisRef = useRef<LenisRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  const ParallaxCardItem = ({ item, id }: { item: typeof cardItems[0]; id: number }) => {
    const targetScale = 1 - (cardItems.length - id) * 0.05;

    return (
      <ParallaxCardEffect
        id={id}
        progress={scrollYProgress}
        range={[id * 0.15, 1]}
        targetScale={targetScale}
        className={cn(
          "relative flex flex-col justify-center rounded-xl md:rounded-2xl px-8 py-12 md:px-16 md:py-16 w-[90vw] max-w-[800px] min-h-[350px]",
          item.className
        )}>
        <div className="flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 h-full">
          <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {item.title}
          </h3>
          <p className="text-base sm:text-lg opacity-80 max-w-[600px] leading-relaxed">
            <strong className="font-semibold block mb-1">{item.headline}</strong>
            {item.description}
          </p>
          <div className="pt-2">
            <button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1C1C1C] text-white text-sm font-medium transition-all hover:bg-[#333333]">
              {item.cta} <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </ParallaxCardEffect>
    );
  };

  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
      <div ref={containerRef} className="relative z-20 pb-32 pt-24 mt-12 w-full">
        
        {/* Sticky decorative image container */}
        <div className="absolute inset-0 z-30 pointer-events-none hidden md:block">
          <div className="sticky top-0 h-screen w-full flex items-end justify-end pb-12 pr-0">
            <img src="/objects.svg" alt="Decorative objects" className="w-[200px] md:w-[300px] lg:w-[450px] h-auto object-contain opacity-90 translate-x-[15%] lg:translate-x-[22%]" />
          </div>
        </div>

        <div className="mx-auto flex flex-col items-center relative z-10 w-full max-w-[1440px]">
          {cardItems.map((cardItem, i) => (
            <ParallaxCardItem item={cardItem} key={i} id={i} />
          ))}
        </div>
      </div>
    </>
  );
}
