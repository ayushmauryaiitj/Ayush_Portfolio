import React from 'react';
import { ArrowUpRight, Github } from 'lucide-react';
import { featuredProjects, moreProjects, type Project } from '../data/projects';
import { profile } from '../data/profile';
import { SectionHeading } from './SectionHeading';

const ExternalLink: React.FC<{ href: string; children: React.ReactNode; label: string }> = ({ href, children, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-link text-sm" aria-label={label}>
    {children}
  </a>
);

const FeaturedProject: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const flip = index % 2 === 1;
  return (
    <article className="rule grid gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
      <figure className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <div className="overflow-hidden rounded-[4px] bg-navy-deep shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] ring-1 ring-black/10">
          <img
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </div>
      </figure>

      <div className={`flex flex-col lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
        <p className="eyebrow">
          <span className="text-white/45">{String(index + 1).padStart(2, '0')}</span>
          <span className="mx-3 text-white/30">/</span>
          {project.domain}
        </p>
        <h3 className="mt-4 font-serif text-5xl leading-none tracking-tight sm:text-6xl">{project.title}</h3>
        <p className="mt-4 text-lg text-white/85">{project.tagline}</p>

        <p className="mt-6 text-[0.95rem] leading-relaxed text-white/70">{project.problem}</p>

        <ul className="mt-6 space-y-3 text-[0.95rem] leading-relaxed text-white/85">
          {project.work.map((w) => (
            <li key={w} className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2.5 before:bg-gold">
              {w}
            </li>
          ))}
        </ul>

        {project.result && (
          <p className="mt-7 flex items-baseline gap-3">
            <span className="font-serif text-5xl leading-none text-gold-soft">{project.result.value}</span>
            <span className="text-sm text-white/70">{project.result.label}</span>
          </p>
        )}

        {project.context && <p className="mt-6 text-sm italic leading-relaxed text-white/60">{project.context}</p>}

        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Technologies">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
          {project.links.demo && (
            <ExternalLink href={project.links.demo} label={`${project.title} live demo (opens in a new tab)`}>
              Live demo <ArrowUpRight size={15} aria-hidden />
            </ExternalLink>
          )}
          {project.links.github && (
            <ExternalLink href={project.links.github} label={`${project.title} source on GitHub (opens in a new tab)`}>
              <Github size={15} aria-hidden /> Source
            </ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
};

export const ProjectsSection: React.FC = () => (
  <section id="projects" className="relative z-10 bg-navy-deep py-24 sm:py-32">
    <div className="page-x">
      <SectionHeading
        index="02"
        eyebrow="Selected projects"
        title={<>Forecasting, optimisation and the <em>products</em> around them.</>}
        aside={<p className="text-sm leading-relaxed">Three projects from my resume, with live demos and source where they are public.</p>}
      />

      <div className="mt-14">
        {featuredProjects.map((p, i) => (
          <FeaturedProject key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="rule pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="font-serif text-4xl tracking-tight">More on GitHub</h3>
          <ExternalLink href={profile.links.github} label="All repositories on GitHub (opens in a new tab)">
            All repositories <ArrowUpRight size={15} aria-hidden />
          </ExternalLink>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          {moreProjects.map((p) => (
            <article key={p.title} className="group flex flex-col">
              {p.image && (
                <div className="overflow-hidden rounded-[4px] ring-1 ring-black/10">
                  <img
                    src={p.image.src}
                    alt={p.image.alt}
                    width={p.image.width}
                    height={p.image.height}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/9] h-auto w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <h4 className="mt-6 text-xl font-semibold">{p.title}</h4>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-white/75">{p.summary}</p>
              {p.result && <p className="mt-4 text-sm font-semibold text-gold-soft">{p.result}</p>}
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
                {p.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
                {p.links.demo && (
                  <ExternalLink href={p.links.demo} label={`${p.title} live demo (opens in a new tab)`}>
                    Live demo <ArrowUpRight size={15} aria-hidden />
                  </ExternalLink>
                )}
                <ExternalLink href={p.links.github} label={`${p.title} source on GitHub (opens in a new tab)`}>
                  <Github size={15} aria-hidden /> Source
                </ExternalLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);
