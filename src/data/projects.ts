import { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "analytics-dashboard",
    title: "Real-Time Analytics Dashboard",
    tagline: "Transforming data chaos into actionable insights",
    description:
      "Built a real-time analytics platform that processes 10M+ events daily, reducing reporting time from hours to seconds.",
    challenge:
      "The existing system relied on batch processing with 24-hour delays, making real-time decision-making impossible for the ops team.",
    solution:
      "Architected a WebSocket-based streaming pipeline with Redis caching and React Query for optimistic updates, achieving sub-second data freshness.",
    impact:
      "Reduced reporting latency by 99.8%, increased team productivity by 40%, and enabled data-driven decisions that improved operational efficiency by 25%.",
    techStack: ["React", "TypeScript", "WebSocket", "Redis", "D3.js", "TailwindCSS"],
    images: ["/projects/analytics-1.jpg", "/projects/analytics-2.jpg"],
    liveUrl: "https://demo.example.com",
    githubUrl: "https://github.com/mutambo/project",
    featured: true,
  },
  {
    id: "ecommerce-platform",
    title: "Next-Gen E-Commerce Platform",
    tagline: "Reimagining online shopping experiences",
    description:
      "Developed a headless e-commerce solution with server-side rendering and edge caching, delivering sub-100ms page loads globally.",
    challenge:
      "Legacy monolithic architecture caused 8+ second load times during peak traffic, resulting in 60% cart abandonment.",
    solution:
      "Migrated to a composable architecture using Next.js 14, Vercel Edge Network, and Stripe integration with optimistic UI updates.",
    impact:
      "Achieved 99.99% uptime during Black Friday, increased conversion rate by 35%, and reduced bounce rate by 50%.",
    techStack: ["Next.js", "TypeScript", "Stripe", "Vercel", "TailwindCSS", "Zustand"],
    images: ["/projects/ecommerce-1.jpg"],
    liveUrl: "https://shop.example.com",
    featured: true,
  },
  {
    id: "ai-chat-interface",
    title: "AI-Powered Chat Interface",
    tagline: "Where artificial intelligence meets intuitive design",
    description:
      "Created a next-generation AI chat application with real-time streaming responses, code syntax highlighting, and markdown support.",
    challenge:
      "Existing chat interfaces felt static and unresponsive, with users waiting 10+ seconds for AI responses.",
    solution:
      "Implemented WebSocket streaming with Server-Sent Events fallback, custom markdown renderer, and smooth message animations.",
    impact:
      "User engagement increased by 200%, average session duration grew to 15 minutes, and NPS score improved from 45 to 72.",
    techStack: ["React", "OpenAI API", "Markdown", "GSAP", "TailwindCSS", "Radix UI"],
    images: ["/projects/chat-1.jpg", "/projects/chat-2.jpg"],
    liveUrl: "https://chat.example.com",
    githubUrl: "https://github.com/mutambo/ai-chat",
    featured: true,
  },
  {
    id: "collaborative-editor",
    title: "Real-Time Collaborative Editor",
    tagline: "Multiple minds, one seamless experience",
    description:
      "Built a Google Docs-style collaborative editor with CRDT-based conflict resolution and presence indicators.",
    challenge:
      "Teams struggled with version conflicts and lost work when multiple people edited documents simultaneously.",
    solution:
      "Implemented Yjs for CRDT conflict resolution, WebSocket for real-time sync, and operational transforms for seamless collaboration.",
    impact:
      "Enabled 50+ simultaneous collaborators per document, eliminated data loss incidents, and improved team productivity by 30%.",
    techStack: ["React", "TypeScript", "Yjs", "WebSocket", "Monaco Editor", "TailwindCSS"],
    images: ["/projects/editor-1.jpg"],
    featured: false,
  },
  {
    id: "fitness-tracker",
    title: "Mobile-First Fitness Tracker",
    tagline: "Your personal fitness journey, visualized",
    description:
      "Developed a progressive web app for tracking workouts, nutrition, and progress with beautiful data visualizations.",
    challenge:
      "Users needed a simple way to track complex fitness data across devices without the complexity of traditional apps.",
    solution:
      "Created an offline-first PWA with IndexedDB storage, beautiful Chart.js visualizations, and device sync capabilities.",
    impact:
      "Achieved 10,000+ active users within 3 months, 4.8-star app store rating, and 85% daily active user retention.",
    techStack: ["React", "PWA", "IndexedDB", "Chart.js", "TypeScript", "TailwindCSS"],
    images: ["/projects/fitness-1.jpg", "/projects/fitness-2.jpg"],
    liveUrl: "https://fitness.example.com",
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