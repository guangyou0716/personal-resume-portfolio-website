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

export function displayProjectName(name: string) {
  return name.includes("-") || name.includes("_")
    ? name.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    : name;
}

export const profile = {
  name: "Lee Guang You",
  initials: "GY",
  avatar: "/profile/avatar-linkedin.png",
  title: "Software Engineer",
  subtitle: "Connecting software, hardware and business operations.",
  location: "Simpang Ampat, Penang, Malaysia",
  availability: "Open to opportunities",
  focus: "System Integration · Automation · Smart Metering",
  email: "guangyou7953@outlook.com",
  resumeFile: "/resume",
  bio: "I build web and desktop applications, connect software with hardware, and automate business workflows — from smart metering and industrial systems to payments and e-Invoicing.",
  summary: "I’m a technology enthusiast with a passion for software development, system integration, and automation.\n\nMy experience spans smart metering solutions, industrial production machines, and web application development. I’ve worked on integrating PayNet DuitNow payment services and LHDN MyInvois e-Invoicing systems, bridging software with real-world business operations.\n\nOne of my memorable experiences was contributing to Singapore’s National Day Parade (NDP), supporting power monitoring through smart metering technology.\n\nI enjoy solving technical challenges, exploring new technologies, and finding smarter ways to connect software, hardware, and automation.\n\nI’m always looking to learn, improve, and take on new challenges that create meaningful impact.",
  values: [] as string[],
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
  {
    company: "Bioenergy Projects Sdn Bhd",
    role: "Software Engineer",
    location: "Perai, Penang, Malaysia",
    type: "Full-time · On-site",
    startDate: "Mar 2024",
    endDate: "Present",
    bullets: [
      "Developed and maintained PHP-based web applications to support business operations.",
      "Contributed to PayNet DuitNow payment and LHDN MyInvois e-Invoicing API integrations.",
      "Supported smart meter power monitoring and data collection, including operations for Singapore’s National Day Parade (NDP).",
      "Supported industrial production machines through software and hardware integration and automation.",
    ],
  },
  {
    company: "Kaifa Technology Malaysia",
    role: "MES Assistant Engineer",
    location: "Bukit Mertajam, Penang, Malaysia",
    type: "Full-time · On-site",
    startDate: "Dec 2023",
    endDate: "Jan 2024",
    bullets: [
      "Assisted with troubleshooting production machines in collaboration with software engineers in China.",
    ],
  },
  {
    company: "Lingkail Sdn Bhd",
    role: "Full Stack Engineer",
    location: "Bukit Mertajam, Penang, Malaysia",
    type: "Full-time · On-site",
    startDate: "Sep 2022",
    endDate: "Dec 2023",
    bullets: [
      "Developed websites and web pages using .NET.",
    ],
  },
  {
    company: "Boon Siew Honda Sdn. Bhd.",
    role: "Information Technology Trainee",
    location: "Simpang Ampat, Penang, Malaysia",
    type: "Internship · On-site",
    startDate: "Dec 2019",
    endDate: "Feb 2020",
    bullets: [],
  },
];

