import React from 'react';

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ index, eyebrow, title, aside }) => (
  <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
    <div className="lg:col-span-9">
      <p className="eyebrow">
        <span className="text-white/45">{index}</span>
        <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-gold/60" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="section-title mt-5 [&_em]:text-gold-soft">{title}</h2>
    </div>
    {aside && <div className="text-white/70 lg:col-span-3 lg:pb-2">{aside}</div>}
  </header>
);
