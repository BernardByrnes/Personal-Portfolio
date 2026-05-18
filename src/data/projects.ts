import { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "tasc-lms",
    title: "TASC LMS",
    tagline: "Enterprise learning management at institutional scale",
    description:
      "A full-stack Learning Management System serving as a centralised hub for course delivery, student progress tracking, and institutional analytics. Built for real organisations with role-based access for admins, instructors, and learners.",
    challenge:
      "Educational institutions needed a single platform that could handle content delivery, live assessments, and granular analytics without the cost of commercial LMS vendors.",
    solution:
      "Architected a Django REST backend with a React/TypeScript frontend, PostgreSQL for relational data, and TanStack Query for snappy, cache-aware UI updates. Role-scoped analytics endpoints keep data access policy-compliant.",
    impact:
      "Deployed to a live organisation at tasclms.com. Handles multi-role authentication, quiz engines, submission workflows, and manager-level reporting dashboards.",
    techStack: ["React", "TypeScript", "Django", "PostgreSQL", "TanStack Query", "REST APIs"],
    images: ["/projects/TASC_lms.png"],
    liveUrl: "https://lms.staging.tasc.co.ug/",
    featured: true,
  },
  {
    id: "gta-vi-fansite",
    title: "GTA VI Fansite",
    tagline: "A cinematic web experience built for a cultural moment",
    description:
      "A high-fidelity fan landing page for GTA VI, engineered to feel like an official Rockstar property. Focuses on scroll-driven storytelling, viewport-filling visuals, and buttery-smooth GSAP choreography.",
    challenge:
      "Recreating the cinematic weight and production polish of Rockstar's marketing using only open-web technologies and no backend.",
    solution:
      "Leveraged React with GSAP ScrollTrigger for timeline-driven animations, carefully layered CSS compositing for depth effects, and TypeScript for a maintainable component architecture.",
    impact:
      "Demonstrates mastery of complex animation choreography and large-scale visual composition, featuring skills that transfer directly to high-end marketing and product landing pages.",
    techStack: ["React", "TypeScript", "GSAP", "ScrollTrigger", "CSS3"],
    images: ["/projects/GTA_VI.png"],
    liveUrl: "https://gtavimay.netlify.app/",
    featured: true,
  },
  {
    id: "news-blogs-dashboard",
    title: "News & Blogs Dashboard",
    tagline: "Real-time news meets personal storytelling in one hub",
    description:
      "A comprehensive information platform that merges live global news with a personal blogging system. Users can browse headlines by category, bookmark articles, and manage their own content — all in a single dashboard.",
    challenge:
      "Building a 'serverless' feel with full CRUD capabilities and live API data, without a dedicated backend, while keeping the UI snappy and the data persistent across sessions.",
    solution:
      "Integrated the GNews API and OpenWeatherMap API via Axios, built a complete blog CMS with localStorage persistence, and added productivity widgets (weather tracker, calendar), all in a clean Vite + React architecture.",
    impact:
      "Showcases API integration, React state management with hooks, CRUD mastery, and client-side persistence (core skills expected in any professional frontend role).",
    techStack: ["React", "Vite", "Axios", "GNews API", "LocalStorage", "CSS3"],
    images: ["/projects/News_&_Blogs_Dashboard.png"],
    liveUrl: "https://newsblog2.netlify.app/",
    featured: false,
  },
  {
    id: "weather-dashboard",
    title: "Weather Dashboard",
    tagline: "Glassmorphism UI meets live atmospheric data",
    description:
      "A modern, responsive weather dashboard that delivers instant atmospheric data with a premium glassmorphism aesthetic. Dynamic theming automatically shifts background and iconography to match real-world conditions.",
    challenge:
      "Creating a UI that felt premium and alive (not just a data dump) while handling async API states, error conditions, and dynamic visual theming cleanly.",
    solution:
      "Built dynamic weather-code-to-asset mapping for automatic visual theming, used React useEffect for async data fetching with proper error/loading states, and designed a glassmorphism layout with smooth CSS transitions.",
    impact:
      "Demonstrates polished UI/UX thinking, dynamic rendering logic, and performance-optimised builds via Vite, all visible at a glance to a hiring manager.",
    techStack: ["React", "Vite", "OpenWeatherMap API", "CSS3", "FontAwesome"],
    images: ["/projects/weather app.png"],
    liveUrl: "https://weatherultimate.netlify.app/",
    featured: false,
  },
  {
    id: "bobi-vs-muhoozi",
    title: "Bobi vs Muhoozi",
    tagline: "Political data made visceral through interactive charts",
    description:
      "An interactive data visualisation comparing two prominent Ugandan political figures across key metrics. Designed to make complex political data immediately legible and engaging through animation and layered charting.",
    challenge:
      "Political datasets are dry. The challenge was making the comparison feel immediate, emotionally legible, and shareable without misleading the reader.",
    solution:
      "Combined React Charts and D3 for rich, custom visualisations, used GSAP for entrance animations that guide the reader's eye, and TypeScript to keep the data pipeline clean and type-safe.",
    impact:
      "Proves ability to work with data-heavy UIs, custom charting beyond off-the-shelf defaults, and GSAP animation in a non-entertainment context.",
    techStack: ["React", "TypeScript", "D3.js", "React Charts", "GSAP"],
    images: ["/projects/muhooziBobi.png"],
    liveUrl: "https://muhoozibobi3xx.netlify.app/",
    featured: false,
  },
];

export const skills = {
  Frontend: [
    "React",
    "Next.js",
    "TypeScript",
    "GSAP",
    "Tailwind CSS",
    "Framer Motion",
    "Three.js",
  ],
  Backend: ["Node.js", "Express", "PostgreSQL", "Redis", "REST APIs", "GraphQL"],
  Tools: ["Git", "Figma", "VS Code", "Vercel", "Docker", "GitHub Actions"],
};