import React, { useRef } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { CharacterCanvas } from './CharacterCanvas';
import { profile } from '../data/profile';

export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section
      id="top"
      ref={heroRef}
      aria-label="Introduction"
      className="relative isolate overflow-hidden lg:h-[100svh] lg:min-h-[640px]"
    >
      {/* Soft key light behind the head, echoing the studio lighting the character was rendered in */}
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl max-lg:left-1/2 max-lg:top-[68%] lg:left-[66%] lg:top-[48%]"
        style={{ background: 'radial-gradient(closest-side, #22406a, transparent)' }}
      />

      <div className="page-x relative z-10 flex flex-col pt-28 lg:h-full lg:justify-center lg:pt-16">
        <div className="max-w-[34rem] lg:max-w-[27rem] xl:max-w-[31rem]">
          <p className="eyebrow">
            {profile.role} · {profile.institutionShort}
          </p>
          <h1 className="mt-5 font-serif text-[3.2rem] leading-[0.95] tracking-tight sm:text-7xl xl:text-[5.6rem]">
            Machine learning, built to be <em className="text-gold-soft">used.</em>
          </h1>
          <p className="mt-6 max-w-[30rem] text-base leading-relaxed text-white/80 sm:text-lg">{profile.intro}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-primary">
              View projects <ArrowRight size={16} aria-hidden />
            </a>
            <a href="#contact" className="btn-ghost">
              Get in touch
            </a>
          </div>
        </div>
      </div>

      {/* Character: bottom-anchored, no frame or panel; the page provides the background */}
      <CharacterCanvas
        trackingRef={heroRef}
        className="pointer-events-none relative -mt-4 ml-[-16%] aspect-[1156/960] w-[132%] max-w-none sm:ml-[-6%] sm:w-[112%] lg:absolute lg:bottom-0 lg:left-[66%] lg:m-0 lg:h-[min(90svh,56vw)] lg:w-auto lg:-translate-x-1/2"
      />

      <a
        href="#about"
        className="absolute bottom-6 left-5 z-10 hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white sm:left-8 lg:left-12 lg:inline-flex"
      >
        <ArrowDown size={14} aria-hidden /> Scroll
      </a>
    </section>
  );
};
