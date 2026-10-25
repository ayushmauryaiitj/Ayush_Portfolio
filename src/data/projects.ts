// Project content. Descriptions follow the resume; extra technical detail and
// figures come from each project's public GitHub README (linked below).
// Images are screenshots of the live demos or charts committed to the repos.

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  domain: string;
  problem: string;
  work: string[];
  context?: string;
  result?: { value: string; label: string };
  stack: string[];
  links: { github?: string; demo?: string };
  image: ProjectImage;
}

export const featuredProjects: Project[] = [
  {
    slug: 'polarems',
    title: 'PolarEMS',
    tagline: 'Predictive energy management for polar research-station microgrids',
    domain: 'Machine Learning · Energy Optimisation',
    problem:
      'Isolated polar stations run on a mix of solar, wind, batteries and diesel. Deciding how to dispatch them under harsh weather and limited fuel is a forecasting problem and an optimisation problem at once.',
    work: [
      'Combined ML-based demand and generation forecasting with GAMS optimisation to schedule energy dispatch under operational constraints.',
      'Simulated four operating scenarios: renewable shortage, high demand, restricted fuel and severe weather.',
      'Built an interactive dashboard for monitoring, scenario simulation, dispatch visualisation and benchmarking.',
    ],
    context:
      'Built with team Buddhi Quant for Smart India Hackathon 2026. A decision-support prototype and simulation testbed; it does not control physical hardware.',
    stack: ['Python', 'Scikit-learn', 'GAMS', 'Pandas', 'NumPy', 'React', 'TypeScript', 'Streamlit'],
    links: {
      github: 'https://github.com/ayushmauryaiitj/PolarEMS',
      demo: 'https://polarems-dashboard.vercel.app/',
    },
    image: {
      src: '/projects/polarems-dashboard.webp',
      alt: 'PolarEMS dashboard showing a 24-hour generation and load trajectory across solar, wind, battery and diesel',
      width: 1440,
      height: 900,
    },
  },
  {
    slug: 'monsoon-drought',
    title: 'Monsoon & Drought Analytics',
    tagline: 'Drought-risk classification from more than a century of Indian rainfall data',
    domain: 'Python · Scikit-learn · Climate Analytics',
    problem:
      'Drought hits agriculture and water planning hard, and early warning depends on reading long-term rainfall patterns region by region.',
    work: [
      'Built an ML pipeline for drought-risk assessment on the Rainfall in India 1901–2015 dataset (4,116 records).',
      'Analysed rainfall trends and regional drought patterns through exploratory analysis and visualisation.',
      'Deployed a Streamlit dashboard for drought monitoring, climate visualisation and state-wise insights.',
    ],
    result: { value: '96.45%', label: 'classification accuracy, Random Forest' },
    stack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Streamlit'],
    links: {
      github: 'https://github.com/ayushmauryaiitj/Monsoon-Drought-Analytics',
      demo: 'https://monsoon-drought-analytics.streamlit.app/',
    },
    image: {
      src: '/projects/monsoon-rainfall-trend.webp',
      alt: 'Line chart of long-term annual rainfall across India from the Monsoon & Drought Analytics project',
      width: 1200,
      height: 600,
    },
  },
  {
    slug: 'aastha-medico',
    title: 'Aastha Medico',
    tagline: 'A full-stack study-resource platform for NEET aspirants',
    domain: 'React · TypeScript · Supabase · Full-Stack',
    problem:
      'NEET aspirants need organised, subject-wise study material, and the creator selling it needs a simple way to price content and verify payments.',
    work: [
      'Created the platform with subject-wise resources, free and paid content, user profiles and purchase management.',
      'Implemented a UPI purchase workflow with transaction references, payment-screenshot uploads and admin approval or rejection.',
      'Built the admin dashboard for uploads, pricing, purchase requests and transactions, plus analytics on purchases and resource performance.',
    ],
    stack: ['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    links: { demo: 'https://aastha-medico.lovable.app/' },
    image: {
      src: '/projects/aastha-medico.webp',
      alt: 'Aastha Medico landing page with the headline "Stay Consistent. Crack NEET with Smart Study."',
      width: 1440,
      height: 900,
    },
  },
];

export interface MinorProject {
  title: string;
  summary: string;
  result?: string;
  stack: string[];
  links: { github: string; demo?: string };
  image?: ProjectImage;
}

// From public repositories (not listed on the resume).
export const moreProjects: MinorProject[] = [
  {
    title: 'Climate Rainfall Forecasting with LSTM',
    summary:
      'Stacked two-layer LSTM in PyTorch that forecasts monthly precipitation from temperature, humidity, wind speed and past rainfall using 12-month sliding windows.',
    result: 'R² 0.64 · RMSE 0.116 (scaled)',
    stack: ['PyTorch', 'Pandas', 'Scikit-learn', 'Streamlit'],
    links: {
      github: 'https://github.com/ayushmauryaiitj/Climate-Rainfall-Forecasting-using-LSTM',
      demo: 'https://climate-rainfall-forecasting-using-lstm.streamlit.app/',
    },
    image: {
      src: '/projects/lstm-prediction.webp',
      alt: 'Actual versus predicted rainfall from the LSTM model',
      width: 1000,
      height: 500,
    },
  },
  {
    title: 'Crop Yield Prediction',
    summary:
      'Random Forest regression on Indian crop data (19,689 records, 30 states, 55 crops) using crop, season, area, rainfall, fertiliser and pesticide inputs, served as a Streamlit app.',
    result: 'R² 0.98 on the test set',
    stack: ['Scikit-learn', 'Pandas', 'Seaborn', 'Streamlit'],
    links: {
      github: 'https://github.com/ayushmauryaiitj/Crop-Yield-Prediction',
      demo: 'https://crop-yield-prediction-in.streamlit.app/',
    },
    image: {
      src: '/projects/crop-yield-app.webp',
      alt: 'Crop Yield Prediction Streamlit app showing dataset statistics',
      width: 1440,
      height: 900,
    },
  },
];
