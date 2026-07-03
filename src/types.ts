export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string; // Bullet points or text block
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  link: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillCategory {
  id: string;
  name: string; // e.g. "Languages", "Tools"
  skills: string[]; // e.g. ["TypeScript", "React"]
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
}

export interface ATSAnalysisResult {
  score: number;
  matchLevel: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  missingKeywords: string[];
  matchedKeywords: string[];
  recommendations: {
    category: 'Content' | 'Keywords' | 'Formatting' | 'Impact';
    severity: 'high' | 'medium' | 'low';
    message: string;
  }[];
  sectionScores: {
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
}

export interface AISuggestion {
  id: string;
  section: 'summary' | 'experience' | 'education' | 'skills' | 'projects';
  targetId?: string; // id of experience, education, or project
  originalText: string;
  suggestedText: string;
  reason: string;
  impactLevel: 'high' | 'medium' | 'low';
}