export const projects: ProjectItem[] = [
  {
    slug: "codex-board", title: "codex-board", description: "React and TypeScript dashboard with a task board, repository management, Codex thread controls and usage monitoring.", type: "Developer tooling", status: "Public repository", technologies: ["React", "TypeScript"], github: "https://github.com/guangyou0716/codex-board", featured: true,
    overview: "React and TypeScript dashboard with a task board, repository management, Codex thread controls and usage monitoring.", built: ["Coding tasks", "Repository context", "Codex threads"], architecture: ["TypeScript", "Developer workflow", "Codex"],
  },
  {
    slug: "personal-resume-portfolio-website", title: "personal-resume-portfolio-website", description: "React portfolio and printable resume with an authenticated profile editor and persistent profile data in Cloudflare D1.", type: "Web portfolio", status: "Live site", technologies: ["TypeScript", "React", "Cloudflare"], github: "https://github.com/guangyou0716/personal-resume-portfolio-website", featured: true,
    overview: "React portfolio and printable resume with an authenticated profile editor and persistent profile data in Cloudflare D1.", built: ["Portfolio homepage", "Quick resume", "Editable profile content"], architecture: ["React", "Vite / vinext", "Cloudflare"],
  },
  {
    slug: "codex-workflow-toolkit", title: "codex-workflow-toolkit", description: "Repository workflow skills for delegation, chat handoffs and maintaining repository maps, distributed as a Codex plugin.", type: "Codex plugin", status: "Public repository", technologies: ["GitHub", "Codex"], github: "https://github.com/guangyou0716/codex-workflow-toolkit", featured: true,
    overview: "Repository workflow skills for delegation, chat handoffs and maintaining repository maps, distributed as a Codex plugin.", built: ["Repository workflow skills", "Handoff support", "Upstream skill setup"], architecture: ["Codex plugin", "Markdown skills", "GitHub"],
  },
  {
    slug: "twofold", title: "TwoFold", description: "A real-time couple companion app for reminders, shared budgeting, memories, and connection.", type: "Mobile app", status: "Public repository", technologies: ["React Native", "Expo", "Firebase", "TypeScript"], github: "https://github.com/guangyou0716/TwoFold", featured: false,
    overview: "A real-time couple companion app for reminders, shared budgeting, memories, and connection.", built: ["Shared reminders and chores", "Shared budget and savings goals", "Memory capsule and milestones", "Live partner nudges"], architecture: ["React Native / Expo", "Firebase", "TypeScript"],
  },
];

export const skillGroups: SkillGroup[] = [
  { label: "Languages & web", items: ["PHP", "C#", "Python", "HTML", "CSS"] },
  { label: "Frameworks & UI", items: [".NET Framework", ".NET Avalonia UI", "ASP.NET", "Bootstrap", "Flutter", "MudBlazor", ".NET MAUI", ".NET Blazor", "MVVM"] },
  { label: "Databases", items: ["PostgreSQL", "MySQL", "SQLite", "InfluxDB", "Microsoft SQL Server"] },
  { label: "Systems & protocols", items: ["Smart Metering", "DLMS", "MQTT", "M-Bus", "Modbus", "TCP", "IEC", "Computer Networking"] },
  { label: "Business integration", items: ["PayNet DuitNow", "LHDN MyInvois / MyTax", "Full-Stack Development"] },
  { label: "AI & automation", items: ["AI Agents", "Agentic Workflows"] },
  { label: "Tools & deployment", items: ["Grafana", "Docker", "WiX Toolset", "SQL Server Management Studio", "Visual Studio"] },
];

export const workStyle = [
  ["Understand the problem", "I prefer understanding the real workflow before writing code."],
  ["Build practical solutions", "I focus on solutions that can actually be maintained and used."],
  ["Automate repetitive work", "If something repeats often, I look for a reliable way to automate it."],
  ["Document important decisions", "I keep project knowledge understandable for future maintenance."],
  ["Use AI as an engineering tool", "I use AI to move faster while keeping implementation decisions reviewable."],
] as const;

export const education: EducationItem[] = [
  { qualification: "Bachelor’s degree (CGPA 3.72)", school: "Wawasan Open University (WOU)", field: "Computer Software Engineering", year: "Sep 2021 – Mar 2026", coursework: "" },
  { qualification: "Diploma of Education (CGPA 3.60)", school: "Synergy College", field: "Network and System Administration/Administrator", year: "Jan 2018 – Mar 2021", coursework: "" },
  { qualification: "SPM (1A, 7B, 1C, 1D)", school: "SMK Taman Perwira", field: "", year: "2013 – 2017", coursework: "" },
];
export const certifications: Array<{ name: string; issuer: string; date: string; link?: string }> = [];
export const githubWork = projects.filter((project) => project.featured && project.github).map((project) => ({
  name: project.title,
  description: project.description,
  github: project.github!,
  stack: project.technologies[0],
  stars: "",
}));
export const isPlaceholderContent = false;
