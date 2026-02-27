"use client";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import gsap from "gsap";
import Image from "next/image";
import PremiumButton from "./PremiumButton";
import { getAssetPath } from "@/lib/utils";

const FLAVOR_DATA = [
  { name: "COOL MINT(4MG)", image: getAssetPath("/images/home-float/COOLMINT_4MG.webp") },
  { name: "WATERMELON SPLASH(4MG)", image: getAssetPath("/images/home-float/WATERMELONSPLASH_4MG.webp") },
  { name: "STRAWBERRY SPRINKLE(4MG)", image: getAssetPath("/images/home-float/STRAWBERRYSPRINKLE_4MG.webp") },
  { name: "LEMON SPARK(4MG)", image: getAssetPath("/images/home-float/LEMONSPARK_4MG.webp") },
  { name: "CLASSICAL ORIGINAL(4MG)", image: getAssetPath("/images/home-float/CLASSICALORIGINAL_4MG.webp") },
  { name: "COOL MINT(8MG)", image: getAssetPath("/images/home-float/COOLMINT_8MG.webp") },
  { name: "CLASSICAL ORIGINAL(8MG)", image: getAssetPath("/images/home-float/CLASSICALORIGINAL_8MG.webp") },
  { name: "LEMON SPARK(8MG)", image: getAssetPath("/images/home-float/LEMONSPARK_8MG.webp") },
  { name: "VELVET ROSE(8MG)", image: getAssetPath("/images/home-float/VELVETROSE_8MG.webp") },
  { name: "DOUBLE MINT(12MG)", image: getAssetPath("/images/home-float/DOUBLEMINT_12MG.webp") },
  { name: "PEPPERMINT STORM(16MG)", image: getAssetPath("/images/home-float/PEPPERMINTSTORM_16MG.webp") },
  { name: "PEPPER WHIRLWIND(20MG)", image: getAssetPath("/images/home-float/PEPPERMINTWHIRLWIND_20MG-1-2048x2048.webp") },
];

// Memoized Image Component
const FlavorImage = memo(({ image, name, isActive }: { image: string, name: string, isActive: boolean }) => (
  <div
    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${isActive ? "opacity-100" : "opacity-0"
      }`}
  >
    <Image
      src={image}
      alt={name}
      fill
      className="object-contain drop-shadow-2xl"
      priority={true}
      sizes="(max-width: 768px) 256px, 500px"
    />
  </div>
));
FlavorImage.displayName = "FlavorImage";

// Memoized Link Component
const FlavorLink = memo(({
  name,
  index,
  isHovered,
  isDimmed,
  onEnter,
  onLeave
}: {
  name: string,
  index: number,
  isHovered: boolean,
  isDimmed: boolean,
  onEnter: (index: number) => void,
  onLeave: () => void
}) => (
  <a
    href="#"
    data-cursor-ignore
    className={`text-xl sm:text-2xl md:text-2xl lg:text-5xl font-bold tracking-tight uppercase transition-all duration-300 border-l-4 border-transparent ease-in-out whitespace-nowrap w-full py-1 
      text-center lg:text-left lg:pl-[20%] ${isDimmed ? "text-gray-400 opacity-40 scale-[0.98]" : "text-black scale-100"
      }`}
    onMouseEnter={() => onEnter(index)}
    onMouseLeave={onLeave}
    onClick={(e) => e.preventDefault()}
  >
    {name}
  </a>
));
FlavorLink.displayName = "FlavorLink";

export default function PortalFlavors() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastX = useRef(0);

  const xSetter = useRef<any>(null);
  const ySetter = useRef<any>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        // Initialize position centering
        gsap.set(containerRef.current, { xPercent: -50, yPercent: -50 });

        // Create quickSetters for high-performance updates
        xSetter.current = gsap.quickSetter(containerRef.current, "x", "px");
        ySetter.current = gsap.quickSetter(containerRef.current, "y", "px");
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    // High-performance position update
    if (xSetter.current && ySetter.current) {
      xSetter.current(e.clientX);
      ySetter.current(e.clientY);
    }

    // Calculate velocity/direction
    if (lastX.current === 0) lastX.current = e.clientX;
    const deltaX = e.clientX - lastX.current;
    lastX.current = e.clientX;

    // Only tilt when hovered
    if (hoveredIndex !== null && contentRef.current) {
      const tiltAngle = -deltaX * 0.6;
      const clampedTilt = Math.max(Math.min(tiltAngle, 15), -15);

      gsap.to(contentRef.current, {
        rotate: clampedTilt,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          gsap.to(contentRef.current, {
            rotate: 0,
            duration: 0.8,
            ease: "back.out(1.2)"
          });
        }
      });
    }
  };

  const handleFlavorEnter = useCallback((index: number) => {
    setHoveredIndex(index);

    if (contentRef.current) {
      gsap.killTweensOf(contentRef.current);
      gsap.to(contentRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, []);

  const handleFlavorLeave = useCallback(() => {
    setHoveredIndex(null);
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.5,
        rotate: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <section
      id="portal-flavors"
      className="relative w-full min-h-screen bg-[#ecebe9] py-12 md:py-20 px-6 md:px-12 flex flex-col justify-between font-sans text-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Floating Image */}
      <div
        ref={containerRef}
        className="pointer-events-none fixed top-0 left-0 w-64 h-64 md:w-[500px] md:h-[500px] z-50 select-none will-change-transform"
      >
        <div
          ref={contentRef}
          className="w-full h-full opacity-0 scale-50"
        >
          {FLAVOR_DATA.map((flavor, index) => (
            <FlavorImage
              key={index}
              image={flavor.image}
              name={flavor.name}
              isActive={hoveredIndex === index}
            />
          ))}
        </div>
      </div>

      {/* Top Header */}
      <div className="flex justify-center mb-8">
        <span className="text-gray-500 text-xs md:text-sm font-normal uppercase tracking-widest">
          ( Flavors and Mg )
        </span>
      </div>

      {/* Main Content: Three Columns */}
      <div className="flex-1 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 z-10">
        {/* Left Column */}
        <div className="md:w-1/4">
          <p className="text-sm md:text-base leading-relaxed max-w-[320px]">
            Browse our complete range of tobacco-free nicotine pouches in multiple flavours and strengths. Available in 4mg to 20mg nicotine levels across mint, fruit, and specialty varieties. All pouches contain pharmaceutical-grade nicotine and are designed as a smoke-free alternative to traditional tobacco products.
          </p>
        </div>

        {/* Middle Column: Flavor Links */}
        <div className="flex-1 flex flex-col items-center lg:items-start w-full">
          <div className="flex flex-col gap-1 md:gap-2 w-full">
            {FLAVOR_DATA.map((flavor, index) => (
              <FlavorLink
                key={index}
                index={index}
                name={flavor.name}
                isHovered={hoveredIndex === index}
                isDimmed={hoveredIndex !== null && hoveredIndex !== index}
                onEnter={handleFlavorEnter}
                onLeave={handleFlavorLeave}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-1/4 flex justify-end">
          <p className="text-sm md:text-base leading-relaxed text-right max-w-[320px]">
            Designed to taste natural, not chemical. qola products are made without: microplastics, artificial preservatives, coloring agents, seed oil, trans fats, pesticides, titanium dioxide, sodium benzoate, potassium sorbate, sorbic acid, ammonium chloride, tartaric acid, acesulfame k, aspartame, ascorbic acid, magnesium hydroxide, sodium hydroxide, tocopherols.
          </p>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="flex justify-center mt-12 z-10">
        <PremiumButton
          text="Check The Details"
          size="md"
        />
      </div>
    </section>
  );
}
