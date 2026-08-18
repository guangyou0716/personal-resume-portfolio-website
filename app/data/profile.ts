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
  overview: string;
  problem: string;
  approach: string;
  built: string[];
  architecture: string[];
  challenges: string;
  solution: string;
  result: string;
};

export const profile = {
  name: "[Your Name]",
  initials: "YN",
  avatar: "",
  title: "Software Developer",
  subtitle: "Building practical systems, automation and AI-powered tools.",
  location: "[City, Country]",
  availability: "Open to opportunities",
  focus: "Software · Automation · AI",
  email: "you@example.com",
  resumeFile: "/resume",
  bio: "I enjoy turning real-world problems into reliable software — from business systems and APIs to automation, AI tools and developer workflows.",
  summary: "Replace this short summary with 2–3 sentences about your background, the kind of work you do best, and the problems you want to solve next.",
  values: ["Practical solutions", "Maintainable code", "Automation", "Clear documentation", "Reliable systems"],
  socials: {
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
    email: "mailto:you@example.com",
  } satisfies SocialLinks,
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
};

export const experience: ExperienceItem[] = [
  {
    company: "[Company]", role: "[Job Title]", location: "[Location]", type: "[Employment Type]", startDate: "[Start Date]", endDate: "[End Date]",
    bullets: ["[Add what you built or maintained]", "[Add a workflow, integration or system you improved]", "[Add the users, teams or process your work supported]"],
    impact: "[Optional impact statement — do not invent a number if you do not have one]",
  },
  {
    company: "[Previous Company]", role: "[Previous Role]", location: "[Location]", type: "[Employment Type]", startDate: "[Start Date]", endDate: "[End Date]",
    bullets: ["[Add a concise contribution]", "[Add a technical or process improvement]"],
  },
];

export const projects: ProjectItem[] = [
  {
    slug: "project-one", title: "[Project Name]", description: "[Add a one-line description of the problem this project solves.]", type: "[Project Type]", status: "[Status]", technologies: ["Technology", "Framework", "Database"], github: "https://github.com/your-username/project-one", demo: "https://example.com", featured: true,
    overview: "[Explain what this project is and who it is for.]", problem: "[Describe the real-world problem or workflow that motivated it.]", approach: "[Summarise the approach you took and why.]", built: ["[Feature or capability]", "[Feature or capability]", "[Feature or capability]"], architecture: ["Frontend", "Backend / API", "Database", "Deployment"], challenges: "[Describe the hardest part of the project.]", solution: "[Describe how you solved that challenge.]", result: "[Describe the result without inventing metrics.]",
  },
  {
    slug: "project-two", title: "[Another Project]", description: "[Add a short description that makes the project easy to scan.]", type: "[Project Type]", status: "[Status]", technologies: ["Language", "API", "Automation"], github: "https://github.com/your-username/project-two", featured: true,
    overview: "[Explain the project in one short paragraph.]", problem: "[What was difficult, slow or repetitive before this existed?]", approach: "[What did you decide to build?]", built: ["[Feature or capability]", "[Feature or capability]"], architecture: ["Application", "Integration", "Automation"], challenges: "[Challenge placeholder]", solution: "[Solution placeholder]", result: "[Result placeholder]",
  },
  {
    slug: "project-three", title: "[Third Project]", description: "[Add a one-line description of this project.]", type: "[Project Type]", status: "[Status]", technologies: ["Python", "OpenCV", "AI API"], featured: true,
    overview: "[Overview placeholder]", problem: "[Problem placeholder]", approach: "[Approach placeholder]", built: ["[Feature or capability]", "[Feature or capability]"], architecture: ["Client", "AI / Computer Vision", "Deployment"], challenges: "[Challenge placeholder]", solution: "[Solution placeholder]", result: "[Result placeholder]",
  },
];

export const skillGroups = [
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

export const education = [{ qualification: "[Degree / Qualification]", school: "[University / College]", field: "[Field of Study]", year: "[Year]", coursework: "[Optional relevant coursework]" }];
export const certifications: Array<{ name: string; issuer: string; date: string; link?: string }> = [];
export const githubWork = [
  { name: "[Repository Name]", description: "[What this repository demonstrates]", stack: "[Language / Stack]", stars: "—" },
  { name: "[Repository Name]", description: "[What this repository demonstrates]", stack: "[Language / Stack]", stars: "—" },
  { name: "[Repository Name]", description: "[What this repository demonstrates]", stack: "[Language / Stack]", stars: "—" },
];
export const isPlaceholderContent = true;
