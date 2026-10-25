import React from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { profile } from '../data/profile';

const channels = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: Mail, external: false },
  { label: 'Phone', value: profile.phone, href: profile.phoneHref, icon: Phone, external: false },
  { label: 'LinkedIn', value: 'in/ayushmauryaiitj', href: profile.links.linkedin, icon: Linkedin, external: true },
  { label: 'GitHub', value: 'ayushmauryaiitj', href: profile.links.github, icon: Github, external: true },
];

export const ContactSection: React.FC = () => (
  <section id="contact" className="relative z-10 bg-navy py-24 sm:py-32">
    <div className="page-x">
      <p className="eyebrow">
        <span className="text-white/45">05</span>
        <span className="mx-3 inline-block h-px w-8 translate-y-[-3px] bg-gold/60" aria-hidden />
        Contact
      </p>
      <h2 className="mt-6 max-w-5xl font-serif text-5xl leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl">
        Working on something in AI or data? <em className="text-gold-soft">Let's talk.</em>
      </h2>

      <ul className="mt-16 grid sm:grid-cols-2 xl:grid-cols-4">
        {channels.map(({ label, value, href, icon: Icon, external }) => (
          <li key={label} className="rule xl:border-l xl:border-t-0 xl:first:border-l-0 xl:[&:not(:first-child)]:pl-8 sm:[&:nth-child(even)]:pl-8 xl:[&:nth-child(even)]:pl-8">
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="group flex items-center justify-between gap-4 py-7 sm:pr-8"
            >
              <span>
                <span className="flex items-center gap-2 text-sm text-white/60">
                  <Icon size={15} aria-hidden /> {label}
                </span>
                <span className="mt-2 block break-all text-lg font-semibold sm:text-xl">{value}</span>
              </span>
              <ArrowUpRight
                size={22}
                aria-hidden
                className="shrink-0 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
