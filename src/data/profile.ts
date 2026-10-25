// Single source for personal content. Every entry here comes from the resume
// (ayush_maurya_resume.pdf, Oct 2026) unless a comment says otherwise.

export interface LinkItem {
  label: string;
  href: string;
}

export interface EducationItem {
  qualification: string;
  institution: string;
  score: string;
  year?: string;
}

export type AchievementKind = 'Winner' | '1st Prize' | '3rd Prize' | 'Top 10 Finalist';

export interface Achievement {
  kind: AchievementKind;
  title: string;
  event: string;
  year?: string;
  detail: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export const profile = {
  name: 'Ayush Maurya',
  role: 'Applied AI & Data Science',
  institution: 'Indian Institute of Technology Jodhpur',
  institutionShort: 'IIT Jodhpur',
  location: 'Jodhpur, Rajasthan', // public GitHub profile
  email: 'b25bs1064@iitj.ac.in',
  phone: '+91 81123 27192',
  phoneHref: 'tel:+918112327192',
  links: {
    linkedin: 'https://www.linkedin.com/in/ayushmauryaiitj/',
    github: 'https://github.com/ayushmauryaiitj',
  },
  intro:
    'B.S. student in Applied AI and Data Science at IIT Jodhpur. I build machine-learning systems end to end, from cleaning the data and training the model to the dashboard someone actually uses to make a decision.',
  about: [
    'Most of my work sits where data meets a real operational question. How should a remote microgrid split its load between solar, wind, batteries and diesel? Which regions are heading into drought? How much will a crop yield this season? I like problems where a model is only useful if its output can be acted on.',
    'That shapes how I build. I pair forecasting and classification models with optimisation and visualisation, and I ship them as working tools: Streamlit dashboards for analysis, and React and TypeScript front ends when a project needs a full product. Coursework in statistics, linear algebra, numerical optimisation and pattern recognition gives me the foundations under that.',
  ],
};

export const education: EducationItem[] = [
  {
    qualification: 'B.S., Applied AI and Data Science',
    institution: 'Indian Institute of Technology Jodhpur',
    score: 'CGPA 8.50',
  },
  { qualification: 'Class 12', institution: 'Dwivedi Paradise English High School', score: '71.2%', year: '2024' },
  { qualification: 'Class 10', institution: 'MPVM Ganga Gurukulam School', score: '94.6%', year: '2022' },
];

export const coursework: SkillGroup[] = [
  {
    label: 'Machine Learning & AI',
    items: ['Foundations of AI', 'Machine Learning', 'Pattern Recognition Principles'],
  },
  {
    label: 'Mathematics & Statistics',
    items: [
      'Foundations of Statistics and Probability',
      'Linear Algebra and Numerical Analysis',
      'Numerical Optimization',
    ],
  },
  {
    label: 'Data Science & Analytics',
    items: ['Basics of Data Analytics', 'Visualization and Storytelling with Data', 'Programming for Data Science'],
  },
  {
    label: 'Computer Science',
    items: ['Introduction to Databases', 'Operating Systems', 'Algorithmic Thinking and its Applications'],
  },
];

export const achievements: Achievement[] = [
  {
    kind: 'Winner',
    title: 'SIH 2026 Internal Hackathon',
    event: 'IIT Jodhpur',
    year: '2026',
    detail:
      'Part of the winning team in the institute round, qualifying for the next stage with KrishiMitra, an AI agriculture platform combining crop disease detection, yield prediction and farmer decision support.',
  },
  {
    kind: '1st Prize',
    title: 'Jagrti Competition',
    event: 'Jagrti',
    year: '2026',
    detail: 'First position for presenting problem-solving ideas and analytical thinking.',
  },
  {
    kind: '3rd Prize',
    title: 'IIT BHU Techfest',
    event: 'IIT BHU',
    year: '2026',
    detail: 'Third position in a technology competition judged on practical implementation and technical presentation.',
  },
  {
    kind: 'Top 10 Finalist',
    title: 'SARCathon',
    event: 'IIT Bombay',
    detail: 'Selected among the top ten finalists in a national analytics, reasoning and problem-solving competition.',
  },
];

// Resume skills first; the last two groups list tools used in the resume's
// project tech stacks and public repositories.
export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'MySQL'] },
  { label: 'Machine Learning', items: ['Regression', 'Classification', 'Random Forest', 'SVM'] },
  { label: 'Libraries', items: ['Pandas', 'NumPy', 'Scikit-learn', 'Seaborn', 'Matplotlib'] },
  { label: 'Tools', items: ['Power BI', 'GAMS', 'Streamlit', 'Git', 'GitHub'] },
  { label: 'Deep Learning (projects)', items: ['PyTorch', 'LSTM networks'] },
  { label: 'Web (projects)', items: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'PostgreSQL'] },
];

export const navItems: LinkItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Achievements', href: '#achievements' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
];
