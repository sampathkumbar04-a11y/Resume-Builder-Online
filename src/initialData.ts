import { ResumeData } from "./types";

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full-Stack Engineer",
    email: "alex.rivera@email.com",
    phone: "(555) 019-2834",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    linkedin: "linkedin.com/in/alex-rivera-dev",
    github: "github.com/alexrivera"
  },
  summary: "Results-driven Full-Stack Engineer with 5+ years of experience designing, building, and deploying highly scalable web applications. Expert in React, TypeScript, Node.js, and cloud architectures. Proven track record of spearheading developer teams, improving application performance by up to 40%, and delivering complex enterprise solutions under budget.",
  experiences: [
    {
      id: "exp-1",
      company: "CloudScale Technologies",
      position: "Lead Software Engineer",
      location: "San Francisco, CA",
      startDate: "2023-03",
      endDate: "",
      current: true,
      description: "- Spearheaded migration of legacy monolithic system to a scalable microservices architecture using React, NestJS, and AWS, improving page loads by 35%.\n- Mentored and guided 6 junior engineers, conducting weekly code reviews and implementing robust CI/CD pipelines to reduce deployment failure rates by 20%.\n- Designed and implemented a real-time analytics dashboard handling over 10M events daily, reducing database CPU load by 45% using Redis caching."
    },
    {
      id: "exp-2",
      company: "PixelPoint Analytics",
      position: "Software Engineer II",
      location: "Oakland, CA",
      startDate: "2021-06",
      endDate: "2023-02",
      current: false,
      description: "- Built and maintained highly responsive user interfaces utilizing React, TypeScript, and Tailwind CSS, increasing user retention metrics by 15%.\n- Managed integrations with third-party payment gateways (Stripe, PayPal), streamlining checkout flow and decreasing transaction drop-offs by 8%.\n- Optimized webpack and asset bundling setups to shave 1.2 seconds off initial bundle load times across multiple core application domains."
    }
  ],
  educations: [
    {
      id: "edu-1",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science in Computer Science",
      location: "Berkeley, CA",
      startDate: "2017-09",
      endDate: "2021-05",
      current: false,
      gpa: "3.8/4.0",
      description: "Graduated with Honors. Coursework focused on Distributed Systems, Software Engineering, and Database Management Systems."
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "SaaS DevKit",
      role: "Creator & Lead Developer",
      link: "https://github.com/alexrivera/saas-devkit",
      startDate: "2022-08",
      endDate: "2022-12",
      description: "Open-source developer boilerplate crafted with React, Vite, Tailwind CSS, and Prisma. Gained over 1,500 GitHub Stars and enabled 200+ developers to spin up applications instantly."
    },
    {
      id: "proj-2",
      name: "GeoPulse Analytics",
      role: "Full-Stack Engineer",
      link: "https://geopulse-demo.dev",
      startDate: "2021-10",
      endDate: "2022-03",
      description: "Interactive real-time geospatial visualizer built using Leaflet.js, React, and Express. Maps regional data trends in under 100ms and integrates with public weather APIs."
    }
  ],
  skills: [
    {
      id: "skill-1",
      name: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3"]
    },
    {
      id: "skill-2",
      name: "Frameworks & Libraries",
      skills: ["React", "Next.js", "Express", "Node.js", "NestJS", "Tailwind CSS", "Redux Toolkit"]
    },
    {
      id: "skill-3",
      name: "Tools & Infrastructure",
      skills: ["Git", "Docker", "AWS (S3, EC2, Lambda)", "PostgreSQL", "Redis", "Vercel", "CI/CD (GitHub Actions)"]
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services (AWS)",
      date: "2022-09",
      link: ""
    },
    {
      id: "cert-2",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2021-11",
      link: ""
    }
  ]
};
