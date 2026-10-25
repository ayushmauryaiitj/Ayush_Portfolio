import React from 'react';
import { ArrowUp } from 'lucide-react';
import { profile } from '../data/profile';

export const Footer: React.FC = () => (
  <footer className="relative z-10 border-t border-white/10 bg-navy-deep">
    <div className="page-x flex flex-col gap-4 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {new Date().getFullYear()} {profile.name} · {profile.institution}
      </p>
      <a href="#top" className="inline-flex items-center gap-2 transition-colors hover:text-white">
        Back to top <ArrowUp size={14} aria-hidden />
      </a>
    </div>
  </footer>
);
