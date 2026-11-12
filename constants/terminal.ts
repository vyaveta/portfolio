export interface TerminalFile {
  id: string;
  title: string;
  type: "folder" | "file";
  content?: string;
  children?: TerminalFile[];
}

export const terminalFilesystem: TerminalFile[] = [
  {
    id: "about",
    title: "about",
    type: "folder",
    children: [
      {
        id: "about-me",
        title: "intro.txt",
        type: "file",
        content: `Hi, I'm Adwaith! 👋
A Full Stack Developer specializing in JavaScript, React, Next.js, and TypeScript.

Passionate about building sleek, interactive web applications with great UX and clean code.

Currently exploring: Rust, WebAssembly, and DevOps.`
      },
      {
        id: "about-skills",
        title: "skills.txt",
        type: "file",
        content: `Technical Skills:

Frontend: React.js, Next.js, TypeScript, Tailwind CSS, GSAP
Mobile: React Native, Expo
Backend: Node.js, Express, NestJS, Hono
Database: MongoDB, PostgreSQL
Dev Tools: Git, GitHub, Docker, Vercel`
      },
      {
        id: "about-contact",
        title: "contact.txt",
        type: "file",
        content: `Contact Information:

📧 Email: adwaith@example.com
🐙 GitHub: github.com/adwaith
💼 LinkedIn: linkedin.com/in/adwaith
🐦 Twitter: @adwaith_dev`
      }
    ]
  },
  {
    id: "projects",
    title: "projects",
    type: "folder",
    children: [
      {
        id: "project-nike",
        title: "nike-ecommerce",
        type: "folder",
        children: [
          {
            id: "nike-desc",
            title: "description.txt",
            type: "file",
            content: `Nike Ecommerce Website
A sleek and modern platform for shopping the latest Nike collections.
Built with Next.js, Tailwind CSS, and GSAP for smooth animations.

🔗 Demo: https://youtu.be/fZdTYswuZjU`
          },
          {
            id: "nike-tech",
            title: "tech-stack.txt",
            type: "file",
            content: `Tech Stack:
- Next.js 14
- Tailwind CSS
- GSAP
- TypeScript`
          }
        ]
      },
      {
        id: "project-ai",
        title: "ai-resume-analyzer",
        type: "folder",
        children: [
          {
            id: "ai-desc",
            title: "description.txt",
            type: "file",
            content: `AI Resume Analyzer
Smart tool that helps perfect your resume with instant AI-powered feedback.
Built with Next.js, TypeScript, and OpenAI API.

🔗 Demo: https://youtu.be/iYOz165wGkQ`
          },
          {
            id: "ai-tech",
            title: "tech-stack.txt",
            type: "file",
            content: `Tech Stack:
- Next.js 14
- TypeScript
- OpenAI API
- Tailwind CSS`
          }
        ]
      },
      {
        id: "project-food",
        title: "food-delivery-app",
        type: "folder",
        children: [
          {
            id: "food-desc",
            title: "description.txt",
            type: "file",
            content: `Food Delivery App
Fast and convenient way to order meals from favorite restaurants.
Real-time tracking, menu browsing, and seamless checkout.
Built with React Native and Expo.

🔗 Demo: https://youtu.be/LKrX390fJMw`
          },
          {
            id: "food-tech",
            title: "tech-stack.txt",
            type: "file",
            content: `Tech Stack:
- React Native
- Expo
- Node.js
- TypeScript`
          }
        ]
      }
    ]
  },
  {
    id: "resume",
    title: "resume.pdf",
    type: "file",
    content: `Adwaith - Full Stack Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPERIENCE
• Full Stack Developer - JavaScript Mastery (2023-Present)
  Building interactive web applications with Next.js, React, TypeScript

• Open Source Contributor (2022-Present)
  Contributing to various React and Node.js projects

SKILLS
Frontend: React, Next.js, TypeScript, Tailwind, GSAP
Mobile: React Native, Expo
Backend: Node.js, Express, NestJS, Hono
Database: MongoDB, PostgreSQL
Tools: Git, Docker, Vercel, CI/CD

EDUCATION
B.Tech Computer Science & Engineering`
  },
  {
    id: "readme",
    title: "README.md",
    type: "file",
    content: `# Adwaith's Portfolio Terminal 🖥️

Welcome to my interactive macOS-style portfolio!

## Available Commands
- \`help\` - Show this help message
- \`ls\` - List directory contents
- \`cd <dir>\` - Change directory
- \`cat <file>\` - Display file contents
- \`pwd\` - Print working directory
- \`clear\` - Clear terminal
- \`whoami\` - Display current user
- \`neofetch\` - System information
- \`rm -rf /\` - 🤐 (try at your own risk)

## Navigation
- Use \`cd\` to enter folders: \`cd about\`, \`cd projects\`
- Use \`cd ..\` to go up one level
- Use \`cd ~\` or \`cd\` to return home

## Easter Eggs
Try \`rm -rf /\` for a surprise... 🌧️`
  }
];