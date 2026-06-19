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
    title: "Feature 1: Decode Layers",
    headline: "Stop memorizing. Start decoding.",
    description: "Every concept is broken down to its root — etymology, intuition, and the \"why\" behind it. No more cramming definitions you'll forget in a week. Once you decode a concept, it stays decoded.",
    cta: "Decode a concept",
    className: "bg-[#FFF1F0] border-[#FFD5D2] text-[#331816] shadow-[0_8px_30px_rgba(255,213,210,0.4)]"
  },
  {
    title: "Feature 2: PYQ Intelligence",
    headline: "Every PYQ, tagged with intent.",
    description: "2000+ previous year questions tagged by cognitive type and distractor pattern. Don't just solve the question — know exactly why each wrong option was placed there to trap you.",
    cta: "Explore tagged PYQs",
    className: "bg-[#F0F5FF] border-[#D4E4FF] text-[#162133] shadow-[0_8px_30px_rgba(212,228,255,0.4)]"
  },
  {
    title: "Feature 3: Built for GATE CSE 2027",
    headline: "Not generic. Not recycled. Built for your exam.",
    description: "No bloated content dump copied from 10 different sources. Every topic, every PYQ, every layer is structured specifically around the GATE CSE pattern — nothing you don't need.",
    cta: "See the syllabus map",
    className: "bg-[#F5FFF0] border-[#D4FFD2] text-[#1B3316] shadow-[0_8px_30px_rgba(212,255,210,0.4)]"
  },
  {
    title: "Feature 4: Weak Area Tracking",
    headline: "Know exactly where you're bleeding marks.",
    description: "Your dashboard tracks performance across topics and cognitive tags, so you stop guessing what to revise next and start fixing your actual gaps.",
    cta: "View your dashboard",
    className: "bg-[#FFF8F0] border-[#FFE4D2] text-[#332216] shadow-[0_8px_30px_rgba(255,228,210,0.4)]"
  },
  {
    title: "Feature 5: Peer-Validated Community",
    headline: "500+ aspirants already trust this.",
    description: "Swaseekh isn't a solo experiment — it's been tested and validated inside a 500+ member GATE CSE peer community before it ever reached you.",
    cta: "Join the community",
    className: "bg-[#F8F0FF] border-[#E8D2FF] text-[#2A1633] shadow-[0_8px_30px_rgba(232,210,255,0.4)]"
  },
  {
    title: "Feature 6: Pricing",
    headline: "Less than one coaching test series.",
    description: "₹999/year. Unlimited decode layers, full PYQ bank, complete tracking. No hidden tiers, no surprise upsells.",
    cta: "Start at ₹999/year",
    className: "bg-[#1A1A2E] border-[#33334D] text-white shadow-[0_8px_40px_rgba(26,26,46,0.6)]"
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
          "relative flex flex-col justify-center rounded-[32px] md:rounded-[48px] px-8 py-12 md:px-16 md:py-20 border w-[92vw] max-w-[1000px] min-h-[400px] md:min-h-[500px]",
          item.className
        )}>
        <div className="space-y-6 md:space-y-8 flex flex-col h-full justify-between items-start">
          <div className="w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold tracking-widest uppercase mb-6 md:mb-8">
              {item.title}
            </div>
            <h3 className="text-[32px] sm:text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight mb-6 max-w-[800px]">
              {item.headline}
            </h3>
            <p className="text-lg md:text-2xl leading-relaxed opacity-80 max-w-3xl">
              {item.description}
            </p>
          </div>
          
          <div className="mt-8 md:mt-12">
            <button className={cn(
              "inline-flex items-center gap-2 px-6 py-4 md:px-8 md:py-5 rounded-full text-base md:text-lg font-bold transition-all hover:gap-4 hover:opacity-90 shadow-lg",
              id === cardItems.length - 1 ? "bg-[#F26419] text-white" : "bg-black text-white"
            )}>
              {item.cta} <ChevronRightIcon size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </ParallaxCardEffect>
    );
  };

  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
      <div ref={containerRef} className="relative z-20 pb-32 pt-24 mt-12">
        <div className="mx-auto flex flex-col items-center">
          {cardItems.map((cardItem, i) => (
            <ParallaxCardItem item={cardItem} key={i} id={i} />
          ))}
        </div>
      </div>
    </>
  );
}
