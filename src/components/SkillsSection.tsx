import React from 'react';
import { skills } from '../data/profile';
import { SectionHeading } from './SectionHeading';

export const SkillsSection: React.FC = () => (
  <section id="skills" className="relative z-10 bg-navy-deep py-24 sm:py-32">
    <div className="page-x">
      <SectionHeading index="04" eyebrow="Skills" title={<>The <em>toolkit</em>.</>} />

      <dl className="mt-14 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g) => (
          <div key={g.label} className="rule py-7">
            <dt className="eyebrow">{g.label}</dt>
            <dd className="mt-4 font-serif text-[1.7rem] leading-snug text-white/95">{g.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);
