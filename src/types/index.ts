export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  challenge: string;
  solution: string;
  impact: string;
  techStack: string[];
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}