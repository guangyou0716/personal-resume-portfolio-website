export type SocialLinks = {
  github: string;
  linkedin: string;
  email: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  type: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  impact?: string;
};

export type SkillGroup = { label: string; items: string[] };
export type EducationItem = { qualification: string; school: string; field: string; year: string; coursework: string };

export type ProjectItem = {
  slug: string;
  title: string;
  description: string;
  type: string;
  status: string;
  technologies: string[];
  coverImage?: string;
  screenshots?: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  overview?: string;
  built?: string[];
  architecture?: string[];
};

export const profile = {
  name: "Lee Guang You",
  initials: "GY",
  avatar: "/profile/avatar.jpg",
  title: "Software Engineer",
  subtitle: "Building practical systems, automation and AI-powered tools.",
  location: "Penang, Malaysia",
  availability: "Open to opportunities",
  focus: "Software · Automation · AI",
  email: "guangyou7953@outlook.com",
  resumeFile: "/resume",
  bio: "I enjoy turning real-world problems into reliable software — from business systems and APIs to automation, AI tools and developer workflows.",
  summary: "",
  values: ["Practical solutions", "Maintainable code", "Automation", "Clear documentation", "Reliable systems"],
  socials: {
    github: "https://github.com/guangyou0716",
    linkedin: "https://www.linkedin.com/in/lee-guang-you-729a12aa",
    email: "mailto:guangyou7953@outlook.com",
  } satisfies SocialLinks,
  githubCovers: {} as Record<string, string>,
};

export type EditableProfile = {
  name: string;
  initials: string;
  avatar: string;
  title: string;
  subtitle: string;
  location: string;
  availability: string;
  focus: string;
  email: string;
  bio: string;
  summary: string;
  values: string[];
  socials: SocialLinks;
  experience: ExperienceItem[];
  skillGroups: SkillGroup[];
  education: EducationItem[];
  githubCovers: Record<string, string>;
};

export const experience: ExperienceItem[] = [
];

export const projects: ProjectItem[] = [
  {
    slug: "codex-board", title: "codex-board", description: "A private command center for coding tasks, repositories, and Codex threads.", type: "Developer tooling", status: "Public repository", technologies: ["TypeScript"], github: "https://github.com/guangyou0716/codex-board", featured: true,
    overview: "A private command center for coding tasks, repositories, and Codex threads.", built: ["Coding tasks", "Repository context", "Codex threads"], architecture: ["TypeScript", "Developer workflow", "Codex"],
  },
  {
    slug: "personal-resume-portfolio-website", title: "personal-resume-portfolio-website", description: "Personal resume and portfolio website.", type: "Web portfolio", status: "Live site", technologies: ["TypeScript", "React", "Cloudflare"], github: "https://github.com/guangyou0716/personal-resume-portfolio-website", demo: "https://personal-resume-portfolio.guangyou1386.chatgpt.site/", featured: true,
    overview: "Personal resume and portfolio website.", built: ["Portfolio homepage", "Quick resume", "Editable profile content"], architecture: ["React", "Vite / vinext", "Cloudflare"],
  },
  {
    slug: "codex-workflow-toolkit", title: "codex-workflow-toolkit", description: "A public Codex plugin for repository workflows, handoffs, and upstream skill setup.", type: "Codex plugin", status: "Public repository", technologies: ["GitHub", "Codex"], github: "https://github.com/guangyou0716/codex-workflow-toolkit", featured: true,
    overview: "A public Codex plugin for repository workflows, handoffs, and upstream skill setup.", built: ["Repository workflow skills", "Handoff support", "Upstream skill setup"], architecture: ["Codex plugin", "Markdown skills", "GitHub"],
  },
  {
    slug: "twofold", title: "TwoFold", description: "A real-time couple companion app for reminders, shared budgeting, memories, and connection.", type: "Mobile app", status: "Public repository", technologies: ["React Native", "Expo", "Firebase", "TypeScript"], github: "https://github.com/guangyou0716/TwoFold", featured: false,
    overview: "A real-time couple companion app for reminders, shared budgeting, memories, and connection.", built: ["Shared reminders and chores", "Shared budget and savings goals", "Memory capsule and milestones", "Live partner nudges"], architecture: ["React Native / Expo", "Firebase", "TypeScript"],
  },
];

export const skillGroups: SkillGroup[] = [
  { label: "Languages", items: ["Python", "C#", "JavaScript", "TypeScript", "SQL"] },
  { label: "Frameworks", items: [".NET", "Avalonia", "React", "Next.js"] },
  { label: "Backend & APIs", items: ["REST API", "JSON", "Authentication", "API Integration"] },
  { label: "Databases", items: ["PostgreSQL", "MySQL", "SQLite"] },
  { label: "Automation", items: ["Python Automation", "RPA", "Workflow Automation"] },
  { label: "AI / Computer Vision", items: ["OpenCV", "AI APIs", "LLM workflows"] },
  { label: "Tools", items: ["Git", "GitHub", "Docker", "VS Code", "Codex"] },
];

export const workStyle = [
  ["Understand the problem", "I prefer understanding the real workflow before writing code."],
  ["Build practical solutions", "I focus on solutions that can actually be maintained and used."],
  ["Automate repetitive work", "If something repeats often, I look for a reliable way to automate it."],
  ["Document important decisions", "I keep project knowledge understandable for future maintenance."],
  ["Use AI as an engineering tool", "I use AI to move faster while keeping implementation decisions reviewable."],
] as const;

export const education: EducationItem[] = [];
export const certifications: Array<{ name: string; issuer: string; date: string; link?: string }> = [];
export const githubWork = [
  { name: "codex-board", description: "A private command center for coding tasks, repositories, and Codex threads.", stack: "TypeScript", stars: "" },
  { name: "personal-resume-portfolio-website", description: "Personal resume and portfolio website.", stack: "TypeScript", stars: "" },
  { name: "codex-workflow-toolkit", description: "A public Codex plugin for repository workflows, handoffs, and upstream skill setup.", stack: "GitHub", stars: "" },
];
export const isPlaceholderContent = false;
