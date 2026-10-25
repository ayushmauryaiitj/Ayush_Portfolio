import React from 'react';
import { achievements } from '../data/profile';
import { SectionHeading } from './SectionHeading';

export const AchievementsSection: React.FC = () => (
  <section id="achievements" className="relative z-10 bg-navy py-24 sm:py-32">
    <div className="page-x">
      <SectionHeading index="03" eyebrow="Achievements" title={<>Hackathons and <em>competitions</em>.</>} />

      <ol className="mt-14">
        {achievements.map((a) => (
          <li key={a.title} className="rule grid gap-3 py-8 md:grid-cols-12 md:gap-8 md:py-10">
            <p className="font-serif text-3xl leading-none text-gold-soft md:col-span-3 md:text-4xl">{a.kind}</p>
            <div className="md:col-span-6">
              <h3 className="text-xl font-semibold">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-white/75">{a.detail}</p>
            </div>
            <p className="text-sm text-white/60 md:col-span-3 md:text-right">
              {a.event}
              {a.year && <span className="block">{a.year}</span>}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
