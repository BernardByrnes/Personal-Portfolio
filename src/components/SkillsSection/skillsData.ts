import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer, SiThreedotjs,
  SiNodedotjs, SiExpress, SiPostgresql, SiRedis, SiGraphql,
  SiGit, SiFigma, SiVscodium, SiVercel, SiDocker, SiGithubactions,
  SiGreensock, SiPython, SiRubyonrails, SiApachekafka, SiApachespark,
  SiClickhouse, SiJupyter,
} from "react-icons/si";
import { TbApi, TbDatabase } from "react-icons/tb";
import type { ComponentType } from "react";

export type Skill = {
  name:     string;
  icon:     ComponentType<{ size?: number; color?: string }>;
  color:    string;
  category: "frontend" | "backend" | "data" | "tools";
};

export const allSkills: Skill[] = [
  // Frontend
  { name: "React",           icon: SiReact,        color: "#61DAFB", category: "frontend" },
  { name: "Next.js",         icon: SiNextdotjs,    color: "#ffffff", category: "frontend" },
  { name: "TypeScript",      icon: SiTypescript,   color: "#3178C6", category: "frontend" },
  { name: "GSAP",            icon: SiGreensock,    color: "#88CE02", category: "frontend" },
  { name: "Tailwind CSS",    icon: SiTailwindcss,  color: "#06B6D4", category: "frontend" },
  { name: "Framer Motion",   icon: SiFramer,       color: "#6366f1", category: "frontend" },
  { name: "Three.js",        icon: SiThreedotjs,   color: "#ffffff", category: "frontend" },
  // Backend
  { name: "Node.js",         icon: SiNodedotjs,    color: "#339933", category: "backend"  },
  { name: "Express",         icon: SiExpress,      color: "#ffffff", category: "backend"  },
  { name: "PostgreSQL",      icon: SiPostgresql,   color: "#4169E1", category: "backend"  },
  { name: "Redis",           icon: SiRedis,        color: "#DC382D", category: "backend"  },
  { name: "REST APIs",       icon: TbApi,          color: "#a78bfa", category: "backend"  },
  { name: "GraphQL",         icon: SiGraphql,      color: "#E10098", category: "backend"  },
  { name: "Rails",           icon: SiRubyonrails,  color: "#CC0000", category: "backend"  },
  // Data
  { name: "Python",          icon: SiPython,       color: "#3776AB", category: "data"     },
  { name: "SQL",             icon: TbDatabase,     color: "#a78bfa", category: "data"     },
  { name: "Apache Spark",    icon: SiApachespark,  color: "#E25A1C", category: "data"     },
  { name: "Apache Kafka",    icon: SiApachekafka,  color: "#ffffff", category: "data"     },
  { name: "ClickHouse",      icon: SiClickhouse,   color: "#FAFF69", category: "data"     },
  { name: "Jupyter",         icon: SiJupyter,      color: "#F37626", category: "data"     },
  // Tools
  { name: "Git",             icon: SiGit,          color: "#F05032", category: "tools"    },
  { name: "Figma",           icon: SiFigma,        color: "#F24E1E", category: "tools"    },
  { name: "VS Code",         icon: SiVscodium,     color: "#007ACC", category: "tools"    },
  { name: "Vercel",          icon: SiVercel,       color: "#ffffff", category: "tools"    },
  { name: "Docker",          icon: SiDocker,       color: "#2496ED", category: "tools"    },
  { name: "GitHub Actions",  icon: SiGithubactions,color: "#2088FF", category: "tools"    },
];

export const categoryMeta = {
  frontend: { label: "Frontend", accent: "#667eea" },
  backend:  { label: "Backend",  accent: "#4ade80" },
  data:     { label: "Data",     accent: "#f472b6" },
  tools:    { label: "Tools",    accent: "#f59e0b" },
} as const;
