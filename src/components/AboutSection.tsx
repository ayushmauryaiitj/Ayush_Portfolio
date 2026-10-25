import React from 'react';
import { coursework, education, profile } from '../data/profile';
import { SectionHeading } from './SectionHeading';

export const AboutSection: React.FC = () => (
  <section id="about" className="relative z-10 bg-navy py-24 sm:py-32">
    <div className="page-x">
      <SectionHeading index="01" eyebrow="About" title={<>Models are only useful when someone can <em>act</em> on them.</>} />

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-6 text-lg leading-relaxed text-white/85 lg:col-span-7">
          {profile.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>

        <div className="lg:col-span-5">
          <h3 className="eyebrow">Education</h3>
          <ul className="mt-5">
            {education.map((e) => (
              <li key={e.qualification} className="rule flex items-baseline justify-between gap-6 py-5">
                <div>
                  <p className="font-semibold">{e.qualification}</p>
                  <p className="mt-1 text-sm text-white/65">{e.institution}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-serif text-2xl leading-none text-gold-soft">{e.score}</p>
                  {e.year && <p className="mt-1.5 text-xs text-white/55">{e.year}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="eyebrow">Key coursework</h3>
        <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {coursework.map((g) => (
            <div key={g.label} className="rule pt-5">
              <p className="font-semibold">{g.label}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {g.items.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
