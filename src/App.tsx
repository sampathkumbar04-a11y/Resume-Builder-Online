import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  FolderGit, 
  Wrench, 
  Award, 
  Sparkles, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  Eye, 
  Maximize2, 
  Minimize2, 
  ChevronRight, 
  Info, 
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  PlusCircle,
  Copy,
  ChevronDown,
  Sparkle,
  GripVertical,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { initialResumeData } from "./initialData";
import { ResumeData, Experience, Education, Project, SkillCategory, Certification, ATSAnalysisResult, AISuggestion } from "./types";

export default function App() {
  // --- States ---
  const [resume, setResume] = useState<ResumeData>(initialResumeData);
  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications">("personal");
  const [template, setTemplate] = useState<"professional" | "minimalist" | "creative" | "executive">("professional");
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);
  
  // AI Cover Letter Generator states
  const [previewMode, setPreviewMode] = useState<"resume" | "cover-letter">("resume");
  const [coverLetterCompany, setCoverLetterCompany] = useState<string>("");
  const [coverLetterRecipient, setCoverLetterRecipient] = useState<string>("Hiring Manager");
  const [coverLetterTone, setCoverLetterTone] = useState<string>("Professional & Enthusiastic");
  const [coverLetterText, setCoverLetterText] = useState<string>("");
  const [coverLetterSubject, setCoverLetterSubject] = useState<string>("");
  const [coverLetterStrengths, setCoverLetterStrengths] = useState<string[]>([]);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState<boolean>(false);
  
  // Job Description state for ATS analysis
  const [jobDescription, setJobDescription] = useState<string>("");
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzingAts, setIsAnalyzingAts] = useState<boolean>(false);
  const [atsError, setAtsError] = useState<string | null>(null);

  // AI Suggestions state
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // AI Summary Generator helpers
  const [summaryIndustry, setSummaryIndustry] = useState<string>("");
  const [summaryYears, setSummaryYears] = useState<string>("5");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [generatedSummaries, setGeneratedSummaries] = useState<{ type: string; text: string }[]>([]);
  const [showSummaryGeneratorModal, setShowSummaryGeneratorModal] = useState<boolean>(false);

  // AI Experience Bullet Tailor helpers
  const [tailorActiveExpId, setTailorActiveExpId] = useState<string | null>(null);
  const [isTailoringBullets, setIsTailoringBullets] = useState<boolean>(false);
  const [tailoredBulletsResult, setTailoredBulletsResult] = useState<{ bullets: string[]; explanation: string } | null>(null);
  const [showTailorBulletsModal, setShowTailorBulletsModal] = useState<boolean>(false);

  // Drag and drop states for Experience, Education, and Projects reordering
  const [draggedItem, setDraggedItem] = useState<{ type: "experience" | "education" | "project"; index: number } | null>(null);

  // Legal & Info pages state (About, Contact, Privacy, Terms) for Google AdSense compliance
  const [activeLegalTab, setActiveLegalTab] = useState<"about" | "contact" | "privacy" | "terms" | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState<boolean>(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // --- Dynamic Style Customizer states ---
  const [accentColor, setAccentColor] = useState<"blue" | "indigo" | "emerald" | "amber" | "rose" | "slate">("blue");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [spacingDensity, setSpacingDensity] = useState<"compact" | "normal" | "spacious">("normal");
  const [isStyleCustomizerExpanded, setIsStyleCustomizerExpanded] = useState<boolean>(false);

  // --- Page count and layout management states ---
  const [pageCount, setPageCount] = useState<number>(1);
  const [page2Sections, setPage2Sections] = useState<string[]>([]);
  const [page1Overflow, setPage1Overflow] = useState<boolean>(false);
  const [page2Overflow, setPage2Overflow] = useState<boolean>(false);

  // Helper to check if a section should show on a specific page
  const isSectionVisible = (sectionId: string, pageNum: number): boolean => {
    if (pageCount === 1) {
      return pageNum === 1;
    }
    const isOnPage2 = page2Sections.includes(sectionId);
    return pageNum === 2 ? isOnPage2 : !isOnPage2;
  };

  useEffect(() => {
    const checkOverflow = () => {
      const page1El = document.getElementById("resume-preview");
      if (page1El) {
        setPage1Overflow(page1El.scrollHeight > page1El.clientHeight + 2);
      }
      
      const page2El = document.getElementById("resume-preview-page-2");
      if (page2El) {
        setPage2Overflow(page2El.scrollHeight > page2El.clientHeight + 2);
      } else {
        setPage2Overflow(false);
      }
    };

    const timer = setTimeout(checkOverflow, 250);
    return () => clearTimeout(timer);
  }, [resume, spacingDensity, pageCount, page2Sections, fontFamily, template]);

  // --- Automatic AI Suggestions on load ---
  useEffect(() => {
    // Generate some initial suggestions based on the standard dummy data
    fetchInitialSuggestions();
  }, []);

  const triggerToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      triggerToast("Thank you for reaching out! Your message was sent successfully.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setIsSubmittingContact(false);
      setActiveLegalTab(null);
    }, 1200);
  };

  const fetchInitialSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    setSuggestionError(null);
    try {
      const response = await fetch("/api/suggest-improvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: initialResumeData })
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        throw new Error("Failed to load initial suggestions");
      }
    } catch (err: any) {
      console.warn("Could not get initial AI suggestions:", err);
      // Fallback local suggestions if API/Key is offline
      setSuggestions([
        {
          id: "fallback-1",
          section: "summary",
          originalText: "Results-driven Full-Stack Engineer...",
          suggestedText: "Enterprise-focused Full-Stack Architect with 5+ years of experience leading multi-functional teams. Engineered 12+ cloud microservices delivering 40% database efficiency gains and 35% faster loads.",
          reason: "Adds metrics-focused achievements and aligns leadership tone with senior roles.",
          impactLevel: "high"
        },
        {
          id: "fallback-2",
          section: "experience",
          targetId: "exp-2",
          originalText: "Built and maintained highly responsive user interfaces utilizing React...",
          suggestedText: "Designed and optimized scalable React architectures, driving a 15% improvement in customer retention through enhanced UI accessibility and micro-interactions.",
          reason: "Upgrades weak verb 'Built and maintained' to 'Designed and optimized' and underscores technical precision.",
          impactLevel: "medium"
        }
      ]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // --- Handlers for Personal Info ---
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResume(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value
      }
    }));
  };

  // --- Handlers for Reordering sections (Drag & Drop + Arrows) ---
  const moveExperience = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resume.experiences.length) return;
    setResume(prev => {
      const list = [...prev.experiences];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, experiences: list };
    });
    triggerToast(`Moved work experience block ${direction}!`);
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resume.educations.length) return;
    setResume(prev => {
      const list = [...prev.educations];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, educations: list };
    });
    triggerToast(`Moved education block ${direction}!`);
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resume.projects.length) return;
    setResume(prev => {
      const list = [...prev.projects];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, projects: list };
    });
    triggerToast(`Moved project block ${direction}!`);
  };

  const handleDrop = (targetIndex: number, type: "experience" | "education" | "project") => {
    if (!draggedItem || draggedItem.type !== type) return;
    const sourceIndex = draggedItem.index;
    if (sourceIndex === targetIndex) {
      setDraggedItem(null);
      return;
    }

    setResume(prev => {
      if (type === "experience") {
        const list = [...prev.experiences];
        const [removed] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, removed);
        return { ...prev, experiences: list };
      } else if (type === "education") {
        const list = [...prev.educations];
        const [removed] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, removed);
        return { ...prev, educations: list };
      } else {
        const list = [...prev.projects];
        const [removed] = list.splice(sourceIndex, 1);
        list.splice(targetIndex, 0, removed);
        return { ...prev, projects: list };
      }
    });
    triggerToast(`Reordered ${type} block successfully!`);
    setDraggedItem(null);
  };

  // --- Handlers for Experiences ---
  const handleExperienceChange = (id: string, field: keyof Experience, value: any) => {
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      position: "Software Engineer",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "- Engineered new product initiatives impacting over [X] monthly users.\n- Collaborated with design and QA teams to reduce production issues by [Y]%."
    };
    setResume(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
    setActiveTab("experience");
    triggerToast("Added a new work experience block!");
  };

  const deleteExperience = (id: string) => {
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
    triggerToast("Work experience removed", "info");
  };

  // --- Handlers for Educations ---
  const handleEducationChange = (id: string, field: keyof Education, value: any) => {
    setResume(prev => ({
      ...prev,
      educations: prev.educations.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      school: "New University",
      degree: "Degree / Program",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      description: ""
    };
    setResume(prev => ({
      ...prev,
      educations: [...prev.educations, newEdu]
    }));
    setActiveTab("education");
    triggerToast("Added a new education block!");
  };

  const deleteEducation = (id: string) => {
    setResume(prev => ({
      ...prev,
      educations: prev.educations.filter(edu => edu.id !== id)
    }));
    triggerToast("Education entry removed", "info");
  };

  // --- Handlers for Projects ---
  const handleProjectChange = (id: string, field: keyof Project, value: any) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "New Project Name",
      role: "Lead Creator",
      link: "",
      startDate: "",
      endDate: "",
      description: "Designed a lightweight application solving [Problem]. Optimized load speeds by [X]% and deployed utilizing [Technology]."
    };
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
    setActiveTab("projects");
    triggerToast("Added a new project block!");
  };

  const deleteProject = (id: string) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
    triggerToast("Project entry removed", "info");
  };

  // --- Handlers for Skills ---
  const handleSkillCategoryChange = (id: string, name: string) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.map(cat => cat.id === id ? { ...cat, name } : cat)
    }));
  };

  const handleSkillsListChange = (id: string, skillsString: string) => {
    const list = skillsString.split(",").map(s => s.trim()).filter(s => s.length > 0);
    setResume(prev => ({
      ...prev,
      skills: prev.skills.map(cat => cat.id === id ? { ...cat, skills: list } : cat)
    }));
  };

  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      name: "Specializations",
      skills: ["Skill A", "Skill B"]
    };
    setResume(prev => ({
      ...prev,
      skills: [...prev.skills, newCat]
    }));
    triggerToast("Added a new skill category!");
  };

  const deleteSkillCategory = (id: string) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(cat => cat.id !== id)
    }));
    triggerToast("Skill category removed", "info");
  };

  const addSkillTagDirectly = (categoryName: string, skill: string) => {
    setResume(prev => {
      const exists = prev.skills.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (exists) {
        return {
          ...prev,
          skills: prev.skills.map(c => c.name.toLowerCase() === categoryName.toLowerCase() 
            ? { ...c, skills: [...new Set([...c.skills, skill])] } 
            : c
          )
        };
      } else {
        // add to first category or create one
        if (prev.skills.length > 0) {
          return {
            ...prev,
            skills: prev.skills.map((c, i) => i === 0 
              ? { ...c, skills: [...new Set([...c.skills, skill])] } 
              : c
            )
          };
        } else {
          return {
            ...prev,
            skills: [{ id: "skill-1", name: "Technical Skills", skills: [skill] }]
          };
        }
      }
    });
    triggerToast(`Added "${skill}" to your skills list!`);
  };

  // --- Handlers for Certifications ---
  const handleCertificationChange = (id: string, field: keyof Certification, value: any) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert)
    }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "New Certification Name",
      issuer: "Credential Issuer",
      date: "",
      link: ""
    };
    setResume(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
    setActiveTab("certifications");
    triggerToast("Added a certification entry!");
  };

  const deleteCertification = (id: string) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
    triggerToast("Certification entry removed", "info");
  };

  // --- AI Features ---

  // 1. Analyze ATS Match
  const analyzeAtsFit = async () => {
    if (!jobDescription.trim()) {
      setAtsError("Please paste a target Job Description to analyze match compatibility.");
      return;
    }
    setIsAnalyzingAts(true);
    setAtsError(null);
    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume, jobDescription })
      });
      if (!response.ok) {
        throw new Error("API analysis failed. Please ensure GEMINI_API_KEY is active.");
      }
      const data = await response.json();
      setAtsResult(data);
      triggerToast("ATS Scan completed successfully!", "success");
    } catch (err: any) {
      console.error(err);
      setAtsError(err.message || "An error occurred while evaluating the ATS score.");
      // Generate realistic mock response so that the user is never stuck in demo
      setAtsResult({
        score: 72,
        matchLevel: "Good",
        missingKeywords: ["Cloud Architecture", "Next.js", "Docker", "SaaS Engineering"],
        matchedKeywords: ["React", "TypeScript", "Node.js", "AWS", "SQL", "CI/CD"],
        recommendations: [
          {
            category: "Keywords",
            severity: "high",
            message: "Incorporate 'Cloud Architecture' and 'Docker' explicitly into your 'Skills' and CloudScale experiences to match requirements."
          },
          {
            category: "Content",
            severity: "medium",
            message: "Under Experience at CloudScale, include an explicit mention of SaaS systems or product design parameters."
          }
        ],
        sectionScores: {
          summary: 80,
          experience: 75,
          education: 90,
          skills: 60
        }
      });
    } finally {
      setIsAnalyzingAts(false);
    }
  };

  // 2. Trigger suggestions manually
  const regenerateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    setSuggestionError(null);
    try {
      const response = await fetch("/api/suggest-improvements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: resume })
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        triggerToast("AI analyzed your resume and generated new tips!");
      } else {
        throw new Error("Failed to refresh suggestions.");
      }
    } catch (err: any) {
      console.error(err);
      setSuggestionError("Failed to connect with AI service. Loaded standard optimizations.");
      // Standard dynamic mock suggestions based on actual content
      setSuggestions([
        {
          id: `sug-mock-${Date.now()}`,
          section: "experience",
          targetId: "exp-1",
          originalText: "Mentored and guided 6 junior engineers...",
          suggestedText: "Coached and upskilled 6 junior software engineers, implementing structured architectural bootcamps and reducing overall deployment regression rates by 20%.",
          reason: "Enhances leadership vocabulary, replacing 'Mentored and guided' with 'Coached and upskilled' to signify high organizational command.",
          impactLevel: "medium"
        },
        {
          id: `sug-mock-2-${Date.now()}`,
          section: "summary",
          originalText: resume.summary.substring(0, Math.min(30, resume.summary.length)) + "...",
          suggestedText: "Dynamic, metrics-driven Lead Engineer with over 5 years of experience delivering high-performance full-stack web applications. Expert in React/TypeScript ecosystems, AWS cloud scaling, and microservice architecture. Spearheaded cloud overhauls that achieved 35% performance upgrades and reduced server costs by 15%.",
          reason: "Dramatically improves metrics emphasis and executive presence.",
          impactLevel: "high"
        }
      ]);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // 3. Apply suggestion directly to state
  const applySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.section === "summary") {
      setResume(prev => ({
        ...prev,
        summary: suggestion.suggestedText
      }));
      triggerToast("Applied AI Executive Summary!");
    } else if (suggestion.section === "experience" && suggestion.targetId) {
      setResume(prev => ({
        ...prev,
        experiences: prev.experiences.map(exp => {
          if (exp.id === suggestion.targetId) {
            // Check if we can do a replace, or replace the entire description
            let newDesc = exp.description;
            if (exp.description.includes(suggestion.originalText)) {
              newDesc = exp.description.replace(suggestion.originalText, suggestion.suggestedText);
            } else {
              // Append or place on top
              newDesc = suggestion.suggestedText + "\n" + exp.description;
            }
            return { ...exp, description: newDesc };
          }
          return exp;
        })
      }));
      triggerToast("Applied optimization to Experience bullet points!");
    } else if (suggestion.section === "projects" && suggestion.targetId) {
      setResume(prev => ({
        ...prev,
        projects: prev.projects.map(p => {
          if (p.id === suggestion.targetId) {
            return { ...p, description: suggestion.suggestedText };
          }
          return p;
        })
      }));
      triggerToast("Applied optimization to Project details!");
    } else {
      // General fallbacks
      setResume(prev => ({
        ...prev,
        summary: suggestion.suggestedText
      }));
      triggerToast("Applied text improvement.");
    }

    // Remove applied suggestion from local suggestions list
    setSuggestions(prev => prev.filter(sug => sug.id !== suggestion.id));
  };

  // 4. Generate Professional Summary Options
  const handleOpenSummaryGenerator = () => {
    setSummaryIndustry(resume.personalInfo.jobTitle || "Software Engineer");
    setGeneratedSummaries([]);
    setShowSummaryGeneratorModal(true);
  };

  const generateSummaryOptions = async () => {
    setIsGeneratingSummary(true);
    try {
      const allSkillsList = resume.skills.flatMap(c => c.skills);
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: resume.personalInfo.jobTitle || "Full-Stack Engineer",
          skills: allSkillsList.slice(0, 8),
          experienceYears: summaryYears,
          focusIndustry: summaryIndustry
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact summary service.");
      }
      const data = await response.json();
      setGeneratedSummaries(data.variations);
    } catch (err: any) {
      console.warn(err);
      // Fallback variations
      setGeneratedSummaries([
        {
          type: "Professional Traditional",
          text: `Accomplished ${resume.personalInfo.jobTitle || "Engineer"} with ${summaryYears} years of technical experience in ${summaryIndustry || "technology solutions"}. Demonstrated proficiency in ${resume.skills[0]?.skills.slice(0, 3).join(", ") || "software development"} and system design. Proven history of collaborating with agile product groups to architect and deliver enterprise-grade web applications.`
        },
        {
          type: "Modern Results-Driven",
          text: `Performance-focused ${resume.personalInfo.jobTitle || "Engineer"} specializing in high-growth ${summaryIndustry || "web technology"}. Architect of modern user experiences using ${resume.skills[0]?.skills.slice(0, 3).join(", ") || "advanced frameworks"}, with a strong reputation for boosting initial page speed metrics by 35%+ and reducing infrastructure layout complexities.`
        },
        {
          type: "Creative Visionary",
          text: `Innovative, collaborative design-to-code enthusiast and ${resume.personalInfo.jobTitle || "Engineer"} backed by ${summaryYears} years of driving web product excellence. Passionate about translating high-fidelity product wireframes into resilient, blazing-fast deployment packages. Driven to engineer human-centric products that solve core enterprise pain-points.`
        }
      ]);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const applyGeneratedSummary = (text: string) => {
    setResume(prev => ({ ...prev, summary: text }));
    setShowSummaryGeneratorModal(false);
    triggerToast("Professional summary updated with AI generation!");
  };

  // 5. Tailor Experience Bullets directly
  const handleOpenTailorBullets = (expId: string) => {
    setTailorActiveExpId(expId);
    setTailoredBulletsResult(null);
    setShowTailorBulletsModal(true);
  };

  const tailorExperienceBullets = async () => {
    if (!jobDescription.trim()) {
      triggerToast("Please paste a target Job Description on the right sidebar first!", "error");
      return;
    }
    const targetExp = resume.experiences.find(e => e.id === tailorActiveExpId);
    if (!targetExp) return;

    setIsTailoringBullets(true);
    try {
      const response = await fetch("/api/tailor-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          position: targetExp.position,
          company: targetExp.company,
          currentDescription: targetExp.description
        })
      });

      if (!response.ok) {
        throw new Error("Unable to connect with AI rewriter.");
      }
      const data = await response.json();
      setTailoredBulletsResult({
        bullets: data.tailoredBullets,
        explanation: data.improvementsExplain
      });
    } catch (err: any) {
      console.warn(err);
      // Fallback bullets matching typical tech JD keywords
      setTailoredBulletsResult({
        bullets: [
          `- Re-engineered microservice platforms at ${targetExp.company} using state-of-the-art frameworks, resulting in a 40% improvement in API query responses.`,
          `- Standardized responsive UI component architectures, reducing standard deployment bugs by 15% and increasing mobile conversion metrics.`,
          `- Optimized database caching schemas using in-memory systems, lowering production CPU cycles by 45%.`
        ],
        explanation: "Injected performance figures, structured active verbs, and added strong keywords matching typical web engineer roles."
      });
    } finally {
      setIsTailoringBullets(false);
    }
  };

  const applyTailoredBullets = () => {
    if (!tailoredBulletsResult || !tailorActiveExpId) return;
    const bulletText = tailoredBulletsResult.bullets.join("\n");
    setResume(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === tailorActiveExpId 
        ? { ...exp, description: bulletText } 
        : exp
      )
    }));
    setShowTailorBulletsModal(false);
    triggerToast("Injected AI-tailored bullets into your work experience!");
  };

  // --- AI Cover Letter Generator ---
  const generateTailoredCoverLetter = async () => {
    if (!jobDescription.trim()) {
      triggerToast("Please paste a target Job Description on the right sidebar first!", "error");
      return;
    }
    setIsGeneratingCoverLetter(true);
    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resume,
          jobDescription,
          companyName: coverLetterCompany,
          recipientName: coverLetterRecipient,
          tone: coverLetterTone
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact Cover Letter generator.");
      }
      const data = await response.json();
      setCoverLetterText(data.coverLetterText);
      setCoverLetterSubject(data.subjectLine);
      setCoverLetterStrengths(data.keyStrengthsHighlighted);
      triggerToast("AI successfully tailored your custom Cover Letter!");
    } catch (err: any) {
      console.warn(err);
      // Fallback Cover Letter text
      const name = resume.personalInfo.fullName || "Candidate";
      const title = resume.personalInfo.jobTitle || "Professional";
      setCoverLetterSubject(`Application for ${title} Role at ${coverLetterCompany || "your team"}`);
      setCoverLetterText(
        `Dear ${coverLetterRecipient || "Hiring Team"},\n\nI am writing to express my strong enthusiasm for the ${title} position at ${coverLetterCompany || "your company"}. With a robust background in designing high-quality web applications, system architectures, and delivering customer-centric software products, I am confident in my ability to make an immediate positive impact.\n\nThroughout my career, I have honed skills in modern full-stack development, collaborative project engineering, and scalable architecture. I have a proven track record of boosting system performance and leading teams to build high-performance user experiences. I look forward to bringing this expertise to your esteemed organization.\n\nThank you for your time and consideration. I would welcome the opportunity to discuss how my qualifications align with your strategic needs.\n\nSincerely,\n${name}`
      );
      setCoverLetterStrengths(["Product Delivery", "Technical Excellence", "Team Collaboration"]);
      triggerToast("Loaded backup custom cover letter format.", "info");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // --- Printing Functionality ---
  const handlePrint = () => {
    triggerToast("Opening system print dialog. Ensure 'Background graphics' is enabled in settings!", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // --- Style & Layout Engine Configuration Mappers ---
  const ACCENT_COLORS = {
    blue: {
      primary: "text-blue-600",
      bgLight: "bg-blue-50",
      borderLight: "border-blue-200",
      bgPrimary: "bg-blue-600",
      bgPrimaryHover: "hover:bg-blue-700",
      borderPrimary: "border-blue-600",
      bulletColor: "text-blue-600"
    },
    indigo: {
      primary: "text-indigo-600",
      bgLight: "bg-indigo-50",
      borderLight: "border-indigo-200",
      bgPrimary: "bg-indigo-600",
      bgPrimaryHover: "hover:bg-indigo-700",
      borderPrimary: "border-indigo-600",
      bulletColor: "text-indigo-600"
    },
    emerald: {
      primary: "text-emerald-600",
      bgLight: "bg-emerald-50",
      borderLight: "border-emerald-200",
      bgPrimary: "bg-emerald-600",
      bgPrimaryHover: "hover:bg-emerald-700",
      borderPrimary: "border-emerald-600",
      bulletColor: "text-emerald-600"
    },
    amber: {
      primary: "text-amber-600",
      bgLight: "bg-amber-50",
      borderLight: "border-amber-200",
      bgPrimary: "bg-amber-600",
      bgPrimaryHover: "hover:bg-amber-700",
      borderPrimary: "border-amber-600",
      bulletColor: "text-amber-600"
    },
    rose: {
      primary: "text-rose-600",
      bgLight: "bg-rose-50",
      borderLight: "border-rose-200",
      bgPrimary: "bg-rose-600",
      bgPrimaryHover: "hover:bg-rose-700",
      borderPrimary: "border-rose-600",
      bulletColor: "text-rose-600"
    },
    slate: {
      primary: "text-slate-700",
      bgLight: "bg-slate-100",
      borderLight: "border-slate-300",
      bgPrimary: "bg-slate-800",
      bgPrimaryHover: "hover:bg-slate-900",
      borderPrimary: "border-slate-800",
      bulletColor: "text-slate-700"
    }
  };

  const densitySpacing = {
    compact: {
      container: "space-y-3.5",
      header: "pb-3.5",
      experience: "space-y-2.5",
      sectionGap: "space-y-3.5",
      gridGap: "gap-4 pt-0.5",
      itemGap: "space-y-1.5"
    },
    normal: {
      container: "space-y-6",
      header: "pb-5",
      experience: "space-y-4",
      sectionGap: "space-y-5",
      gridGap: "gap-6 pt-1",
      itemGap: "space-y-2.5"
    },
    spacious: {
      container: "space-y-8.5",
      header: "pb-6.5",
      experience: "space-y-5.5",
      sectionGap: "space-y-6.5",
      gridGap: "gap-8 pt-1.5",
      itemGap: "space-y-3.5"
    }
  };

  const primaryText = ACCENT_COLORS[accentColor]?.primary || "text-blue-600";
  const bgLight = ACCENT_COLORS[accentColor]?.bgLight || "bg-blue-50";
  const borderLight = ACCENT_COLORS[accentColor]?.borderLight || "border-blue-200";
  const bgPrimary = ACCENT_COLORS[accentColor]?.bgPrimary || "bg-blue-600";
  const bulletColor = ACCENT_COLORS[accentColor]?.bulletColor || "text-blue-600";

  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${resume.personalInfo.fullName ? resume.personalInfo.fullName.replace(/\s+/g, "_") : "resume"}_backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Downloaded Resume backup JSON!");
    } catch (err) {
      triggerToast("Failed to export backup.", "error");
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.personalInfo) {
          setResume(parsed);
          triggerToast("Successfully loaded resume backup!", "success");
        } else {
          triggerToast("Invalid backup file format. Must be a valid Resume JSON.", "error");
        }
      } catch (err) {
        triggerToast("Failed to parse JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  // --- Quick fill default demo data if they clear it ---
  const resetToDemo = () => {
    setResume(initialResumeData);
    triggerToast("Reset resume editor back to demo sample.", "info");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-12 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm max-w-sm transition-all animate-bounce print:hidden ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
            : toast.type === "error"
            ? "bg-rose-50 border-rose-200 text-rose-950"
            : "bg-blue-50 border-blue-200 text-blue-900"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
          }`} />
          <p className="font-medium">{toast.message}</p>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-xs shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black tracking-wider shadow-md shadow-blue-200">R</div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-800">ProResume<span className="text-blue-600">Builder</span></span>
            <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">AI-Engineered v1.2</div>
          </div>
        </div>

        {/* Template Select Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => { setTemplate("professional"); triggerToast("Switched to Professional Polish template"); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${template === "professional" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Professional Polish
          </button>
          <button 
            onClick={() => { setTemplate("minimalist"); triggerToast("Switched to Modern Minimalist template"); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${template === "minimalist" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Modern Minimalist
          </button>
          <button 
            onClick={() => { setTemplate("creative"); triggerToast("Switched to Bold Creative template"); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${template === "creative" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Bold Creative
          </button>
          <button 
            onClick={() => { setTemplate("executive"); triggerToast("Switched to Elegant Executive template"); }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${template === "executive" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
          >
            Elegant Executive
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={resetToDemo}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent rounded-md transition-all"
          >
            Reset Demo
          </button>
          
          <button 
            onClick={handlePrint}
            id="download-pdf-btn"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="flex flex-1 overflow-hidden print:overflow-visible print:block print:h-auto">
        
        {/* SIDEBAR LEFT: Editor inputs */}
        <aside className="w-96 md:w-[410px] lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0 print:hidden">
          
          {/* Navigation Tab Strip */}
          <div className="border-b border-slate-100 bg-slate-50/50 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 px-1.5">Resume Core Sections</h2>
            
            <div className="grid grid-cols-2 gap-1">
              <button 
                id="tab-personal"
                onClick={() => setActiveTab("personal")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "personal" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Personal Info</span>
                {resume.personalInfo.fullName ? <span className="ml-auto text-[10px] text-emerald-500">✓</span> : null}
              </button>

              <button 
                id="tab-summary"
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "summary" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Summary</span>
                {resume.summary ? <span className="ml-auto text-[10px] text-emerald-500">✓</span> : null}
              </button>

              <button 
                id="tab-experience"
                onClick={() => setActiveTab("experience")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "experience" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Experience</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1 rounded-sm">{resume.experiences.length}</span>
              </button>

              <button 
                id="tab-education"
                onClick={() => setActiveTab("education")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "education" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Education</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1 rounded-sm">{resume.educations.length}</span>
              </button>

              <button 
                id="tab-skills"
                onClick={() => setActiveTab("skills")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "skills" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Skills</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1 rounded-sm">{resume.skills.length}</span>
              </button>

              <button 
                id="tab-projects"
                onClick={() => setActiveTab("projects")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "projects" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <FolderGit className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Projects</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1 rounded-sm">{resume.projects.length}</span>
              </button>
            </div>

            <div className="mt-2.5">
              <button 
                id="tab-certifications"
                onClick={() => setActiveTab("certifications")}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-xs font-bold transition-all border ${
                  activeTab === "certifications" 
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Certifications & Achievements</span>
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 px-1 rounded-sm">{resume.certifications.length}</span>
              </button>
            </div>
          </div>

          {/* Active Section Form Fields */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* 1. PERSONAL INFO SECTION */}
            {activeTab === "personal" && (
              <div className="space-y-3.5" id="form-personal">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Let employers reach you easily</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={resume.personalInfo.fullName} 
                    onChange={handlePersonalInfoChange}
                    className="w-full p-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Job Title</label>
                  <input 
                    type="text" 
                    name="jobTitle" 
                    value={resume.personalInfo.jobTitle} 
                    onChange={handlePersonalInfoChange}
                    className="w-full p-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium"
                    placeholder="e.g. Lead Software Engineer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={resume.personalInfo.email} 
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium"
                      placeholder="e.g. john@email.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="text" 
                      name="phone" 
                      value={resume.personalInfo.phone} 
                      onChange={handlePersonalInfoChange}
                      className="w-full p-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium"
                      placeholder="e.g. (555) 019-2834"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={resume.personalInfo.location} 
                    onChange={handlePersonalInfoChange}
                    className="w-full p-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium"
                    placeholder="e.g. New York, NY"
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 mt-4 space-y-3">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Professional Links</h4>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <input 
                        type="text" 
                        name="website" 
                        value={resume.personalInfo.website} 
                        onChange={handlePersonalInfoChange}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        placeholder="Website URL"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      <input 
                        type="text" 
                        name="linkedin" 
                        value={resume.personalInfo.linkedin} 
                        onChange={handlePersonalInfoChange}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        placeholder="LinkedIn Profile Link"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                      <input 
                        type="text" 
                        name="github" 
                        value={resume.personalInfo.github} 
                        onChange={handlePersonalInfoChange}
                        className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        placeholder="GitHub URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. EXECUTIVE SUMMARY SECTION */}
            {activeTab === "summary" && (
              <div className="space-y-3.5" id="form-summary">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Professional Summary</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Brief elevator pitch of your credentials</p>
                  </div>
                  
                  <button 
                    onClick={handleOpenSummaryGenerator}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-[10px] font-bold text-purple-700 cursor-pointer transition-all shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Generate
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Summary Text</label>
                  <textarea 
                    value={resume.summary}
                    onChange={(e) => setResume(prev => ({ ...prev, summary: e.target.value }))}
                    rows={8}
                    className="w-full p-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded text-xs transition-all outline-none font-medium leading-relaxed"
                    placeholder="Write a powerful 3-4 sentence professional overview summarizing your top achievements..."
                  />
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-semibold">
                    Characters: {resume.summary.length} (Recommend: 150-300)
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 flex gap-2.5">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    <b>Tip:</b> Focus heavily on key technical expertise and quantifiable results. Avoid vague statements like "highly motivated individual". Use our <b>AI Generate</b> to craft multiple optimized options instantly!
                  </p>
                </div>
              </div>
            )}

            {/* 3. WORK EXPERIENCE SECTION */}
            {activeTab === "experience" && (
              <div className="space-y-4" id="form-experience">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Work History</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Add, edit, or tailor professional experiences</p>
                  </div>
                  
                  <button 
                    onClick={addExperience}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[10px] font-bold text-white cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {resume.experiences.map((exp, index) => (
                    <div 
                      key={exp.id} 
                      draggable
                      onDragStart={(e) => {
                        setDraggedItem({ type: "experience", index });
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(index, "experience");
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                      className={`p-3.5 bg-slate-50 border rounded-lg space-y-3 relative hover:shadow-xs transition-all ${
                        draggedItem && draggedItem.type === "experience" && draggedItem.index === index 
                          ? "opacity-40 border-dashed border-blue-400 bg-blue-50/20" 
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 p-0.5" title="Drag to reorder">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Company #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveExperience(index, "up"); }}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveExperience(index, "down"); }}
                            disabled={index === resume.experiences.length - 1}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                          <button 
                            onClick={() => handleOpenTailorBullets(exp.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded text-[9px] font-bold text-purple-700 cursor-pointer"
                            title="Tailor bullet points to target job description using AI"
                          >
                            <Sparkle className="w-2.5 h-2.5" />
                            AI Tailor
                          </button>
                          
                          <button 
                            onClick={() => deleteExperience(exp.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Delete experience block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Company Name</label>
                          <input 
                            type="text" 
                            value={exp.company}
                            onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. Stripe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Position/Title</label>
                          <input 
                            type="text" 
                            value={exp.position}
                            onChange={(e) => handleExperienceChange(exp.id, "position", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. Senior Frontend Developer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Location</label>
                          <input 
                            type="text" 
                            value={exp.location}
                            onChange={(e) => handleExperienceChange(exp.id, "location", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                            placeholder="e.g. Oakland, CA"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Job Timeline</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="text" 
                              value={exp.startDate}
                              onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                              className="w-1/2 p-1.5 bg-white border border-slate-200 rounded text-xs text-center"
                              placeholder="YYYY-MM"
                            />
                            <span className="text-[9px] text-slate-400">to</span>
                            <input 
                              type="text" 
                              value={exp.current ? "Present" : exp.endDate}
                              disabled={exp.current}
                              onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                              className={`w-1/2 p-1.5 bg-white border border-slate-200 rounded text-xs text-center ${exp.current ? "bg-slate-100 text-slate-400" : ""}`}
                              placeholder="YYYY-MM"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <input 
                          type="checkbox" 
                          id={`curr-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => {
                            handleExperienceChange(exp.id, "current", e.target.checked);
                            if (e.target.checked) handleExperienceChange(exp.id, "endDate", "");
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3 h-3"
                        />
                        <label htmlFor={`curr-${exp.id}`} className="text-[10px] font-bold text-slate-600 uppercase cursor-pointer">
                          I currently work here
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Description / Key Achievements (One bullet per line)</label>
                        <textarea 
                          value={exp.description}
                          onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                          rows={4}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono"
                          placeholder="e.g. - Engineered core payment systems reducing failures by 22%..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. EDUCATION SECTION */}
            {activeTab === "education" && (
              <div className="space-y-4" id="form-education">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Academic Education</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Where and what you studied</p>
                  </div>
                  
                  <button 
                    onClick={addEducation}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[10px] font-bold text-white cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {resume.educations.map((edu, index) => (
                    <div 
                      key={edu.id} 
                      draggable
                      onDragStart={(e) => {
                        setDraggedItem({ type: "education", index });
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(index, "education");
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                      className={`p-3.5 bg-slate-50 border rounded-lg space-y-3 relative hover:shadow-xs transition-all ${
                        draggedItem && draggedItem.type === "education" && draggedItem.index === index 
                          ? "opacity-40 border-dashed border-blue-400 bg-blue-50/20" 
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 p-0.5" title="Drag to reorder">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Education #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveEducation(index, "up"); }}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveEducation(index, "down"); }}
                            disabled={index === resume.educations.length - 1}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                          <button 
                            onClick={() => deleteEducation(edu.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Delete education block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">School / Institution</label>
                          <input 
                            type="text" 
                            value={edu.school}
                            onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. UC Berkeley"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Degree / Program</label>
                          <input 
                            type="text" 
                            value={edu.degree}
                            onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. B.S. in Computer Science"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Location</label>
                          <input 
                            type="text" 
                            value={edu.location}
                            onChange={(e) => handleEducationChange(edu.id, "location", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                            placeholder="Berkeley, CA"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Dates</label>
                          <input 
                            type="text" 
                            value={edu.startDate + " — " + (edu.current ? "Present" : edu.endDate)}
                            onChange={(e) => {
                              const parts = e.target.value.split("—");
                              handleEducationChange(edu.id, "startDate", parts[0]?.trim() || "");
                              handleEducationChange(edu.id, "endDate", parts[1]?.trim() || "");
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-center"
                            placeholder="2017 — 2021"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">GPA</label>
                          <input 
                            type="text" 
                            value={edu.gpa}
                            onChange={(e) => handleEducationChange(edu.id, "gpa", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-center font-bold"
                            placeholder="e.g. 3.8/4.0"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Accomplishments / Coursework</label>
                        <textarea 
                          value={edu.description}
                          onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                          placeholder="e.g. Specialized in Algorithms, Databases, and Systems."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SKILLS SECTION */}
            {activeTab === "skills" && (
              <div className="space-y-4" id="form-skills">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Skills Categories</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Group technical and soft skills</p>
                  </div>
                  
                  <button 
                    onClick={addSkillCategory}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[10px] font-bold text-white cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                <div className="space-y-3.5">
                  {resume.skills.map((cat, index) => (
                    <div key={cat.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative hover:shadow-xs transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Category #{index + 1}
                        </span>
                        <button 
                          onClick={() => deleteSkillCategory(cat.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Delete skill category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Category Name</label>
                        <input 
                          type="text" 
                          value={cat.name}
                          onChange={(e) => handleSkillCategoryChange(cat.id, e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                          placeholder="e.g. Languages / Technologies"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Skills (Comma-separated)</label>
                        <input 
                          type="text" 
                          value={cat.skills.join(", ")}
                          onChange={(e) => handleSkillsListChange(cat.id, e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-medium"
                          placeholder="React, TypeScript, Next.js, Redux"
                        />
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cat.skills.map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[9px] font-semibold uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROJECTS SECTION */}
            {activeTab === "projects" && (
              <div className="space-y-4" id="form-projects">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Projects</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Showcase products or research you've built</p>
                  </div>
                  
                  <button 
                    onClick={addProject}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[10px] font-bold text-white cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {resume.projects.map((proj, index) => (
                    <div 
                      key={proj.id} 
                      draggable
                      onDragStart={(e) => {
                        setDraggedItem({ type: "project", index });
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(index, "project");
                      }}
                      onDragEnd={() => setDraggedItem(null)}
                      className={`p-3.5 bg-slate-50 border rounded-lg space-y-3 relative hover:shadow-xs transition-all ${
                        draggedItem && draggedItem.type === "project" && draggedItem.index === index 
                          ? "opacity-40 border-dashed border-blue-400 bg-blue-50/20" 
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 p-0.5" title="Drag to reorder">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Project #{index + 1}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveProject(index, "up"); }}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveProject(index, "down"); }}
                            disabled={index === resume.projects.length - 1}
                            className="p-1 rounded hover:bg-slate-200/60 text-slate-500 disabled:opacity-20 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                          <button 
                            onClick={() => deleteProject(proj.id)}
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Delete project entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project Name</label>
                          <input 
                            type="text" 
                            value={proj.name}
                            onChange={(e) => handleProjectChange(proj.id, "name", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. SaaS DevKit"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Your Role</label>
                          <input 
                            type="text" 
                            value={proj.role}
                            onChange={(e) => handleProjectChange(proj.id, "role", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. Creator / Lead Dev"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project URL / Link</label>
                          <input 
                            type="text" 
                            value={proj.link}
                            onChange={(e) => handleProjectChange(proj.id, "link", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                            placeholder="e.g. github.com/user/project"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Timeline Dates</label>
                          <input 
                            type="text" 
                            value={proj.startDate + " — " + proj.endDate}
                            onChange={(e) => {
                              const parts = e.target.value.split("—");
                              handleProjectChange(proj.id, "startDate", parts[0]?.trim() || "");
                              handleProjectChange(proj.id, "endDate", parts[1]?.trim() || "");
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-center"
                            placeholder="Aug 2022 — Dec 2022"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project Details / Description</label>
                        <textarea 
                          value={proj.description}
                          onChange={(e) => handleProjectChange(proj.id, "description", e.target.value)}
                          rows={3}
                          className="w-full p-2 bg-white border border-slate-200 rounded text-xs font-medium leading-relaxed"
                          placeholder="Brief description of technology used, key problems solved, and metric-backed outcomes."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CERTIFICATIONS SECTION */}
            {activeTab === "certifications" && (
              <div className="space-y-4" id="form-certifications">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Certifications & Accreditations</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Certificates and corporate achievements</p>
                  </div>
                  
                  <button 
                    onClick={addCertification}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[10px] font-bold text-white cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {resume.certifications.map((cert, index) => (
                    <div key={cert.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative hover:shadow-xs transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          Certification #{index + 1}
                        </span>
                        <button 
                          onClick={() => deleteCertification(cert.id)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                          title="Delete certification block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Certification Name</label>
                          <input 
                            type="text" 
                            value={cert.name}
                            onChange={(e) => handleCertificationChange(cert.id, "name", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. AWS Certified Solutions Architect"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Issuer Organization</label>
                          <input 
                            type="text" 
                            value={cert.issuer}
                            onChange={(e) => handleCertificationChange(cert.id, "issuer", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold"
                            placeholder="e.g. Amazon Web Services"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Date Obtained</label>
                          <input 
                            type="text" 
                            value={cert.date}
                            onChange={(e) => handleCertificationChange(cert.id, "date", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-center font-medium"
                            placeholder="e.g. Sept 2022"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Credential Link (Optional)</label>
                          <input 
                            type="text" 
                            value={cert.link}
                            onChange={(e) => handleCertificationChange(cert.id, "link", e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                            placeholder="e.g. aws.amazon.com/verify/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Customizer & Backup Board */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 shadow-sm transition-all duration-200">
            <div 
              onClick={() => setIsStyleCustomizerExpanded(!isStyleCustomizerExpanded)}
              className="flex items-center justify-between cursor-pointer select-none hover:bg-slate-200/60 p-1.5 rounded-lg transition-colors"
              title="Click to toggle styling settings"
            >
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Style Customizer & Backup
              </h3>
              <div className="flex items-center gap-2">
                {!isStyleCustomizerExpanded && (
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                    Settings
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isStyleCustomizerExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>

            {isStyleCustomizerExpanded && (
              <div className="space-y-3.5 mt-3 pt-3 border-t border-slate-200/60 animate-fadeIn">
                {/* Accent Color Selection Row */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Theme Accent Color</span>
                    <span className="text-[9px] font-bold text-slate-600 capitalize" style={{ color: `var(--color-${accentColor}-600)` }}>{accentColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["blue", "indigo", "emerald", "amber", "rose", "slate"] as const).map((color) => {
                      const presets = {
                        blue: "bg-blue-600 hover:bg-blue-700",
                        indigo: "bg-indigo-600 hover:bg-indigo-700",
                        emerald: "bg-emerald-600 hover:bg-emerald-700",
                        amber: "bg-amber-600 hover:bg-amber-700",
                        rose: "bg-rose-600 hover:bg-rose-700",
                        slate: "bg-slate-800 hover:bg-slate-900"
                      };
                      return (
                        <button
                          key={color}
                          onClick={() => { setAccentColor(color); triggerToast(`Applied ${color} color scheme!`); }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${
                            accentColor === color ? "border-slate-800 scale-110 shadow-xs" : "border-transparent"
                          } ${presets[color]}`}
                          title={`Switch to ${color} theme`}
                        >
                          {accentColor === color && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font and Density Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Font Family Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Typography</span>
                    <div className="flex flex-col gap-1">
                      {(["sans", "serif", "mono"] as const).map((font) => (
                        <button
                          key={font}
                          onClick={() => { setFontFamily(font); triggerToast(`Changed typography to ${font === "sans" ? "Modern Sans" : font === "serif" ? "Classic Serif" : "Technical Mono"}!`); }}
                          className={`px-2 py-1 text-[10px] font-bold rounded border text-left transition-all flex items-center justify-between cursor-pointer ${
                            fontFamily === font 
                              ? "bg-slate-900 border-slate-950 text-white shadow-2xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50"
                          }`}
                        >
                          <span className={font === "sans" ? "font-sans" : font === "serif" ? "font-serif" : "font-mono"}>
                            {font === "sans" ? "Modern Sans" : font === "serif" ? "Classic Serif" : "Tech Mono"}
                          </span>
                          {fontFamily === font && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacing Density Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page Spacing</span>
                    <div className="flex flex-col gap-1">
                      {(["compact", "normal", "spacious"] as const).map((density) => (
                        <button
                          key={density}
                          onClick={() => { setSpacingDensity(density); triggerToast(`Set page density to ${density}!`); }}
                          className={`px-2 py-1 text-[10px] font-bold rounded border text-left transition-all flex items-center justify-between cursor-pointer ${
                            spacingDensity === density 
                              ? "bg-slate-900 border-slate-950 text-white shadow-2xs" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50"
                          }`}
                        >
                          <span className="capitalize">{density}</span>
                          {spacingDensity === density && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page Layout Manager */}
                <div className="border-t border-slate-200/60 pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Page Configuration</span>
                    {(page1Overflow || page2Overflow) && (
                      <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-1 py-0.5 rounded animate-pulse">
                        ⚠️ Overflowing
                      </span>
                    )}
                  </div>
                  
                  {/* Page Count Selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPageCount(1);
                        triggerToast("Switched to Single Page Mode!");
                      }}
                      className={`py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                        pageCount === 1
                          ? "bg-slate-900 text-white border-slate-950 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-150/50"
                      }`}
                    >
                      Single Page
                    </button>
                    <button
                      onClick={() => {
                        setPageCount(2);
                        triggerToast("Enabled 2-Page Document!");
                      }}
                      className={`py-1.5 rounded text-xs font-bold border transition-all cursor-pointer ${
                        pageCount === 2
                          ? "bg-slate-900 text-white border-slate-950 shadow-2xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-150/50"
                      }`}
                    >
                      Add Page (Multi-Page)
                    </button>
                  </div>

                  {/* If Multi-Page is active, show the section placement options */}
                  {pageCount === 2 && (
                    <div className="bg-slate-50 border border-slate-100 rounded p-2.5 space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                        Assign Sections to Page 2
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          { id: "summary", label: "Executive Profile" },
                          { id: "experience", label: "Work Experience" },
                          { id: "education", label: "Education" },
                          { id: "projects", label: "Key Projects" },
                          { id: "skills", label: "Technical Skills" },
                          { id: "certifications", label: "Certifications" }
                        ].map((sec) => {
                          const isAssigned = page2Sections.includes(sec.id);
                          return (
                            <label
                              key={sec.id}
                              className="flex items-center gap-2 text-[10px] text-slate-700 font-semibold cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isAssigned}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPage2Sections([...page2Sections, sec.id]);
                                    triggerToast(`Moved ${sec.label} to Page 2!`);
                                  } else {
                                    setPage2Sections(page2Sections.filter(id => id !== sec.id));
                                    triggerToast(`Moved ${sec.label} back to Page 1!`);
                                  }
                                }}
                                className="rounded text-slate-900 focus:ring-slate-900 w-3 h-3 cursor-pointer"
                              />
                              <span>{sec.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
                        Tip: Sections not selected will automatically stay on Page 1.
                      </p>
                    </div>
                  )}

                  {/* Helpful tips or warnings */}
                  {pageCount === 1 && page1Overflow && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded p-2 text-[9px] font-bold leading-normal">
                      ⚠️ Content is too long and overflows Page 1. Shorten descriptions, change Spacing to Compact, or click &ldquo;Add Page&rdquo; above!
                    </div>
                  )}
                  {pageCount === 2 && page1Overflow && (
                    <div className="bg-amber-50 border border-amber-100 text-amber-700 rounded p-2 text-[9px] font-bold leading-normal">
                      ⚠️ Page 1 is still overflowing. Move more sections to Page 2 or make them more compact!
                    </div>
                  )}
                  {pageCount === 2 && page2Overflow && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded p-2 text-[9px] font-bold leading-normal">
                      ⚠️ Page 2 is overflowing. Reduce the content size or adjust layout!
                    </div>
                  )}
                </div>

                {/* Backup Engine section */}
                <div className="border-t border-slate-200/60 pt-3 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Backup Recovery Engine</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="px-2 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      title="Download full backup of current resume"
                    >
                      <Download className="w-3 h-3" /> Export Backup
                    </button>
                    <label className="px-2 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                      <FileSpreadsheet className="w-3 h-3" /> Import Backup
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

        </aside>

        {/* CENTER STAGE: Live Resume Preview with Zoom Controls */}
        <section className="flex-1 bg-slate-100 p-6 flex flex-col items-center justify-start overflow-hidden relative print:bg-white print:p-0 print:block print:h-auto print:overflow-visible">
          
          {/* Zoom & Page Info Controls */}
          <div className="w-full max-w-3xl flex items-center justify-between mb-4 px-2 print:hidden shrink-0">
            <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-lg shadow-2xs">
              <button
                onClick={() => { setPreviewMode("resume"); triggerToast("Switched to Resume Canvas!"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  previewMode === "resume" 
                    ? "bg-slate-900 text-white shadow-2xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Resume Canvas
              </button>
              <button
                onClick={() => { setPreviewMode("cover-letter"); triggerToast("Switched to Cover Letter workspace!"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  previewMode === "cover-letter" 
                    ? "bg-slate-900 text-white shadow-2xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkle className="w-3.5 h-3.5 text-purple-500" />
                AI Cover Letter
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-md shadow-2xs">
              <button 
                onClick={() => setPreviewZoom(Math.max(0.5, previewZoom - 0.05))}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-xs font-bold text-slate-600 transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] font-bold text-slate-500 w-10 text-center uppercase">
                {Math.round(previewZoom * 100)}%
              </span>
              <button 
                onClick={() => setPreviewZoom(Math.min(1.2, previewZoom + 0.05))}
                className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded text-xs font-bold text-slate-600 transition-colors"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          {/* AI Cover Letter Customizer panel in Center Stage */}
          {previewMode === "cover-letter" && (
            <div className="w-full max-w-3xl bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col gap-3.5 print:hidden animate-fade-in">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">AI Cover Letter Customizer</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wide text-slate-500">Target Company</label>
                  <input 
                    type="text" 
                    value={coverLetterCompany}
                    onChange={(e) => setCoverLetterCompany(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded text-xs outline-none font-medium text-slate-800"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wide text-slate-500">Recipient Name / Title</label>
                  <input 
                    type="text" 
                    value={coverLetterRecipient}
                    onChange={(e) => setCoverLetterRecipient(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded text-xs outline-none font-medium text-slate-800"
                    placeholder="e.g. Jane Doe (Tech Lead)"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wide text-slate-500">Cover Letter Tone</label>
                  <select 
                    value={coverLetterTone}
                    onChange={(e) => setCoverLetterTone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded text-xs outline-none font-medium text-slate-800"
                  >
                    <option value="Professional & Enthusiastic">Professional & Enthusiastic</option>
                    <option value="Direct & Bold">Direct & Bold</option>
                    <option value="Analytical & Technical">Analytical & Technical</option>
                    <option value="Warm & Creative">Warm & Creative</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 mt-1.5 pt-2.5 border-t border-slate-100">
                <button
                  onClick={generateTailoredCoverLetter}
                  disabled={isGeneratingCoverLetter}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded text-xs font-bold uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isGeneratingCoverLetter ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Drafting Tailored Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate and Tailor Letter
                    </>
                  )}
                </button>

                {coverLetterText && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${coverLetterSubject ? "Subject: " + coverLetterSubject + "\n\n" : ""}${coverLetterText}`);
                        triggerToast("Cover letter copied to clipboard!");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Text
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Print Letter
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Interactive Scaled Resume Wrapper */}
          <div className="flex-1 w-full overflow-y-auto flex justify-center items-start pb-10 print:overflow-visible print:pb-0 print:block">
            <div 
              style={{ transform: `scale(${previewZoom})` }} 
              className="origin-top transition-transform duration-100 shrink-0 select-text relative print:transform-none print:shadow-none print:w-full print:p-0 print:static"
            >
              
              {/* Actual A4 Sheet Box (595px width x 842px height corresponds roughly to 1:1.414 standard ratio) */}
              {previewMode === "resume" ? (
                <div className="flex flex-col gap-6 print:gap-0 print:block">
                  {[1, 2].slice(0, pageCount).map((pageNum) => {
                    // Check columns visibility for Template 1 (Professional Polish)
                    const showLeftT1 = (resume.educations.length > 0 && isSectionVisible("education", pageNum)) || 
                                       (resume.certifications.length > 0 && isSectionVisible("certifications", pageNum));
                    const showRightT1 = (resume.skills.length > 0 && isSectionVisible("skills", pageNum)) || 
                                        (resume.projects.length > 0 && isSectionVisible("projects", pageNum));

                    // Check columns visibility for Template 2 (Modern Minimalist)
                    const showLeftT2 = (resume.skills.length > 0 && isSectionVisible("skills", pageNum)) || 
                                       (resume.certifications.length > 0 && isSectionVisible("certifications", pageNum));
                    const showRightT2 = (resume.educations.length > 0 && isSectionVisible("education", pageNum)) || 
                                        (resume.projects.length > 0 && isSectionVisible("projects", pageNum));

                    // Check columns visibility for Template 4 (Elegant Executive)
                    const showLeftT4 = (resume.summary && isSectionVisible("summary", pageNum)) || 
                                       (resume.experiences.length > 0 && isSectionVisible("experience", pageNum)) || 
                                       (resume.projects.length > 0 && isSectionVisible("projects", pageNum));
                    const showRightT4 = (resume.skills.length > 0 && isSectionVisible("skills", pageNum)) || 
                                        (resume.educations.length > 0 && isSectionVisible("education", pageNum)) || 
                                        (resume.certifications.length > 0 && isSectionVisible("certifications", pageNum));

                    return (
                      <div 
                        key={pageNum}
                        id={pageNum === 1 ? "resume-preview" : "resume-preview-page-2"}
                        className={`relative w-[794px] h-[1123px] max-h-[1123px] min-h-[1123px] bg-white p-[20mm] text-slate-900 border border-slate-300 font-${fontFamily} shadow-lg overflow-hidden flex flex-col justify-between print:mb-0 print:shadow-none print:border-none resume-page`}
                      >
                        {/* Subtly show Page Header on Page 2 (for premium aesthetics, hidden on print) */}
                        {pageNum === 2 && (
                          <div className="text-[9px] text-slate-400 border-b pb-1 mb-4 flex justify-between font-mono print:hidden select-none">
                            <span>{resume.personalInfo.fullName || "Your Name"} &mdash; Page 2</span>
                            <span>Multi-Page Document</span>
                          </div>
                        )}

                        <div>
                          {/* -------------------- TEMPLATE 1: PROFESSIONAL POLISH (CLASSIC) -------------------- */}
                          {template === "professional" && (
                            <div className="flex flex-col h-full justify-between">
                              {/* Header bar - only on Page 1 */}
                              {pageNum === 1 && (
                                <div className="flex justify-between items-center border-b pb-6 mb-6">
                                  {/* Left side: Name and Title with vertical accent bar */}
                                  <div className="border-l-[5px] border-slate-400 pl-4 py-1">
                                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                      {resume.personalInfo.fullName || "Your Full Name"}
                                    </h1>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-2 leading-none">
                                      {resume.personalInfo.jobTitle || "Your Target Job Title"}
                                    </p>
                                  </div>

                                  {/* Right side: Contact Details stacked vertically with rounded black circular icons */}
                                  <div className="text-[10px] text-slate-600 font-medium space-y-1.5 min-w-[180px]">
                                    {resume.personalInfo.phone && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <span className="text-right">{resume.personalInfo.phone}</span>
                                        <div className="bg-slate-900 text-white rounded-full flex items-center justify-center w-[18px] h-[18px] shrink-0">
                                          <Phone className="w-2.5 h-2.5" />
                                        </div>
                                      </div>
                                    )}
                                    {resume.personalInfo.email && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <span className="text-right">{resume.personalInfo.email}</span>
                                        <div className="bg-slate-900 text-white rounded-full flex items-center justify-center w-[18px] h-[18px] shrink-0">
                                          <Mail className="w-2.5 h-2.5" />
                                        </div>
                                      </div>
                                    )}
                                    {resume.personalInfo.location && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <span className="text-right">{resume.personalInfo.location}</span>
                                        <div className="bg-slate-900 text-white rounded-full flex items-center justify-center w-[18px] h-[18px] shrink-0">
                                          <MapPin className="w-2.5 h-2.5" />
                                        </div>
                                      </div>
                                    )}
                                    {(resume.personalInfo.linkedin || resume.personalInfo.website) && (
                                      <div className="flex items-center gap-2 justify-end">
                                        <span className="text-right truncate max-w-[155px]">
                                          {resume.personalInfo.linkedin || resume.personalInfo.website}
                                        </span>
                                        <div className="bg-slate-900 text-white rounded-full flex items-center justify-center w-[18px] h-[18px] shrink-0">
                                          <Globe className="w-2.5 h-2.5" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Professional Overview - only on Page 1 */}
                              {pageNum === 1 && resume.summary && isSectionVisible("summary", pageNum) && (
                                <div className="mb-6">
                                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                                    Professional Overview
                                  </h2>
                                  <p className="text-[10px] text-slate-600 leading-relaxed text-justify font-medium">
                                    {resume.summary}
                                  </p>
                                </div>
                              )}

                              {/* Two Column Layout split with a vertical line */}
                              <div className="grid grid-cols-12 gap-6 flex-1">
                                {/* Left Column: Work Experience and Projects (wider column) */}
                                <div className="col-span-8 pr-6 border-r border-slate-200 flex flex-col gap-6">
                                  {/* Work Experience */}
                                  {resume.experiences.length > 0 && isSectionVisible("experience", pageNum) && (
                                    <div>
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
                                        Work Experience
                                      </h2>
                                      <div className="space-y-4">
                                        {resume.experiences.map((exp) => (
                                          <div key={exp.id} className="group relative">
                                            <h3 className="text-[11px] font-bold text-slate-800 leading-tight">
                                              {exp.position}
                                            </h3>
                                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                              {exp.company} {exp.location ? `, ${exp.location}` : ""} | {exp.startDate} &mdash; {exp.current ? "Present" : exp.endDate}
                                            </p>
                                            <ul className="mt-2 space-y-1.5 list-disc pl-4 text-[10px] text-slate-600 font-medium">
                                              {exp.description.split("\n").map((bullet, idx) => {
                                                const cleanBullet = bullet.replace(/^\s*-\s*/, "").trim();
                                                if (!cleanBullet) return null;
                                                return (
                                                  <li key={idx} className="leading-relaxed text-justify">
                                                    {cleanBullet}
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Projects */}
                                  {resume.projects.length > 0 && isSectionVisible("projects", pageNum) && (
                                    <div className="mt-2">
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4">
                                        Projects
                                      </h2>
                                      <div className="space-y-4">
                                        {resume.projects.map((proj) => (
                                          <div key={proj.id}>
                                            <h3 className="text-[11px] font-bold text-slate-800 leading-tight">
                                              {proj.name}
                                            </h3>
                                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                              {proj.role} | {proj.startDate}
                                            </p>
                                            <p className="text-[10px] text-slate-600 mt-1.5 leading-relaxed text-justify font-medium">
                                              {proj.description}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Education, Skills, Achievements, Professional Development */}
                                <div className="col-span-4 flex flex-col gap-6">
                                  {/* Education */}
                                  {resume.educations.length > 0 && isSectionVisible("education", pageNum) && (
                                    <div>
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Education
                                      </h2>
                                      <div className="space-y-3">
                                        {resume.educations.map((edu) => (
                                          <div key={edu.id}>
                                            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                                              {edu.degree}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                              {edu.school}
                                            </p>
                                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                              {edu.startDate} &mdash; {edu.current ? "Present" : edu.endDate}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Skills */}
                                  {resume.skills.length > 0 && isSectionVisible("skills", pageNum) && (
                                    <div>
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Skills
                                      </h2>
                                      <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-600 font-semibold">
                                        {resume.skills.flatMap(cat => cat.skills).map((skill, idx) => (
                                          <li key={idx} className="leading-tight">
                                            {skill}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Achievements */}
                                  {resume.certifications.length > 0 && isSectionVisible("certifications", pageNum) && (
                                    <div>
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Achievements
                                      </h2>
                                      <div className="space-y-3">
                                        {resume.certifications.slice(0, Math.ceil(resume.certifications.length / 2)).map((cert) => (
                                          <div key={cert.id}>
                                            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                                              {cert.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                              {cert.issuer}
                                            </p>
                                            {cert.date && (
                                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                {cert.date}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Professional Development */}
                                  {resume.certifications.length > 1 && isSectionVisible("certifications", pageNum) && (
                                    <div>
                                      <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Professional Development
                                      </h2>
                                      <div className="space-y-3">
                                        {resume.certifications.slice(Math.ceil(resume.certifications.length / 2)).map((cert) => (
                                          <div key={cert.id}>
                                            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-tight leading-tight">
                                              {cert.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                              {cert.issuer}
                                            </p>
                                            {cert.date && (
                                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                {cert.date}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* -------------------- TEMPLATE 2: MODERN MINIMALIST (TECH/STARTUP) -------------------- */}
                          {template === "minimalist" && (
                            <div className={densitySpacing[spacingDensity].container}>
                              {/* Split top-aligned column - only on Page 1 */}
                              {pageNum === 1 && (
                                <div className={`flex justify-between items-start border-b pb-4 ${borderLight}`}>
                                  <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{resume.personalInfo.fullName || "Your Full Name"}</h1>
                                    <p className={`font-bold text-xs uppercase tracking-widest mt-1 ${primaryText}`}>{resume.personalInfo.jobTitle || "Your Target Job Title"}</p>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-medium text-right space-y-0.5 tracking-wide">
                                    {resume.personalInfo.email && <div>{resume.personalInfo.email}</div>}
                                    {resume.personalInfo.phone && <div>{resume.personalInfo.phone}</div>}
                                    {resume.personalInfo.location && <div>{resume.personalInfo.location}</div>}
                                    {resume.personalInfo.website && <div className={`font-bold ${primaryText}`}>{resume.personalInfo.website}</div>}
                                  </div>
                                </div>
                              )}

                              {/* Brief Profile summary */}
                              {resume.summary && isSectionVisible("summary", pageNum) && (
                                <p className="text-[11px] text-slate-655 leading-relaxed font-medium text-justify mt-3">
                                  {resume.summary}
                                </p>
                              )}

                              {/* Experience section */}
                              {resume.experiences.length > 0 && isSectionVisible("experience", pageNum) && (
                                <div className="space-y-2 mt-4">
                                  <h3 className={`text-[10px] font-black uppercase tracking-widest text-slate-900 border-b pb-1 ${borderLight}`}>Experience</h3>
                                  <div className={`pt-1 ${densitySpacing[spacingDensity].experience}`}>
                                    {resume.experiences.map((exp) => (
                                      <div key={exp.id} className="grid grid-cols-12 gap-2">
                                        <div className="col-span-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                                          {exp.startDate} &mdash; {exp.current ? "Present" : exp.endDate}
                                          <div className="text-[9px] text-slate-400 font-medium normal-case">{exp.location}</div>
                                        </div>
                                        <div className="col-span-9">
                                          <h4 className="text-xs font-black text-slate-900">
                                            {exp.position} <span className="font-medium text-slate-400">@</span> {exp.company}
                                          </h4>
                                          <div className="text-[11px] text-slate-655 mt-1 space-y-1 leading-relaxed text-justify whitespace-pre-line">
                                            {exp.description}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Grid columns */}
                              {(showLeftT2 || showRightT2) && (
                                <div className={`grid grid-cols-12 border-t border-slate-100 mt-4 pt-4 ${densitySpacing[spacingDensity].gridGap}`}>
                                  
                                  {/* Left side: Skills */}
                                  {showLeftT2 && (
                                    <div className={`${showRightT2 ? "col-span-6" : "col-span-12"} ${densitySpacing[spacingDensity].sectionGap}`}>
                                      {resume.skills.length > 0 && isSectionVisible("skills", pageNum) && (
                                        <div className="space-y-2">
                                          <h3 className={`text-[10px] font-black uppercase tracking-widest text-slate-900 border-b pb-1 ${borderLight}`}>Skills</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.skills.map((cat) => (
                                              <div key={cat.id} className="text-[11px]">
                                                <span className={`font-bold uppercase text-[9px] block mb-0.5 ${primaryText}`}>{cat.name}</span>
                                                <span className="text-slate-600 font-medium">{cat.skills.join(", ")}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {resume.certifications.length > 0 && isSectionVisible("certifications", pageNum) && (
                                        <div className="space-y-2 mt-3">
                                          <h3 className={`text-[10px] font-black uppercase tracking-widest text-slate-900 border-b pb-1 ${borderLight}`}>Certifications</h3>
                                          <div className={`pt-1 text-[10px] text-slate-655 ${densitySpacing[spacingDensity].itemGap}`}>
                                            {resume.certifications.map((cert) => (
                                              <div key={cert.id} className="font-semibold">
                                                <span className="text-slate-900 font-bold">{cert.name}</span> &mdash; {cert.issuer} ({cert.date})
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Right side: Education & Projects */}
                                  {showRightT2 && (
                                    <div className={`${showLeftT2 ? "col-span-6" : "col-span-12"} ${densitySpacing[spacingDensity].sectionGap}`}>
                                      {resume.educations.length > 0 && isSectionVisible("education", pageNum) && (
                                        <div className="space-y-2">
                                          <h3 className={`text-[10px] font-black uppercase tracking-widest text-slate-900 border-b pb-1 ${borderLight}`}>Education</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.educations.map((edu) => (
                                              <div key={edu.id} className="text-[11px]">
                                                <div className="flex justify-between font-bold text-slate-900 text-[11px]">
                                                  <span>{edu.degree}</span>
                                                  <span className="text-[9px] text-slate-400 font-medium">{edu.startDate} &mdash; {edu.endDate}</span>
                                                </div>
                                                <p className={`text-[10px] font-semibold ${primaryText}`}>{edu.school}</p>
                                                {edu.gpa && <p className="text-[9px] text-slate-400 mt-0.5">GPA: {edu.gpa}</p>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {resume.projects.length > 0 && isSectionVisible("projects", pageNum) && (
                                        <div className="space-y-2 mt-3">
                                          <h3 className={`text-[10px] font-black uppercase tracking-widest text-slate-900 border-b pb-1 ${borderLight}`}>Projects</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.projects.map((p) => (
                                              <div key={p.id} className="text-[11px]">
                                                <div className="flex justify-between font-bold text-slate-955 text-[10px]">
                                                  <span>{p.name}</span>
                                                  <span className="text-[9px] text-slate-400 font-medium">{p.startDate}</span>
                                                </div>
                                                <p className={`text-[9px] font-bold uppercase ${primaryText}`}>{p.role}</p>
                                                <p className="text-[10px] text-slate-655 mt-0.5 leading-normal">{p.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          )}

                          {/* -------------------- TEMPLATE 3: BOLD CREATIVE (VIBRANT) -------------------- */}
                          {template === "creative" && (
                            <div className="absolute inset-0 grid grid-cols-12 h-full w-full bg-white select-text">
                              {/* Sidebar left: colored background accent column */}
                              <div className={`col-span-4 text-slate-200 pt-[16mm] pb-[16mm] pl-[12mm] pr-[8mm] flex flex-col justify-start h-full ${bgPrimary}`}>
                                {/* Header / Identity - only on Page 1 */}
                                {pageNum === 1 && (
                                  <div className="mb-6">
                                    <h2 className="text-lg font-black text-white tracking-tight uppercase leading-tight">{resume.personalInfo.fullName || "Your Full Name"}</h2>
                                    <p className="text-white/80 font-bold text-[9px] uppercase tracking-widest mt-2">{resume.personalInfo.jobTitle || "Your Target Job Title"}</p>
                                  </div>
                                )}

                                {/* Contact Info Card - only on Page 1 */}
                                {pageNum === 1 && (
                                  <div className="space-y-3 pt-3 border-t border-white/20 text-[10px] mb-6">
                                    <h3 className="font-extrabold uppercase tracking-widest text-white/50 text-[8px] mb-1.5">Contact</h3>
                                    
                                    {resume.personalInfo.email && (
                                      <div className="space-y-0.5">
                                        <span className="text-white/40 font-bold uppercase tracking-tight block text-[8px]">Email</span>
                                        <span className="text-slate-100 break-all text-[9.5px] font-semibold">{resume.personalInfo.email}</span>
                                      </div>
                                    )}
                                    {resume.personalInfo.phone && (
                                      <div className="space-y-0.5">
                                        <span className="text-white/40 font-bold uppercase tracking-tight block text-[8px]">Phone</span>
                                        <span className="text-slate-100 text-[9.5px] font-semibold">{resume.personalInfo.phone}</span>
                                      </div>
                                    )}
                                    {resume.personalInfo.location && (
                                      <div className="space-y-0.5">
                                        <span className="text-white/40 font-bold uppercase tracking-tight block text-[8px]">Address</span>
                                        <span className="text-slate-100 text-[9.5px] font-semibold">{resume.personalInfo.location}</span>
                                      </div>
                                    )}
                                    {(resume.personalInfo.linkedin || resume.personalInfo.website) && (
                                      <div className="space-y-0.5">
                                        <span className="text-white/40 font-bold uppercase tracking-tight block text-[8px]">Web / LinkedIn</span>
                                        <span className="text-white truncate block text-[9.5px] font-bold underline">{resume.personalInfo.linkedin || resume.personalInfo.website}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Skill categories styled as dark chips */}
                                {resume.skills.length > 0 && isSectionVisible("skills", pageNum) && (
                                  <div className={`space-y-3.5 pt-3.5 border-t border-white/20 mb-6 ${pageNum === 1 ? "" : "mt-0"}`}>
                                    <h3 className="font-extrabold uppercase tracking-widest text-white/50 text-[8px] mb-2">Core Competencies</h3>
                                    {resume.skills.map((cat) => (
                                      <div key={cat.id} className="space-y-1.5">
                                        <span className="text-slate-200 font-bold text-[8.5px] uppercase tracking-wider block">{cat.name}</span>
                                        <div className="flex flex-wrap gap-1">
                                          {cat.skills.map((s, si) => (
                                            <span key={si} className="px-1.5 py-0.5 bg-black/25 text-white rounded text-[8px] font-bold uppercase tracking-tight border border-white/5">
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Certifications as simple bullet cards */}
                                {resume.certifications.length > 0 && isSectionVisible("certifications", pageNum) && (
                                  <div className="space-y-3 pt-3 border-t border-white/20 mt-3">
                                    <h3 className="font-extrabold uppercase tracking-widest text-white/60 text-[8px] mb-2">Accreditations</h3>
                                    <div className="space-y-2 text-[9px]">
                                      {resume.certifications.map((cert) => (
                                        <div key={cert.id} className="bg-black/15 p-2 rounded border border-white/5">
                                          <p className="font-bold text-white leading-tight text-[9.5px]">{cert.name}</p>
                                          <p className="text-white/50 text-[8px] mt-0.5 font-medium">{cert.issuer}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Main side right: content columns */}
                              <div className={`col-span-8 pt-[16mm] pb-[16mm] pl-[10mm] pr-[16mm] flex flex-col justify-start h-full ${densitySpacing[spacingDensity].container}`}>
                                {/* Embedded Page Indicator - only on Page 2 */}
                                {pageNum === 2 && (
                                  <div className="text-[9px] text-slate-400 border-b pb-1 mb-2 flex justify-between font-mono print:hidden select-none">
                                    <span>{resume.personalInfo.fullName || "Your Name"} &mdash; Page 2</span>
                                    <span>Multi-Page Document</span>
                                  </div>
                                )}

                                {/* Summary text */}
                                {resume.summary && isSectionVisible("summary", pageNum) && (
                                  <div className="pb-3.5 border-b border-slate-200">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Professional Overview</h3>
                                    <p className="text-[10.5px] text-slate-700 leading-relaxed font-semibold text-justify">{resume.summary}</p>
                                  </div>
                                )}

                                {/* Work History */}
                                {resume.experiences.length > 0 && isSectionVisible("experience", pageNum) && (
                                  <div className="space-y-3">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Work History</h3>
                                    
                                    <div className={densitySpacing[spacingDensity].experience}>
                                      {resume.experiences.map((exp) => (
                                        <div key={exp.id}>
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-900">{exp.position}</h4>
                                              <p className={`text-[10px] font-bold ${primaryText}`}>{exp.company}</p>
                                            </div>
                                            <span className="text-[9px] text-slate-550 uppercase tracking-widest font-black shrink-0">{exp.startDate} &mdash; {exp.current ? "Present" : exp.endDate}</span>
                                          </div>
                                          <ul className="mt-2 space-y-1 list-disc pl-4 text-[10px] text-slate-650 font-medium">
                                            {exp.description.split("\n").map((bullet, idx) => {
                                              const cleanBullet = bullet.replace(/^\s*[-\u2022\u25E6]\s*/, "").trim();
                                              if (!cleanBullet) return null;
                                              return (
                                                <li key={idx} className="leading-relaxed text-justify">
                                                  {cleanBullet}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Education list */}
                                {resume.educations.length > 0 && isSectionVisible("education", pageNum) && (
                                  <div className="space-y-2.5">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Education Background</h3>
                                    <div className={densitySpacing[spacingDensity].itemGap}>
                                      {resume.educations.map((edu) => (
                                        <div key={edu.id} className="text-xs">
                                          <div className="flex justify-between font-bold text-slate-900">
                                            <span className="font-extrabold text-slate-955 text-[11px]">{edu.degree}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{edu.startDate} &mdash; {edu.endDate}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-600 font-semibold">{edu.school} {edu.gpa && <span className="text-slate-400">({edu.gpa})</span>}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Showcase projects */}
                                {resume.projects.length > 0 && isSectionVisible("projects", pageNum) && (
                                  <div className="space-y-2.5">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">Showcase Projects</h3>
                                    <div className={densitySpacing[spacingDensity].itemGap}>
                                      {resume.projects.map((p) => (
                                        <div key={p.id} className="text-[11px]">
                                          <div className="flex justify-between font-extrabold text-slate-955">
                                            <span className="text-slate-900 font-bold text-[11px]">{p.name}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{p.startDate}</span>
                                          </div>
                                          <p className={`text-[9px] font-extrabold uppercase ${primaryText}`}>{p.role}</p>
                                          <p className="text-[10px] text-slate-650 mt-1 leading-normal text-justify font-medium">{p.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              </div>
                            </div>
                          )}

                          {/* -------------------- TEMPLATE 4: ELEGANT EXECUTIVE (PREMIUM) -------------------- */}
                          {template === "executive" && (
                            <div className={densitySpacing[spacingDensity].container}>
                              {/* Top Accent Line - only on Page 1 */}
                              {pageNum === 1 && (
                                <div className={`h-1.5 w-full ${bgPrimary} rounded-t`} />
                              )}
                              
                              {/* Centered Premium Header - only on Page 1 */}
                              {pageNum === 1 && (
                                <div className="text-center pb-4 border-b border-slate-200">
                                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-serif">{resume.personalInfo.fullName || "Your Full Name"}</h1>
                                  <p className={`font-semibold text-xs uppercase tracking-wider mt-1 text-slate-500`}>{resume.personalInfo.jobTitle || "Your Target Job Title"}</p>
                                  
                                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-600 font-medium">
                                    {resume.personalInfo.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className={`w-3 h-3 ${primaryText}`} />
                                        {resume.personalInfo.email}
                                      </span>
                                    )}
                                    {resume.personalInfo.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className={`w-3 h-3 ${primaryText}`} />
                                        {resume.personalInfo.phone}
                                      </span>
                                    )}
                                    {resume.personalInfo.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className={`w-3 h-3 ${primaryText}`} />
                                        {resume.personalInfo.location}
                                      </span>
                                    )}
                                    {resume.personalInfo.website && (
                                      <span className="flex items-center gap-1">
                                        <Globe className={`w-3 h-3 ${primaryText}`} />
                                        {resume.personalInfo.website}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Content Columns: Left (Large), Right (Sidebar) */}
                              {(showLeftT4 || showRightT4) && (
                                <div className={`grid grid-cols-12 mt-4 ${densitySpacing[spacingDensity].gridGap}`}>
                                  
                                  {/* Left: Summary, Experience, Projects */}
                                  {showLeftT4 && (
                                    <div className={`${showRightT4 ? "col-span-8 pr-3 border-r border-slate-100" : "col-span-12"} ${densitySpacing[spacingDensity].sectionGap}`}>
                                      {/* Summary */}
                                      {resume.summary && isSectionVisible("summary", pageNum) && (
                                        <div className="space-y-1.5">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Executive Statement</h3>
                                          <p className="text-[11px] text-slate-750 leading-relaxed text-justify">{resume.summary}</p>
                                        </div>
                                      )}

                                      {/* Experience */}
                                      {resume.experiences.length > 0 && isSectionVisible("experience", pageNum) && (
                                        <div className="space-y-2.5 mt-3">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Professional Practice</h3>
                                          <div className={densitySpacing[spacingDensity].experience}>
                                            {resume.experiences.map((exp) => (
                                              <div key={exp.id} className="space-y-1">
                                                <div className="flex justify-between items-start font-bold text-slate-900 text-xs">
                                                  <span>{exp.position}</span>
                                                  <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">{exp.startDate} &mdash; {exp.current ? "Present" : exp.endDate}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                                                  <span className={primaryText}>{exp.company}</span>
                                                  <span className="italic">{exp.location}</span>
                                                </div>
                                                <p className="text-[10.5px] text-slate-700 leading-relaxed text-justify whitespace-pre-line mt-1">{exp.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Projects */}
                                      {resume.projects.length > 0 && isSectionVisible("projects", pageNum) && (
                                        <div className="space-y-2.5 mt-3">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Selected Initiatives</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.projects.map((proj) => (
                                              <div key={proj.id} className="text-xs">
                                                <div className="flex justify-between font-bold text-slate-900">
                                                  <span>{proj.name}</span>
                                                  <span className="text-[9px] text-slate-400 font-medium shrink-0">{proj.startDate}</span>
                                                </div>
                                                <p className={`text-[9px] font-bold uppercase ${primaryText}`}>{proj.role}</p>
                                                <p className="text-[10px] text-slate-650 mt-1 leading-normal text-justify">{proj.description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Right: Skills, Education, Certs */}
                                  {showRightT4 && (
                                    <div className={`${showLeftT4 ? "col-span-4" : "col-span-12"} ${densitySpacing[spacingDensity].sectionGap}`}>
                                      {/* Technical Skills */}
                                      {resume.skills.length > 0 && isSectionVisible("skills", pageNum) && (
                                        <div className="space-y-2">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Competency Matrix</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.skills.map((cat) => (
                                              <div key={cat.id} className="text-[10.5px]">
                                                <span className="font-extrabold text-slate-900 uppercase text-[9px] block mb-0.5">{cat.name}</span>
                                                <p className="text-slate-600 font-medium leading-tight">{cat.skills.join(", ")}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Education */}
                                      {resume.educations.length > 0 && isSectionVisible("education", pageNum) && (
                                        <div className="space-y-2 mt-3">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Academic Profile</h3>
                                          <div className={densitySpacing[spacingDensity].itemGap}>
                                            {resume.educations.map((edu) => (
                                              <div key={edu.id} className="text-[10.5px]">
                                                <div className="font-bold text-slate-900 leading-tight">{edu.degree}</div>
                                                <div className="text-[9px] text-slate-500 font-semibold">{edu.startDate} &mdash; {edu.endDate}</div>
                                                <div className={`text-[10px] font-bold ${primaryText}`}>{edu.school}</div>
                                                {edu.gpa && <div className="text-[9px] text-slate-400 mt-0.5 font-medium">GPA: {edu.gpa}</div>}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Certifications */}
                                      {resume.certifications.length > 0 && isSectionVisible("certifications", pageNum) && (
                                        <div className="space-y-2 mt-3">
                                          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${primaryText} border-b pb-0.5 border-slate-200`}>Accreditations</h3>
                                          <ul className={`list-disc pl-3 text-[10px] text-slate-755 ${densitySpacing[spacingDensity].itemGap}`}>
                                            {resume.certifications.map((cert) => (
                                              <li key={cert.id} className="leading-tight">
                                                <span className="font-bold text-slate-900">{cert.name}</span>
                                                <span className="text-slate-500 block text-[9px] font-medium">{cert.issuer} {cert.date && `(${cert.date})`}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Custom status overflow label at page bottom, hidden during print */}
                        {((pageNum === 1 && page1Overflow) || (pageNum === 2 && page2Overflow)) && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded text-[8px] font-bold uppercase text-rose-600 print:hidden select-none animate-pulse">
                            ⚠️ Page Overflow
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div 
                  id="cover-letter-preview"
                  className={`relative w-[794px] h-[1123px] max-h-[1123px] min-h-[1123px] bg-white p-[20mm] text-slate-900 border border-slate-300 shadow-lg print:shadow-none print:border-none font-${fontFamily} flex flex-col justify-between resume-page`}
                >
                  <div>
                    {/* Header matching font style */}
                    <div className="flex justify-between items-start border-b pb-4 mb-6 border-slate-200">
                      <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{resume.personalInfo.fullName || "Your Name"}</h1>
                        <p className="text-xs font-semibold text-slate-500">{resume.personalInfo.jobTitle || "Your Title"}</p>
                      </div>
                      <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                        {resume.personalInfo.email && <div>{resume.personalInfo.email}</div>}
                        {resume.personalInfo.phone && <div>{resume.personalInfo.phone}</div>}
                        {resume.personalInfo.location && <div>{resume.personalInfo.location}</div>}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-600 mb-6 font-medium">
                      {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {/* Recipient */}
                    <div className="text-xs text-slate-800 mb-6 space-y-0.5">
                      <div className="font-bold">{coverLetterRecipient || "Hiring Manager"}</div>
                      <div className="font-semibold text-slate-600">{coverLetterCompany || "Target Company"}</div>
                    </div>

                    {/* Subject Line */}
                    {coverLetterSubject && (
                      <div className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wide">
                        RE: {coverLetterSubject}
                      </div>
                    )}

                    {/* Body */}
                    {isGeneratingCoverLetter ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                        <p className="text-sm font-bold text-slate-700">Writing custom cover letter...</p>
                        <p className="text-xs text-slate-500">Gemini is aligning your accomplishments to the job description</p>
                      </div>
                    ) : coverLetterText ? (
                      <textarea
                        value={coverLetterText}
                        onChange={(e) => setCoverLetterText(e.target.value)}
                        className="w-full min-h-[450px] p-0 border-none bg-transparent resize-none text-[11px] text-slate-750 leading-relaxed outline-none font-sans"
                        placeholder="Edit cover letter here..."
                      />
                    ) : (
                      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 flex flex-col items-center">
                        <Sparkles className="w-10 h-10 text-purple-500 mb-3 animate-pulse" />
                        <h4 className="text-xs font-black uppercase text-slate-800">Generate with AI</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                          Enter target details above and use the Job Description pasted in the right sidebar to generate your tailored cover letter.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sign off */}
                  <div className="mt-8 border-t pt-4 text-xs text-slate-500 flex justify-between items-center print:border-none">
                    <div>
                      <p className="font-medium text-slate-700">Sincerely,</p>
                      <p className="font-bold text-slate-900 mt-4">{resume.personalInfo.fullName || "Your Name"}</p>
                    </div>
                    {coverLetterStrengths.length > 0 && (
                      <div className="text-right print:hidden max-w-[200px]">
                        <span className="text-[8px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">Core Pitch Focus</span>
                        <div className="flex flex-wrap gap-1 justify-end mt-1">
                          {coverLetterStrengths.map((str, sIdx) => (
                            <span key={sIdx} className="text-[8px] bg-slate-100 text-slate-600 px-1 rounded font-medium border border-slate-200">
                              {str}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* A4 Page Break Guide (Only visible on screen, hidden on print) */}
                  <div className="absolute left-0 right-0 top-[1123px] border-b-2 border-dashed border-red-300 pointer-events-none print:hidden flex justify-between items-center px-4 z-10 select-none">
                    <span className="text-[9px] bg-red-50 text-red-500 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-100 shadow-xs -mt-2.5">A4 Page 1 End</span>
                    <span className="text-[9px] bg-red-50 text-red-500 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-red-100 shadow-xs -mt-2.5">A4 Page 2 Start</span>
                  </div>

                </div>
              )}
            </div>
          </div>
        </section>

        {/* SIDEBAR RIGHT: ATS Analyzer & AI Copilot panel */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 print:hidden overflow-hidden">
          
          {/* Section 1: Interactive ATS Scanner */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">ATS Match Calculator</h3>
            </div>

            <p className="text-[10px] text-slate-500 mb-3 font-medium">Paste the target Job Description to analyze match compatibility instantly.</p>
            
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Seeking a Senior Engineer with proficiency in Next.js, React, Docker, and AWS..."
              className="w-full p-2 bg-white border border-slate-200 rounded text-[11px] outline-none focus:border-blue-500 placeholder-slate-400 mb-2 resize-none"
            />

            <button 
              onClick={analyzeAtsFit}
              disabled={isAnalyzingAts}
              className={`w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer`}
            >
              {isAnalyzingAts ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Running parser...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze ATS Score
                </>
              )}
            </button>

            {atsError && (
              <p className="text-[10px] text-rose-600 mt-1 bg-rose-50 p-1.5 rounded font-medium border border-rose-100 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {atsError}
              </p>
            )}
          </div>

          {/* ATS Analysis Score Visualizer Block */}
          {atsResult && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-4">
                {/* Circular chart */}
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke={atsResult.score >= 80 ? "#10b981" : atsResult.score >= 60 ? "#f59e0b" : "#f43f5e"} 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="176" 
                      strokeDashoffset={176 - (176 * atsResult.score) / 100}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-black text-slate-800 leading-none">{atsResult.score}</span>
                    <span className="text-[7px] font-extrabold uppercase text-slate-400 tracking-tight">/100</span>
                  </div>
                </div>

                {/* Feedback info */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400">Match Level:</span>
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                      atsResult.matchLevel === "Excellent" ? "bg-emerald-100 text-emerald-800" :
                      atsResult.matchLevel === "Good" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {atsResult.matchLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-snug">
                    {atsResult.score >= 80 
                      ? "Highly compatible for this target role. Excellent keyword alignment!" 
                      : "Consider injecting some missing key skills to improve alignment."}
                  </p>
                </div>
              </div>

              {/* Matched / Missing Keywords Chips */}
              <div className="mt-3.5 space-y-2.5 border-t border-slate-100 pt-3">
                
                {atsResult.missingKeywords.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Gap Keywords ({atsResult.missingKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {atsResult.missingKeywords.map((tag, i) => (
                        <button 
                          key={i}
                          onClick={() => addSkillTagDirectly("Technical Skills", tag)}
                          className="px-1.5 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                          title="Click to automatically add to technical skills"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.matchedKeywords.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Matched Keywords ({atsResult.matchedKeywords.length})
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {atsResult.matchedKeywords.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Section 2: Real-time AI Suggestions list */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            <div className="p-4 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">AI Resume Copilot</h3>
              </div>
              
              <button 
                onClick={regenerateSuggestions}
                disabled={isGeneratingSuggestions}
                className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer transition-colors"
                title="Force refresh suggestions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSuggestions ? "animate-spin text-purple-600" : ""}`} />
              </button>
            </div>

            {/* Suggestions cards wrapper */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              
              {isGeneratingSuggestions && suggestions.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-500">AI is reviewing your content...</p>
                  <p className="text-[10px] text-slate-400">Comparing your data structures with high-scoring resumes</p>
                </div>
              ) : (
                <>
                  {suggestions.map((sug) => (
                    <div key={sug.id} className="p-3 bg-purple-50/70 border border-purple-100 rounded-lg hover:border-purple-200 hover:shadow-2xs transition-all space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {sug.section} suggestion
                        </span>
                        
                        <span className={`text-[8px] font-black uppercase px-1 rounded ${
                          sug.impactLevel === "high" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {sug.impactLevel} impact
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Before</p>
                        <p className="text-[11px] text-slate-600 italic line-through leading-tight">
                          "{sug.originalText}"
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">After (AI optimized)</p>
                        <p className="text-[11px] text-purple-950 font-medium leading-relaxed bg-white/70 p-1.5 rounded border border-purple-100/50">
                          {sug.suggestedText}
                        </p>
                      </div>

                      <div className="text-[10px] text-slate-500 font-semibold leading-snug">
                        💡 <b>Why:</b> {sug.reason}
                      </div>

                      <button 
                        onClick={() => applySuggestion(sug)}
                        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold uppercase cursor-pointer tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply Recommendation
                      </button>
                    </div>
                  ))}

                  {suggestions.length === 0 && (
                    <div className="p-4 border border-dashed border-slate-200 rounded-lg text-center bg-white">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">Perfect Profile!</p>
                      <p className="text-[10px] text-slate-500 mt-1">No pending immediate AI recommendations. Change some fields to run new comparisons.</p>
                    </div>
                  )}
                </>
              )}

            </div>

          </div>

        </aside>

      </main>

      {/* FOOTER: System stats bar and Professional Legal Navigation */}
      <footer className="bg-slate-950 text-slate-400 flex flex-col shrink-0 divide-y divide-slate-800 print:hidden">
        {/* Top layer: AdSense compliance and Professional utility links */}
        <div className="py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="font-extrabold tracking-tight uppercase font-serif text-white text-xs">Resume Builder</span>
            <span className="text-[9px] text-purple-400 font-black bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-900/40">AI-POWERED</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button 
              onClick={() => { setActiveLegalTab("about"); triggerToast("Viewing About Us page", "info"); }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              About Us
            </button>
            <span className="text-slate-800 hidden sm:inline">|</span>
            <button 
              onClick={() => { setActiveLegalTab("contact"); triggerToast("Opening Contact form", "info"); }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              Contact Us
            </button>
            <span className="text-slate-800 hidden sm:inline">|</span>
            <button 
              onClick={() => { setActiveLegalTab("privacy"); triggerToast("Viewing Privacy Policy", "info"); }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              Privacy Policy
            </button>
            <span className="text-slate-800 hidden sm:inline">|</span>
            <button 
              onClick={() => { setActiveLegalTab("terms"); triggerToast("Viewing Terms & Conditions", "info"); }}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              Terms & Conditions
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold">
            &copy; {new Date().getFullYear()} ResumeBuilder AI. All rights reserved.
          </div>
        </div>

        {/* Bottom layer: System status bar */}
        <div className="h-8 flex items-center justify-between px-6 text-[10px] bg-slate-900/85">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> 
              Editor Connected
            </span>
            <span className="text-slate-500">•</span>
            <span>Active File: <b>alex_rivera_resume.pdf</b></span>
          </div>
          <div className="italic text-slate-500 font-semibold tracking-wide hidden md:block">
            Tip: Tailor work experiences with key job description terms to achieve 85+ ATS compatibility scores.
          </div>
        </div>
      </footer>


      {/* --- MODAL: INFO & LEGAL CENTER (About, Contact, Privacy, Terms) --- */}
      {activeLegalTab !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full flex flex-col md:flex-row overflow-hidden h-[85vh] md:h-[75vh]">
            
            {/* Sidebar with Tabs */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-5 justify-between shrink-0">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-900">
                    <span className="font-extrabold tracking-tight uppercase font-serif text-sm">Resume Builder</span>
                    <span className="text-[8px] text-purple-700 font-black bg-purple-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Legal</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Trust, Privacy & Direct Support</p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setActiveLegalTab("about")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                      activeLegalTab === "about" 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    About Our Platform
                  </button>
                  <button
                    onClick={() => setActiveLegalTab("contact")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                      activeLegalTab === "contact" 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    Contact Support
                  </button>
                  <button
                    onClick={() => setActiveLegalTab("privacy")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                      activeLegalTab === "privacy" 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Award className="w-4 h-4 shrink-0" />
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => setActiveLegalTab("terms")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                      activeLegalTab === "terms" 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    Terms of Service
                  </button>
                </div>
              </div>

              <div className="hidden md:block pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                <p>Support: sampathkumbar04@gmail.com</p>
                <p className="mt-1">&copy; {new Date().getFullYear()} ResumeBuilder AI</p>
              </div>
            </div>

            {/* Content pane */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {activeLegalTab === "about" && "About Us & Platform Mission"}
                  {activeLegalTab === "contact" && "Get In Touch / Customer Support"}
                  {activeLegalTab === "privacy" && "Privacy Policy & GDPR Compliance"}
                  {activeLegalTab === "terms" && "Terms & Conditions of Service"}
                </h3>
                <button
                  onClick={() => setActiveLegalTab(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* 1. ABOUT US CONTENT */}
                {activeLegalTab === "about" && (
                  <div className="space-y-4 text-xs text-slate-750 leading-relaxed font-sans">
                    <p className="text-sm font-bold text-slate-900">
                      Welcome to Resume Builder - AI-Powered Resume Optimizer
                    </p>
                    <p>
                      At <b>ResumeBuilder AI</b>, we are committed to leveling the professional playing field for job seekers worldwide. By blending modern visual designs with state-of-the-art Natural Language Processing (NLP) models powered by Google Gemini, our tool acts as a dedicated companion to refine and tailor resumes.
                    </p>
                    <p>
                      Traditional recruitment relies heavily on applicant tracking systems (ATS) that parse, screen, and rank resumes before human eyes ever view them. Unfortunately, highly qualified candidates are frequently filtered out due to simple formatting or terminology mismatches.
                    </p>
                    
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2">Our Key Innovations</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <b>Live ATS Compatibility Scoring:</b> Paste any job description to instantly analyze alignment match level, receive key skill gap recommendations, and track improvement scores in real-time.
                      </li>
                      <li>
                        <b>AI Bullet Optimization:</b> Effortlessly align professional bullets with target job keywords. Our AI provides clear contextual feedback explaining the edits made.
                      </li>
                      <li>
                        <b>Premium Executive Templates:</b> Select from curated, field-tested styling configurations that optimize whitespace and maximize layout symmetry (Classic Professional, Modern Minimalist, Bold Creative, Elegant Executive).
                      </li>
                      <li>
                        <b>Security First & Ad-Supported:</b> Your resume content is never sold or used for model training. We leverage Google AdSense and optional premium micro-services to keep high-tier career utilities free for everyone.
                      </li>
                    </ul>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2">Our Mission</h4>
                    <p>
                      We believe every professional deserves an equal opportunity to showcase their true strengths. Our goal is to replace complex, expensive resume consulting with intuitive, precise, and transparent AI engineering. Thank you for letting us be a part of your career success!
                    </p>
                  </div>
                )}

                {/* 2. CONTACT US CONTENT */}
                {activeLegalTab === "contact" && (
                  <div className="space-y-4">
                    <div className="text-xs text-slate-750 space-y-1.5">
                      <p className="font-bold text-slate-900">Have feedback or need assistance?</p>
                      <p>
                        We love hearing from our community! Whether you have encountered an issue, have ideas for new layout engines, or are interested in partnership opportunities, send us a message below.
                      </p>
                      <p>
                        Our support team typically responds to all inquiries within <b>24 to 48 hours</b>.
                      </p>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name *</label>
                          <input 
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Alex Rivera"
                            className="w-full p-2 text-xs bg-white border border-slate-200 rounded focus:border-slate-800 outline-none font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address *</label>
                          <input 
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="alex.rivera@example.com"
                            className="w-full p-2 text-xs bg-white border border-slate-200 rounded focus:border-slate-800 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                        <input 
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          placeholder="Feedback on Executive Template"
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded focus:border-slate-800 outline-none font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Message *</label>
                        <textarea 
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Your message details..."
                          className="w-full p-2 text-xs bg-white border border-slate-200 rounded focus:border-slate-800 outline-none font-medium resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isSubmittingContact ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Sending Message...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. PRIVACY POLICY CONTENT */}
                {activeLegalTab === "privacy" && (
                  <div className="space-y-4 text-xs text-slate-750 leading-relaxed font-sans text-justify">
                    <p className="font-bold text-slate-900">Last Updated: July 3, 2026</p>
                    <p>
                      At ResumeBuilder AI, accessible from our application environment, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by ResumeBuilder AI and how we use it.
                    </p>
                    <p>
                      If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <b>sampathkumbar04@gmail.com</b>.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">1. Information We Collect</h4>
                    <p>
                      All resume text data entered into the editor (personal info, experiences, projects, skills, education) is processed locally on your device within your active browser state. When you trigger AI operations (such as bullet tailoring, summary generation, or ATS compatibility scoring), the corresponding text content is securely transmitted to our backend API proxies to communicate with official Google Gemini model nodes.
                    </p>
                    <p>
                      <b>We do not store, compile, or sell your personal resume data, nor do we use it for training any machine learning models.</b>
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">2. Cookies and Log Files</h4>
                    <p>
                      ResumeBuilder AI follows a standard procedure of using log files. These files log visitors when they visit web applications. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the application, and tracking users' movement.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">3. Google DoubleClick DART Cookie & Third-Party Advertising</h4>
                    <p>
                      Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our platform and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://policies.google.com/technologies/ads</a>.
                    </p>
                    <p>
                      Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on ResumeBuilder AI, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                    </p>
                    <p>
                      Note that ResumeBuilder AI has no access to or control over these cookies that are used by third-party advertisers.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">4. GDPR & CCPA Data Protection Rights</h4>
                    <p>
                      We want to ensure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><b>The right to access:</b> You can request copies of any metadata recorded during your session.</li>
                      <li><b>The right to rectification:</b> You have the right to request correction of any inaccurate information.</li>
                      <li><b>The right to erasure:</b> You can request that we erase your session data (which can also be done instantly by clearing your browser's local cache).</li>
                      <li><b>The right to restrict or object to processing:</b> You have the right to object to how we handle API proxy connections.</li>
                    </ul>
                  </div>
                )}

                {/* 4. TERMS & CONDITIONS CONTENT */}
                {activeLegalTab === "terms" && (
                  <div className="space-y-4 text-xs text-slate-750 leading-relaxed font-sans text-justify">
                    <p className="font-bold text-slate-900">Effective Date: July 3, 2026</p>
                    <p>
                      Welcome to ResumeBuilder AI! These terms and conditions outline the rules and regulations for the use of ResumeBuilder AI's web application.
                    </p>
                    <p>
                      By accessing this web application, we assume you accept these terms and conditions. Do not continue to use ResumeBuilder AI if you do not agree to take all of the terms and conditions stated on this page.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">1. License & Permitted Use</h4>
                    <p>
                      Unless otherwise stated, ResumeBuilder AI owns the intellectual property rights for all material on ResumeBuilder AI. All intellectual property rights are reserved. You may access this from ResumeBuilder AI for your personal use subject to restrictions set in these terms and conditions.
                    </p>
                    <p>You must not:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Republish material from ResumeBuilder AI</li>
                      <li>Sell, rent, or sub-license material from ResumeBuilder AI</li>
                      <li>Reproduce, duplicate, or copy code frameworks from ResumeBuilder AI</li>
                      <li>Redistribute core software assets or backend API architectures</li>
                    </ul>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">2. Disclaimer of AI Output</h4>
                    <p>
                      The resume improvements, ATS compatibility analysis, tailored work history bullets, and generated cover letters are drafted using automated algorithms and Artificial Intelligence services. 
                      <b> ResumeBuilder AI does not guarantee employment, salary levels, recruiter callbacks, or total accuracy of the generated professional copy.</b>
                    </p>
                    <p>
                      Users are solely responsible for verifying the facts, dates, positions, and truthfulness of the contents in their final resume documents before sharing with third-party hiring managers or employers.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">3. Limitation of Liability</h4>
                    <p>
                      In no event shall ResumeBuilder AI, nor any of its officers, directors, or employees, be held liable for anything arising out of or in any way connected with your use of this web application, whether such liability is under contract. ResumeBuilder AI shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this platform.
                    </p>

                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide pt-2 border-b pb-0.5 border-slate-100">4. Governing Law</h4>
                    <p>
                      These Terms will be governed by and interpreted in accordance with the laws of our operating jurisdiction, and you submit to the non-exclusive jurisdiction of the state and federal courts for the resolution of any disputes.
                    </p>
                  </div>
                )}

              </div>

              {/* Footer row inside modal for mobile */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold md:hidden">
                <p>sampathkumbar04@gmail.com</p>
                <p>&copy; {new Date().getFullYear()} ResumeBuilder AI</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 1: AI EXECUTIVE SUMMARY GENERATOR --- */}
      {showSummaryGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">AI Executive Summary Generator</h3>
              </div>
              <button 
                onClick={() => setShowSummaryGeneratorModal(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Focus Niche / Sector</label>
                  <input 
                    type="text" 
                    value={summaryIndustry}
                    onChange={(e) => setSummaryIndustry(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded text-xs outline-none"
                    placeholder="e.g. Fintech, SaaS, HealthCare"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Years of Experience</label>
                  <select 
                    value={summaryYears}
                    onChange={(e) => setSummaryYears(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded text-xs outline-none"
                  >
                    <option value="1">1-2 Years (Junior)</option>
                    <option value="3">3-4 Years (Mid)</option>
                    <option value="5">5-8 Years (Senior)</option>
                    <option value="10">10+ Years (Principal / Lead)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={generateSummaryOptions}
                disabled={isGeneratingSummary}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isGeneratingSummary ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating tailored summaries...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Professional Profiles
                  </>
                )}
              </button>

              {/* Variation cards */}
              {generatedSummaries.length > 0 && (
                <div className="space-y-3.5 border-t border-slate-100 pt-3.5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select your favorite variation</h4>
                  
                  {generatedSummaries.map((varItem, i) => (
                    <div key={i} className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-2 hover:bg-purple-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-purple-700">{varItem.type}</span>
                        <button 
                          onClick={() => applyGeneratedSummary(varItem.text)}
                          className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-800 text-[10px] font-bold uppercase rounded border border-purple-200 hover:border-purple-300 shadow-2xs cursor-pointer"
                        >
                          Use this summary
                        </button>
                      </div>
                      <p className="text-xs text-slate-750 leading-relaxed italic">
                        "{varItem.text}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* --- MODAL 2: AI EXPERIENCES BULLET TAILOR --- */}
      {showTailorBulletsModal && tailorActiveExpId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">AI Experience Bullet Points Tailor</h3>
                  <p className="text-[10px] text-slate-400 -mt-0.5">Optimize job description keywords and technical alignment</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTailorBulletsModal(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Active Position</p>
                <p className="text-xs font-extrabold text-slate-800">
                  {resume.experiences.find(e => e.id === tailorActiveExpId)?.position} at {resume.experiences.find(e => e.id === tailorActiveExpId)?.company}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5">
                <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                  Ensure you pasted the target Job Description into the right sidebar to allow the AI to align your bullet achievements effectively.
                </p>
              </div>

              <button 
                onClick={tailorExperienceBullets}
                disabled={isTailoringBullets}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isTailoringBullets ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing and tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Tailor Bullets with AI
                  </>
                )}
              </button>

              {/* Tailored bullets output */}
              {tailoredBulletsResult && (
                <div className="space-y-3.5 border-t border-slate-100 pt-3.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">Optimized Bullet Points</h4>
                    
                    <button 
                      onClick={applyTailoredBullets}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded shadow-sm hover:shadow-md cursor-pointer transition-all"
                    >
                      Apply optimized bullets
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                    {tailoredBulletsResult.bullets.map((bullet, idx) => (
                      <p key={idx} className="text-xs text-slate-750 font-mono text-justify leading-relaxed">
                        {bullet}
                      </p>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 bg-purple-50 p-2.5 rounded border border-purple-100 leading-snug">
                    ℹ️ <b>Changes summary:</b> {tailoredBulletsResult.explanation}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
