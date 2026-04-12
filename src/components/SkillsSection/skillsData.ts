import {
  SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiFramer, SiThreedotjs,
  SiNodedotjs, SiExpress, SiPostgresql, SiRedis, SiGraphql,
  SiGit, SiFigma, SiVscodium, SiVercel, SiDocker, SiGithubactions,
  SiGreensock,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";
import type { ElementType } from "react";

export type Skill = {
  name:     string;
  icon:     ElementType;
  color:    string;
  category: "frontend" | "backend" | "tools";
};

export const allSkills: Skill[] = [
  // Frontend
  { name: "React",         icon: SiReact,        color: "#61DAFB", category: "frontend" },
  { name: "Next.js",       icon: SiNextdotjs,    color: "#ffffff", category: "frontend" },
  { name: "TypeScript",    icon: SiTypescript,   color: "#3178C6", category: "frontend" },
  { name: "GSAP",          icon: SiGreensock,    color: "#88CE02", category: "frontend" },
  { name: "Tailwind CSS",  icon: SiTailwindcss,  color: "#06B6D4", category: "frontend" },
  { name: "Framer Motion", icon: SiFramer,       color: "#6366f1", category: "frontend" },
  { name: "Three.js",      icon: SiThreedotjs,   color: "#ffffff", category: "frontend" },
  // Backend
  { name: "Node.js",       icon: SiNodedotjs,    color: "#339933", category: "backend"  },
  { name: "Express",       icon: SiExpress,      color: "#ffffff", category: "backend"  },
  { name: "PostgreSQL",    icon: SiPostgresql,   color: "#4169E1", category: "backend"  },
  { name: "Redis",         icon: SiRedis,        color: "#DC382D", category: "backend"  },
  { name: "REST APIs",     icon: TbApi,          color: "#a78bfa", category: "backend"  },
  { name: "GraphQL",       icon: SiGraphql,      color: "#E10098", category: "backend"  },
  // Tools
  { name: "Git",           icon: SiGit,          color: "#F05032", category: "tools"    },
  { name: "Figma",         icon: SiFigma,        color: "#F24E1E", category: "tools"    },
  { name: "VS Code",       icon: SiVscodium,     color: "#007ACC", category: "tools"    },
  { name: "Vercel",        icon: SiVercel,       color: "#ffffff", category: "tools"    },
  { name: "Docker",        icon: SiDocker,       color: "#2496ED", category: "tools"    },
  { name: "GitHub Actions",icon: SiGithubactions,color: "#2088FF", category: "tools"    },
];

export const categoryMeta = {
  frontend: { label: "Frontend", accent: "#667eea" },
  backend:  { label: "Backend",  accent: "#4ade80" },
  tools:    { label: "Tools",    accent: "#f59e0b" },
} as const;
