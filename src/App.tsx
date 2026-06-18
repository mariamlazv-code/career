import React, { useState, useEffect } from "react";
import {
  Search,
  BookOpen,
  Briefcase,
  TrendingUp,
  Brain,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  ExternalLink,
  Code,
  GraduationCap,
  Percent,
  CheckCircle2,
  FolderDot,
  MousePointerClick,
  Copy,
  Check,
  Zap,
  BookMarked
} from "lucide-react";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import { SAMPLE_SYLLABUSES, SAMPLE_CVS } from "./components/sampleData";
import { AnalysisData, Vacancy, Milestone, GroundingSource } from "./types";

export default function App() {
  // Input states
  const [syllabusInput, setSyllabusInput] = useState("");
  const [cvInput, setCvInput] = useState("");
  const [customPreferences, setCustomPreferences] = useState("");
  const [syllabusFile, setSyllabusFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);
  const [cvFile, setCvFile] = useState<{ name: string; mimeType: string; data: string } | null>(null);

  // File to base64 helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "syllabus" | "cv") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      if (type === "syllabus") {
        setSyllabusFile({
          name: file.name,
          mimeType: file.type,
          data: base64Data
        });
        setSyllabusInput(""); // clear text input as we have the file
      } else {
        setCvFile({
          name: file.name,
          mimeType: file.type,
          data: base64Data
        });
        setCvInput(""); // clear text input as we have the file
      }
    };
    reader.readAsDataURL(file);
  };

  // Search/Analysis results state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [copiedReport, setCopiedReport] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"analysis" | "portfolio" | "roadmap" | "chat">("analysis");

  // 1. Portfolio State
  const [portfolio, setPortfolio] = useState({
    fullName: "გიორგი ბერიძე",
    title: "კომპიუტერული მეცნიერებების მე-3 კურსის სტუდენტი",
    about: "მოტივირებული სტუდენტი, რომელიც ორიენტირებულია ვებ-ტექნოლოგიების შესწავლასა და პრაქტიკული პროექტების შექმნაზე. ვეძებ საწყისი დონის პოზიციას ან ანაზღაურებად სტაჟირებას.",
    skills: [
      { name: "React.js", level: 80 },
      { name: "CSS3 / Tailwind", level: 90 },
      { name: "JavaScript ES6+", level: 85 },
      { name: "Node.js Basics", level: 50 },
      { name: "PostgreSQL საბაზისო", level: 60 }
    ],
    projects: [
      {
        id: "proj-1",
        title: "Todo App with LocalStorage",
        description: "React კომპონენტებზე აგებული დავალებების ორგანიზატორი, რომელიც ინახავს მონაცემებს ლოკალურად.",
        tech: "React, CSS modules",
        link: "https://github.com/example/todo"
      },
      {
        id: "proj-2",
        title: "ამინდის საპროგნოზო პორტალი",
        description: "OpenWeather API-სთან ინტეგრირებული ვებ-აპლიკაცია რეალურ დროში ტემპერატურის საჩვენებლად.",
        tech: "React, REST API",
        link: "https://github.com/example/weather"
      }
    ],
    achievements: [
      { id: "ach-1", title: "TSU Hackathon - მე-3 საპრიზო ადგილი (Smart City მიმართულება)" },
      { id: "ach-2", title: "EPAM Front-End-ის მოსამზადებელი ონლაინ კურსის სერტიფიკატი" }
    ]
  });

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(70);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjLink, setNewProjLink] = useState("");
  const [newAchTitle, setNewAchTitle] = useState("");

  // 2. Interactive Skill Roadmap State (Gaps & Action Items)
  const [roadmapItems, setRoadmapItems] = useState([
    {
      id: "road-1",
      skillName: "Node.js & Express framework",
      status: "in-progress", // "not-started" | "in-progress" | "completed"
      confidence: 45,
      resourceType: "ონლაინ კურსი",
      resourceName: "The Complete Node.js Developer Course - Udemy",
      estimatedHours: "20 საათი",
      practicalProject: "შექმენი REST API ნოუთების შესანახად Express-ზე"
    },
    {
      id: "road-2",
      skillName: "JWT ავტორიზაცია და ვებ-უსაფრთხოება",
      status: "not-started",
      confidence: 15,
      resourceType: "ვორქშოპი & ვიდეო",
      resourceName: "Web Security Fundamentals - FreeCodeCamp",
      estimatedHours: "8 საათი",
      practicalProject: "მოახდინე მარტივი რეგისტრაციის და JWT ავტორიზაციის სიმულაცია"
    },
    {
      id: "road-3",
      skillName: "PostgreSQL - რელაციური მონაცემთა ბაზები",
      status: "in-progress",
      confidence: 60,
      resourceType: "პრაქტიკული სავარჯიშო",
      resourceName: "SQL Bolt Interactive Exercises",
      estimatedHours: "12 საათი",
      practicalProject: "დააპროექტე მაღაზიის ბაზა (მომხმარებლები, შეკვეთები, პროდუქტები)"
    },
    {
      id: "road-4",
      skillName: "Git & GitHub - გუნდური მუშაობა",
      status: "completed",
      confidence: 90,
      resourceType: "დოკუმენტაცია",
      resourceName: "GitHub Desktop & Git Branching Guide",
      estimatedHours: "4 საათი",
      practicalProject: "შექმენი ახალი რეპოზიტორი და გააკეთე Pull Request-ები მეგობართან"
    }
  ]);

  const [newRoadItemSkill, setNewRoadItemSkill] = useState("");
  const [newRoadItemResource, setNewRoadItemResource] = useState("");
  const [newRoadItemProj, setNewRoadItemProj] = useState("");

  // Default preloaded analysis state for instant awesome presentation
  useEffect(() => {
    // Generate an initial nice grounded report mock matching Georgia
    const initialReportMarkdown = `### 🚀 კარიერული ანალიზის შედეგები: გიორგი ბერიძე

სემანტიკური ანალიზის საფუძველზე, თქვენს CV-ში გამოკვეთილია მყარი საბაზისო ცოდნა **React.js, HTML5/CSS3 და JavaScript** მიმართულებით. ვინაიდან სწავლობთ კომპიუტერული მეცნიერებების მე-3 კურსზე, თქვენი აკადემიური მომზადება გაძლევთ კარგ თეორიულ ბაზისს. 

შემდეგი 3 აქტიური ვაკანსია საუკეთესოდ ერგება თქვენს უნარებს თბილისში:

#### 1. Front-End Web Developer (Junior) — Webz.ge და Jobs.ge
* **დამსაქმებელი:** Webz დეველოპმენტ სტუდია
* **თავსებადობა:** **85%** (თქვენი React და Tailwind-ის უნარები იდეალურია ამ როლისთვის).
* **კომპეტენციური ნაპრალი:** კომპანია ითხოვს Typescript-ის საბაზისო ცოდნას და REST API ინტეგრირებას, რაც თქვენს მცირე პორტფოლიოში ნაკლებად ჩანს.

#### 2. Full-Stack დეველოპერი (სტაჟირება) — HR.ge & GITA
* **დამსაქმებელი:** ტექნოლოგიების განვითარების სააგენტო
* **თავსებადობა:** **70%**
* **კომპეტენციური ნაპრალი:** Node.js და მონაცემთა ბაზების (PostgreSQL) პრაქტიკული ცოდნა, რომელიც სილაბუსში გაქვთ, მაგრამ რეზიუმეში ჯერ არ ასახულა.

#### 3. Junior React დეველოპერი — Redberry Agency
* **დამსაქმებელი:** რედბერი (თბილისი)
* **თავსებადობა:** **80%**
* **კომპეტენციური ნაპრალი:** Git-ის უფრო ღრმა მართვა, გუნდური Workflow და Figma მასალებთან მუშაობა.`;

    setAnalysisResult({
      profileSummary: "სტუდენტს გააჩნია ძალიან ძლიერი საწყისი ბაზისი Front-End მიმართულებით (React.js, JavaScript, Tailwind). აკადემიური სილაბუსიდან ჩანს Node.js და PostgreSQL მიმართულების თეორიული ცოდნა, რაც სრულფასოვან full-stack პოტენციალზე მიუთითებს.",
      keyStrengths: ["React.js & State Management", "Tailwind CSS", "JavaScript ES6+", "SQL საბაზისო", "Git ვერსიების კონტროლი"],
      vacancies: [
        {
          title: "Junior Front-End Developer (React)",
          company: "Redberry Agency (თბილისი)",
          compatPercent: 85,
          rationale: "თქვენი React.js და Tailwind-ის პორტფოლიო პროექტები თითქმის სრულად ფარავს მათ მოთხოვნებს. აკადემიური სილაბუსებიდან ნასწავლი Git Workflow-იც გამოგადგებათ გუნდურ მუშაობაში.",
          additionalSkillsRequired: ["TypeScript საფუძვლები", "Figma integration / Flex layouts", "State slice (Redux / Zustand)"],
          url: "https://www.jobs.ge/ge/vacancy/64291"
        },
        {
          title: "Junior Full-Stack Web Developer",
          company: "NextBrand Studio",
          compatPercent: 75,
          rationale: "სილაბუსში ნასწავლი Node.js & PostgreSQL გაძლევთ ამ ვაკანსიაზე განაცხადის შეტანის უფლებას, თუმცა პორტფოლიოში უნდა ჩაამატოთ მინიმუმ 1 Node Backend პროექტი.",
          additionalSkillsRequired: ["REST API დოკუმენტირება", "Express Middleware", "PostgreSQL Joins და Node კავშირი"],
          url: "https://www.hr.ge/announcement/123049"
        },
        {
          title: "ვებ-ტექნოლოგიების სტაჟიორი",
          company: "საქართველოს ბანკი (BOG)",
          compatPercent: 90,
          rationale: "სტაჟირება განკუთვნილია მე-3 და მე-4 კურსის სტუდენტებისთვის, რომელთაც იციან React და JavaScript საფუძვლები. თავსებადობა მაღალია.",
          additionalSkillsRequired: ["პრობლემების გადაჭრის უნარები", "REST API-სთან მუშაობა"],
          url: "https://www.jobs.ge/ge/?page=1&q=react"
        }
      ],
      strategicDecomposition: [
        {
          stage: "ეტაპი 1: Front-End Portfolio-ს გაძლიერება",
          focus: "TypeScript-ისა და Figma UI-ის ინტეგრაცია პროექტებში",
          actionPlan: "გადაიყვანე არსებული Weather App TypeScript-ზე და განათავსე GitHub პორტფოლიოში."
        },
        {
          stage: "ეტაპი 2: Full-Stack ბაზისის ასახვა რეზიუმეში",
          focus: "Node.js Express-თან მუშაობა",
          actionPlan: "აკადემიურ სილაბუსში ნასწავლი SQL PostgreSQL-ის გამოყენებით ააწყვე მარტივი API და მიაბი React-ს."
        },
        {
          stage: "ეტაპი 3: რეკომენდებული ვაკანსიების აპლიკაცია",
          focus: "CV-სა და პორტფოლიოს გაგზავნა და Cover Letter",
          actionPlan: "მიმართე Redberry Agency-სა და NextBrand-ს. დაურთე სამოტივაციო წერილი, სადაც ხაზს გაუსვამ უნივერსიტეტში ნასწავლ საგნებს."
        }
      ],
      fullReportMarkdown: initialReportMarkdown
    });

    setSources([
      { title: "Jobs.ge - Front-End ვაკანსიები თბილისში", uri: "https://www.jobs.ge/ge/?page=1&q=react" },
      { title: "HR.ge - სტაჟირებები თბილისში", uri: "https://www.hr.ge/announcements/internships" }
    ]);
  }, []);

  // Quick loaders for sample data
  const loadSamplePair = (syllabusId: string, cvId: string) => {
    setSyllabusFile(null);
    setCvFile(null);
    const selectedSyllabus = SAMPLE_SYLLABUSES.find(s => s.id === syllabusId);
    const selectedCv = SAMPLE_CVS.find(c => c.id === cvId);

    if (selectedSyllabus) setSyllabusInput(selectedSyllabus.text);
    if (selectedCv) {
      setCvInput(selectedCv.text);
      // Synchronize portfolio state visually with the selected CV
      if (cvId === "junior-dev") {
        setPortfolio(prev => ({
          ...prev,
          fullName: "გიორგი ბერიძე",
          title: "კომპიუტერული მეცნიერებების მე-3 კურსის სტუდენტი",
          about: "მოტივირებული სტუდენტი, რომელიც ორიენტირებულია ვებ-ტექნოლოგიების შესწავლასა და პრაქტიკული პროექტების შექმნაზე. ვეძებ საწყისი დონის პოზიციას ან ანაზღაურებად სტაჟირებას.",
          skills: [
            { name: "React.js", level: 80 },
            { name: "CSS3 / Tailwind", level: 90 },
            { name: "JavaScript ES6+", level: 85 },
            { name: "Node.js Basics", level: 50 },
            { name: "PostgreSQL საბაზისო", level: 60 }
          ]
        }));
      } else {
        setPortfolio(prev => ({
          ...prev,
          fullName: "მარიამ მამულაშვილი",
          title: "ბიზნესის ადმინისტრირებისა და ტექნოლოგიების მენეჯმენტი",
          about: "ილიას სახელმწიფო უნივერსიტეტის მე-4 კურსის სტუდენტი. მაინტერესებს მონაცემთა ანალიტიკა, ბიზნესის ანალიზი და პროდუქტის მენეჯმენტის მიმართულებები.",
          skills: [
            { name: "MS Excel Advanced", level: 95 },
            { name: "Python Basics & Pandas", level: 65 },
            { name: "SQL Basics", level: 50 },
            { name: "Business Process Modeling", level: 70 }
          ]
        }));
      }
    }
  };

  // Perform Analysis backend API call (with Google Search Grounding)
  const handleAnalyzeAndSearch = async () => {
    if (!syllabusInput.trim() && !cvInput.trim() && !syllabusFile && !cvFile) {
      setErrorMsg("გთხოვთ, შეავსოთ სილაბუსის ტექსტი/CV ან ატვირთოთ შესაბამისი PDF ფაილი ანალიზის დასაწყებად.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/analyze-and-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabusText: syllabusInput,
          cvText: cvInput,
          syllabusFile: syllabusFile,
          cvFile: cvFile,
          customPreferences: customPreferences
        })
      });

      if (!response.ok) {
        throw new Error("სერვერზე მოხდა შეცდომა მონაცემების დამუშავებისას.");
      }

      const resData = await response.json();
      if (resData.success) {
        setAnalysisResult(resData.data);
        setSources(resData.sources || []);

        // Dynamically add gaps to interactive roadmap from the fetched vacancies
        const uniqueRequiredSkills: string[] = [];
        resData.data.vacancies.forEach((v: Vacancy) => {
          v.additionalSkillsRequired.forEach(skill => {
            if (!uniqueRequiredSkills.includes(skill)) {
              uniqueRequiredSkills.push(skill);
            }
          });
        });

        if (uniqueRequiredSkills.length > 0) {
          const generatedItems = uniqueRequiredSkills.slice(0, 4).map((skill, idx) => ({
            id: `road-auto-${Date.now()}-${idx}`,
            skillName: skill,
            status: "not-started",
            confidence: 10,
            resourceType: "რეკომენდებული რესურსი",
            resourceName: `მოძიებული სტატიები და კურსები ${skill}-ზე`,
            estimatedHours: "10-15 საათი",
            practicalProject: `შექმენი მცირე პროექტი სადაც გამოიყენებ ${skill}-ს`
          }));
          setRoadmapItems(generatedItems);
        }

        // Auto move to analysis tab to show the results
        setActiveTab("analysis");
      } else {
        throw new Error(resData.error || "ანალიზის შესრულება ვერ მოხერხდა.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "კავშირი სერვერთან ვერ დამყარდა. დარწმუნდით, რომ სერვერი ჩართულია.");
    } finally {
      setLoading(false);
    }
  };

  const copyReportToClipboard = () => {
    if (analysisResult?.fullReportMarkdown) {
      navigator.clipboard.writeText(analysisResult.fullReportMarkdown);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    }
  };

  // Add Project to Portfolio
  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;

    setPortfolio(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `proj-${Date.now()}`,
          title: newProjTitle,
          description: newProjDesc,
          tech: newProjTech || "განსაზღვრული არ არის",
          link: newProjLink || "#"
        }
      ]
    }));

    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjTech("");
    setNewProjLink("");
  };

  // Remove Project from Portfolio
  const removeProject = (id: string) => {
    setPortfolio(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  // Add Achievement
  const addAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchTitle.trim()) return;

    setPortfolio(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { id: `ach-${Date.now()}`, title: newAchTitle }
      ]
    }));
    setNewAchTitle("");
  };

  // Remove Achievement
  const removeAchievement = (id: string) => {
    setPortfolio(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  // Add Skill to Portfolio
  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setPortfolio(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        { name: newSkillName, level: newSkillLevel }
      ]
    }));
    setNewSkillName("");
    setNewSkillLevel(70);
  };

  // Remove Skill from Portfolio
  const removeSkill = (name: string) => {
    setPortfolio(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== name)
    }));
  };

  // 3. Interactive Skill Roadmap Handlers
  const transitionRoadmapStatus = (itemId: string, newStatus: string) => {
    setRoadmapItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status: newStatus,
              confidence: newStatus === "completed" ? 100 : newStatus === "in-progress" ? Math.max(item.confidence, 40) : 10
            }
          : item
      )
    );
  };

  const handleConfidenceChange = (itemId: string, val: number) => {
    setRoadmapItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          let updatedStatus = item.status;
          if (val >= 90) updatedStatus = "completed";
          else if (val <= 10) updatedStatus = "not-started";
          else updatedStatus = "in-progress";

          return { ...item, confidence: val, status: updatedStatus };
        }
        return item;
      })
    );
  };

  const addRoadmapItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadItemSkill.trim()) return;

    setRoadmapItems(prev => [
      ...prev,
      {
        id: `road-manual-${Date.now()}`,
        skillName: newRoadItemSkill,
        status: "not-started",
        confidence: 10,
        resourceType: "სასწავლო გეგმა",
        resourceName: newRoadItemResource || "თვითგანვითარება და პორტფოლიო პროექტები",
        estimatedHours: "10-15 სთ",
        practicalProject: newRoadItemProj || "შექმენი დამოუკიდებელი მინი-აპლიკაცია"
      }
    ]);

    setNewRoadItemSkill("");
    setNewRoadItemResource("");
    setNewRoadItemProj("");
  };

  const deleteRoadmapItem = (itemId: string) => {
    setRoadmapItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate stats
  const completedSkillsCount = roadmapItems.filter(r => r.status === "completed").length;
  const inProgressSkillsCount = roadmapItems.filter(r => r.status === "in-progress").length;
  const averageConfidence = roadmapItems.length > 0
    ? Math.round(roadmapItems.reduce((acc, curr) => acc + curr.confidence, 0) / roadmapItems.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col justify-between">
      {/* Dynamic Header / Navbar Component */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Hero with custom action cards */}
        <section className="mb-8 bg-gradient-to-br from-emerald-900 to-teal-800 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-80 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 mb-4 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> CareerNavigator AI v2.1
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              პერსონალური კარიერული გზამკვლევი სტუდენტებისთვის
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              დააკოპირე უნივერსიტეტის საგნის სილაბუსები, ჩააგდე შენი CV ან გამოიყენე ჩვენი სატესტო შაბლონები. Google-ის საძიებო სისტემით უსაფრთხოდ ვიპოვით საწყისი დონის ვაკანსიებს, შევაფასებთ შესაბამისობას და ერთად შევქმნით პორტფოლიოსა და უნარების განვითარების გეგმას კომპეტენტური ნაპრალების შესავსებად!
            </p>
          </div>

          {/* Quick select templates */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-emerald-200 font-medium mb-3">🚀 აირჩიე მზა სტუდენტური პროფილი სწრაფი ტესტირებისთვის:</p>
            <div className="flex flex-wrap gap-2.5">
              <button
                id="select-template-1"
                onClick={() => loadSamplePair("web-dev", "junior-dev")}
                className="bg-white/10 hover:bg-white/20 hover:scale-[1.02] border border-white/10 text-white text-xs font-medium px-4 py-2 rounded-xl transition duration-150 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                React დეველოპერი სტუდენტი
              </button>
              <button
                id="select-template-2"
                onClick={() => loadSamplePair("data-science", "junior-analyst")}
                className="bg-white/10 hover:bg-white/20 hover:scale-[1.02] border border-white/10 text-white text-xs font-medium px-4 py-2 rounded-xl transition duration-150 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                მონაცემთა ანალიტიკოსი სტუდენტი
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Dual columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Control Panel (Takes 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-2.5 mb-5 border-b border-slate-50 pb-4">
                <div className="p-2 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 tracking-tight text-base">კარიერული ანალიზატორი</h3>
                  <p className="text-xs text-gray-500">შეიყვანეთ განათლებისა და გამოცდილების მონაცემები</p>
                </div>
              </div>

              {/* Syllabus input block */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">
                  📘 აკადემიური სილაბუსის აღწერა
                </label>
                {syllabusFile ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-2 animate-fade-in">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="text-xs truncate">
                        <p className="font-semibold text-emerald-950 truncate">{syllabusFile.name}</p>
                        <p className="text-[10px] text-emerald-600/80 font-mono">PDF სილაბუსი ატვირთულია</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSyllabusFile(null)}
                      className="p-1 px-2 rounded-lg hover:bg-emerald-100/60 text-emerald-700 text-xs font-semibold hover:scale-105 transition"
                    >
                      წაშლა
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      id="syllabus-input-id"
                      rows={4}
                      value={syllabusInput}
                      onChange={e => setSyllabusInput(e.target.value)}
                      placeholder="ჩააკოპირე უნივერსიტეტის საგნის აღწერა, სილაბუსის ტექსტი ან კურიკულუმი... (მაგალითად: ძირითადი თემები, ნასწავლი ტექნოლოგიები)"
                      className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none rounded-xl transition duration-150"
                    ></textarea>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">ან ატვირთეთ PDF ფაილი</span>
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50 text-gray-600 hover:text-emerald-700 font-semibold text-[11px] transition duration-150 shadow-sm">
                        <Plus className="w-3 h-3" /> PDF სილაბუსი
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={e => handleFileChange(e, "syllabus")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* CV inputs block */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">
                  📄 სტუდენტის CV / რეზიუმე
                </label>
                {cvFile ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-2 animate-fade-in">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div className="text-xs truncate">
                        <p className="font-semibold text-emerald-950 truncate">{cvFile.name}</p>
                        <p className="text-[10px] text-emerald-600/80 font-mono">PDF CV ატვირთულია</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="p-1 px-2 rounded-lg hover:bg-emerald-100/60 text-emerald-700 text-xs font-semibold hover:scale-105 transition"
                    >
                      წაშლა
                    </button>
                  </div>
                ) : (
                  <>
                    <textarea
                      id="cv-input-id"
                      rows={4}
                      value={cvInput}
                      onChange={e => setCvInput(e.target.value)}
                      placeholder="ჩაწერე შენი მოკლე რეზიუმე, უნარები, პროექტები ან გამოცდილება... (აქ ჩაწერილი მონაცემები ავტომატურად გააანალიზებს კომპეტენციებს)"
                      className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none rounded-xl transition duration-150"
                    ></textarea>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">ან ატვირთეთ PDF ფაილი</span>
                      <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50 text-gray-600 hover:text-emerald-700 font-semibold text-[11px] transition duration-150 shadow-sm">
                        <Plus className="w-3 h-3" /> PDF CV
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={e => handleFileChange(e, "cv")}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Custom preferences for Grounding Search */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 tracking-wide uppercase">
                  🎯 დამატებითი ძებნის ფილტრები (ოფციონალური)
                </label>
                <input
                  id="pref-input-id"
                  type="text"
                  value={customPreferences}
                  onChange={e => setCustomPreferences(e.target.value)}
                  placeholder="მაგ. 'ანაზღაურებადი სტაჟირება', 'მხოლოდ დისტანციური', 'HR.ge'"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 outline-none rounded-xl transition duration-150"
                />
              </div>

              {/* General action button */}
              <button
                id="btn-analyze-id"
                disabled={loading}
                onClick={handleAnalyzeAndSearch}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm tracking-tight transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>ვეძებ რეალურ ვაკანსიებს Google-ში...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>მოიძიე ვაკანსიები & გააანალიზე</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Quick stats panel */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xl shadow-slate-100/50">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">გზამკვლევის სტატისტიკა</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-gray-500 font-medium">სწავლის პროგრესი</p>
                  <p className="text-xl font-extrabold text-emerald-700 tracking-tight font-mono">{completedSkillsCount} / {roadmapItems.length}</p>
                  <span className="text-[9px] text-gray-400 font-medium">უნარი დასრულებულია</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <p className="text-[10px] text-gray-500 font-medium">დარჩენილი ნაპრალი</p>
                  <p className="text-xl font-extrabold text-amber-700 tracking-tight font-mono">{inProgressSkillsCount + roadmapItems.length - completedSkillsCount}</p>
                  <span className="text-[9px] text-gray-400 font-medium">უნარი შესასწავლია</span>
                </div>
              </div>
              <div className="mt-4 bg-slate-50 rounded-2xl border border-slate-100/50 p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">საშუალო თავდაჯერებულობა</p>
                  <p className="text-lg font-extrabold text-emerald-800 font-mono">{averageConfidence}%</p>
                </div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${averageConfidence}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Workspaces and Tabs (Takes 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Nav tabs header */}
            <div className="bg-white p-1.5 border border-slate-100 rounded-2xl shadow-sm flex items-center space-x-1 overflow-x-auto whitespace-nowrap">
              <button
                id="tab-analysis"
                onClick={() => setActiveTab("analysis")}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-tight transition duration-150 flex items-center justify-center gap-2 shrink-0 ${
                  activeTab === "analysis"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-slate-50"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>ვაკანსიები & ანალიზი</span>
              </button>
              <button
                id="tab-portfolio"
                onClick={() => setActiveTab("portfolio")}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-tight transition duration-150 flex items-center justify-center gap-2 shrink-0 ${
                  activeTab === "portfolio"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-slate-50"
                }`}
              >
                <FolderDot className="w-4 h-4" />
                <span>ჩემი პორტფოლიო</span>
              </button>
              <button
                id="tab-roadmap"
                onClick={() => setActiveTab("roadmap")}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-tight transition duration-150 flex items-center justify-center gap-2 shrink-0 ${
                  activeTab === "roadmap"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-slate-50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>უნარების გეგმა</span>
              </button>
              <button
                id="tab-chat"
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs tracking-tight transition duration-150 flex items-center justify-center gap-2 shrink-0 ${
                  activeTab === "chat"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-slate-50"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>მენტორ ჩატი</span>
              </button>
            </div>

            {/* TAB CONTAINER 1: Analysis & Grounding Search Results */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                
                {/* Active search results list */}
                {analysisResult ? (
                  <>
                    {/* Top analysis overview cards */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                        📝 პროფილის სემანტიკური ანალიზი
                      </span>
                      <h3 className="text-xl font-extrabold text-gray-900 mt-1 mb-3">ხელმისაწვდომი რესურსების შეფასება</h3>
                      <p className="text-sm text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {analysisResult.profileSummary}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-gray-700 mb-2">💡 გამოვლენილი უპირატესი კომპეტენციები:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.keyStrengths.map((str, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-100 px-2.5 py-1 rounded-lg">
                              ✓ {str}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Grounded vacancies section (Max 3) */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                            💼 GOOGLE SEARCH GROUNDED რეალური ვაკანსიები
                          </span>
                          <h3 className="text-lg font-extrabold text-gray-900">თავსებადი ვაკანსიები თბილისში</h3>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">აქტუალური</span>
                      </div>

                      {analysisResult.vacancies.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs">
                          ვაკანსიები ვერ მოიძებნა. სცადეთ სხვა საძიებო სიტყვები.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analysisResult.vacancies.map((vac, idx) => (
                            <div key={idx} className="border border-slate-100 hover:border-emerald-200 bg-slate-50/50 p-5 rounded-2xl transition duration-150 relative overflow-hidden">
                              
                              {/* Compat % stamp */}
                              <div className="absolute right-4 top-4 bg-emerald-650 flex items-center justify-center p-2 rounded-xl text-emerald-100 border border-emerald-500 bg-emerald-800">
                                <div className="text-center">
                                  <span className="block text-[14px] font-extrabold tracking-tight font-mono">{vac.compatPercent}%</span>
                                  <span className="block text-[8px] font-medium tracking-wide uppercase">თავსებადი</span>
                                </div>
                              </div>

                              <div className="pr-16">
                                <h4 className="font-extrabold text-gray-900 text-sm">{vac.title}</h4>
                                <p className="text-xs font-semibold text-emerald-700 mb-2">{vac.company}</p>
                              </div>

                              <p className="text-xs text-gray-600 leading-relaxed mb-3 mt-2 font-medium">
                                <strong className="text-gray-700">რატომ შეესაბამება:</strong> {vac.rationale}
                              </p>

                              {/* Gaps detected / skills to build */}
                              <div className="bg-white rounded-xl p-3 border border-slate-100 text-xs mb-4">
                                <span className="block font-bold text-amber-700 mb-1 flex items-center gap-1 font-mono uppercase text-[10px]">
                                  ⚠️ კომპეტენციური ნაპრალი (დამატებითი მოთხოვნები):
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {vac.additionalSkillsRequired.map((skill, sIdx) => (
                                    <span key={sIdx} className="bg-amber-50 text-amber-800 border border-amber-100 text-[10px] px-2 py-0.5 rounded font-medium">
                                      + {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Action Link to jobs.ge / company */}
                              <a
                                href={vac.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100"
                              >
                                იხილე წყარო <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Strategic decomposition steps */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                        🌱 სტრატეგიული დეკომპოზიცია
                      </span>
                      <h3 className="text-lg font-extrabold text-gray-900 mt-1 mb-4">კარიერული განვითარების ეტაპობრივი გეგმა</h3>

                      <div className="relative border-l-2 border-emerald-100 pl-4 space-y-6 my-2 ml-2">
                        {analysisResult.strategicDecomposition.map((milestone, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot icon */}
                            <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white border-2 border-white flex items-center justify-center font-mono text-[9px] font-bold">
                              {idx + 1}
                            </div>
                            
                            <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">{milestone.stage}</h4>
                            <p className="text-sm font-bold text-gray-900 mb-1">{milestone.focus}</p>
                            <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl mt-1 border border-slate-100">{milestone.actionPlan}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw analysis text report with copy trigger */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                          📑 სრული მოტივირებული რეპორტი (მოხსენება)
                        </span>
                        <button
                          onClick={copyReportToClipboard}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 transition"
                        >
                          {copiedReport ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>კოპირებულია!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>რეპორტის კოპირება</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs bg-slate-50 border border-slate-100/80 p-5 rounded-2xl whitespace-pre-wrap font-sans text-gray-700 leading-relaxed shadow-inner">
                        {analysisResult.fullReportMarkdown}
                      </div>
                    </div>

                    {/* Sources grounding display */}
                    {sources.length > 0 && (
                      <div className="bg-teal-50/70 border border-teal-100 rounded-3xl p-5">
                        <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-widest font-mono">
                          📌 დამოწმებული საძიებო წყაროები (Grounded Search Sources)
                        </span>
                        <div className="mt-2.5 space-y-1">
                          {sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs font-semibold text-teal-900 hover:underline flex items-center gap-1.5 truncate"
                            >
                              🔗 {src.title} <span className="text-[10px] text-teal-600 font-mono">({src.uri})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-gray-500 shadow-sm">
                    <p className="text-sm font-semibold mb-2">მონაცემები ჯერ არ გაანალიზებულა.</p>
                    <p className="text-xs text-gray-400">შეიყვანეთ CV ან სილაბუსის ტექსტი მარცხნივ და დააჭირეთ „მოიძიე ვაკანსიები & გააანალიზე“ შედეგების მისაღებად.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTAINER 2: Interactive Student Portfolio Showcase */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                
                {/* Visualizer header */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-[17px] text-gray-900">სტუდენტური პორტფოლიოს განყოფილება</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6">
                    შექმენი შენი პროფესიონალური პროფილი, სადაც წარმოაჩენ აკადემიურ მიღწევებს, პროექტებსა და უნარებს. ეს დაგეხმარება დამსაქმებელთან იდეალური პირველი შთაბეჭდილების მოხდენაში.
                  </p>

                  {/* Portfolio Bio Editor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-50">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 tracking-wide mb-1 uppercase">სტუდენტის სახელი</label>
                      <input
                        type="text"
                        value={portfolio.fullName}
                        onChange={e => setPortfolio(p => ({ ...p, fullName: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 tracking-wide mb-1 uppercase">საკონტაქტო სათაური</label>
                      <input
                        type="text"
                        value={portfolio.title}
                        onChange={e => setPortfolio(p => ({ ...p, title: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 tracking-wide mb-1 uppercase">ჩემს შესახებ (Bio)</label>
                      <textarea
                        rows={2}
                        value={portfolio.about}
                        onChange={e => setPortfolio(p => ({ ...p, about: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Portfolio Visual Representation */}
                <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b border-white/10 pb-5 mb-5 gap-3">
                    <div>
                      <h4 className="text-xl font-extrabold font-serif tracking-tight">{portfolio.fullName}</h4>
                      <p className="text-xs text-emerald-200 font-mono font-bold mt-1 uppercase flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> {portfolio.title}
                      </p>
                    </div>
                    <span className="text-[10px] bg-white/10 text-emerald-200 border border-white/10 px-2.5 py-1 rounded-full font-mono uppercase">
                      სამუშაოს მაძიებელი სტუდენტი
                    </span>
                  </div>

                  <p className="text-xs text-emerald-100/90 leading-relaxed mb-6 italic bg-white/5 p-3.5 rounded-xl">
                    "{portfolio.about}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills Matrix */}
                    <div>
                      <h5 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 border-b border-white/5 pb-2 mb-3 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-emerald-400" /> ძირითადი უნარები
                      </h5>
                      {portfolio.skills.length === 0 ? (
                        <p className="text-xs text-emerald-200/50 italic">უნარები ჯერ არ არის დამატებული.</p>
                      ) : (
                        <div className="space-y-3">
                          {portfolio.skills.map((sk, idx) => (
                            <div key={idx} className="group flex items-center justify-between bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/5 transition">
                              <div className="flex-1 mr-3">
                                <div className="flex justify-between text-[11px] font-bold text-gray-100 mb-1">
                                  <span>{sk.name}</span>
                                  <span className="font-mono">{sk.level}%</span>
                                </div>
                                <div className="w-full bg-emerald-950 rounded-full h-1.5">
                                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${sk.level}%` }}></div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeSkill(sk.name)}
                                title="ამოშლა"
                                className="text-emerald-300 hover:text-red-400 p-1 opacity-60 hover:opacity-100 transition duration-150"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Achievements List */}
                    <div>
                      <h5 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 border-b border-white/5 pb-2 mb-3 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-400" /> აკადემიური მიღწევები
                      </h5>
                      {portfolio.achievements.length === 0 ? (
                        <p className="text-xs text-emerald-200/50 italic">აკადემიური მიღწევები არ არის მითითებული.</p>
                      ) : (
                        <div className="space-y-2">
                          {portfolio.achievements.map((ach) => (
                            <div key={ach.id} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs text-emerald-50">
                              <span className="flex-1 mr-2 flex items-start gap-1 pb-0.5">
                                <span className="text-emerald-400 mt-0.5 shrink-0">★</span>
                                <span>{ach.title}</span>
                              </span>
                              <button
                                onClick={() => removeAchievement(ach.id)}
                                title="ამოშლა"
                                className="text-emerald-300 hover:text-red-400 p-1 transition opacity-60 hover:opacity-100 shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Showcase Projects */}
                  <div className="mt-8">
                    <h5 className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 border-b border-white/5 pb-2 mb-3 flex items-center gap-1.5">
                      <FolderDot className="w-4 h-4 text-emerald-400" /> რეალური / პეპ პროექტები (Showcase Projects)
                    </h5>
                    {portfolio.projects.length === 0 ? (
                      <p className="text-xs text-emerald-200/50 italic">პროექტები არ არის დამატებული.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {portfolio.projects.map((proj) => (
                          <div key={proj.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 transition flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <h6 className="font-extrabold text-sm text-white shrink-0">{proj.title}</h6>
                                <button
                                  onClick={() => removeProject(proj.id)}
                                  className="text-emerald-200 hover:text-red-400 p-1 rounded transition opacity-50 hover:opacity-100 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-emerald-100/80 mb-3 line-clamp-2">{proj.description}</p>
                            </div>

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                              <span className="text-[10px] bg-emerald-800 text-emerald-200 border border-emerald-700 px-2.5 py-0.5 rounded font-mono text-center">
                                {proj.tech}
                              </span>
                              {proj.link !== "#" && (
                                <a
                                  href={proj.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-bold text-emerald-300 hover:text-white flex items-center gap-1 transition"
                                >
                                  ცოცხალი ლინკი <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio Builders Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Skill Add Form */}
                  <div className="bg-white rounded-3xl border border-slate-105 p-5 shadow-lg">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight mb-3 flex items-center gap-1 border-b pb-2 mb-4">
                      <Plus className="w-4 h-4 text-emerald-600" /> ახალი უნარის დამატება
                    </h4>
                    <form onSubmit={addSkill} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-650 mb-1">უნარის სახელი (ტექნოლოგია)</label>
                        <input
                          type="text"
                          value={newSkillName}
                          onChange={e => setNewSkillName(e.target.value)}
                          placeholder="მაგ. TypeScript, UI Design"
                          className="w-full text-xs p-2 bg-slate-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-650 mb-1">ფლობის დონე % ({newSkillLevel}%)</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={newSkillLevel}
                          onChange={e => setNewSkillLevel(parseInt(e.target.value))}
                          className="w-full text-xs"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition duration-150"
                      >
                        დამატება
                      </button>
                    </form>
                  </div>

                  {/* Achievement Add Form */}
                  <div className="bg-white rounded-3xl border border-slate-105 p-5 shadow-lg">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight mb-3 flex items-center gap-1 border-b pb-2 mb-4">
                      <Plus className="w-4 h-4 text-emerald-600" /> მიღწევის დამატება
                    </h4>
                    <form onSubmit={addAchievement} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-650 mb-1">მიღწევის სათაური / სერტიფიკატი</label>
                        <textarea
                          rows={2}
                          value={newAchTitle}
                          onChange={e => setNewAchTitle(e.target.value)}
                          placeholder="მაგ. სერტიფიკატი: კავკასიის უნივერსიტეტის ვებ-კონკურსი..."
                          className="w-full text-xs p-2 bg-slate-50 border rounded-xl"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition duration-150"
                      >
                        მიღწევის დამატება
                      </button>
                    </form>
                  </div>

                  {/* Project Add Form */}
                  <div className="bg-white rounded-3xl border border-slate-105 p-5 shadow-lg">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-tight mb-3 flex items-center gap-1 border-b pb-2 mb-4">
                      <Plus className="w-4 h-4 text-emerald-600" /> პროექტის დამატება
                    </h4>
                    <form onSubmit={addProject} className="space-y-3 text-xs">
                      <div>
                        <input
                          type="text"
                          placeholder="პროექტის დასახელება"
                          value={newProjTitle}
                          onChange={e => setNewProjTitle(e.target.value)}
                          className="w-full p-2 bg-slate-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="გამოყენებული ტექნოლოგია"
                          value={newProjTech}
                          onChange={e => setNewProjTech(e.target.value)}
                          className="w-full p-2 bg-slate-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ბმული / Git-ის მისამართი"
                          value={newProjLink}
                          onChange={e => setNewProjLink(e.target.value)}
                          className="w-full p-2 bg-slate-50 border rounded-xl"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="მოკლე აღწერა"
                          rows={2}
                          value={newProjDesc}
                          onChange={e => setNewProjDesc(e.target.value)}
                          className="w-full p-2 bg-slate-50 border rounded-xl"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition duration-150"
                      >
                        პროექტის დამატება
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTAINER 3: Interactive Skill Roadmap & Gap Mitigation Plan */}
            {activeTab === "roadmap" && (
              <div className="space-y-6">
                
                {/* Visualizer header */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-[17px] text-gray-900">ინტერაქტიული უნარების განვითარების გეგმა</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ეს პლატფორმა შეიქმნა CV-სა და ვაკანსიის მოთხოვნებს შორის არსებული **ტექნოლოგიური ნაპრალების (Gaps)** აღმოსაფხვრელად. განაახლეთ თქვენი პროგრესი, დაარეგულირეთ თავდაჯერებულობა და მართეთ სწავლის განრიგი სასწავლო მასალების მიხედვით.
                  </p>
                </div>

                {/* Progress Grid of Gaps */}
                <div className="space-y-4">
                  {roadmapItems.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-3xl p-5 shadow-sm transition-all duration-300 ${
                        item.status === "completed"
                          ? "border-emerald-200 bg-emerald-50/10"
                          : item.status === "in-progress"
                          ? "border-amber-200 bg-amber-50/5"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-slate-100 text-gray-600 border mb-2">
                            {item.resourceType}
                          </span>
                          <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                            {item.skillName}
                            {item.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          </h4>
                          
                          <p className="text-xs text-gray-500 mt-1">
                            🚀 <strong>რეკომენდებული რესურსი:</strong> {item.resourceName} ({item.estimatedHours})
                          </p>
                          <p className="text-xs text-emerald-800 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 mt-2.5">
                            💻 <strong>პრაქტიკული დავალება:</strong> {item.practicalProject}
                          </p>
                        </div>

                        {/* Status switcher */}
                        <div className="flex flex-col sm:items-end gap-2 shrink-0">
                          <label className="text-[10px] font-extrabold text-gray-450 uppercase tracking-widest block">სტატუსის მართვა</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                            <button
                              onClick={() => transitionRoadmapStatus(item.id, "not-started")}
                              className={`px-2.5 py-1.5 rounded-lg transition text-[11px] ${
                                item.status === "not-started" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                              }`}
                            >
                              არ დამწყებია
                            </button>
                            <button
                              onClick={() => transitionRoadmapStatus(item.id, "in-progress")}
                              className={`px-2.5 py-1.5 rounded-lg transition text-[11px] ${
                                item.status === "in-progress" ? "bg-amber-100 text-amber-800 shadow-sm" : "text-gray-500"
                              }`}
                            >
                              ვსწავლობ
                            </button>
                            <button
                              onClick={() => transitionRoadmapStatus(item.id, "completed")}
                              className={`px-2.5 py-1.5 rounded-lg transition text-[11px] ${
                                item.status === "completed" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500"
                              }`}
                            >
                              ვიცი
                            </button>
                          </div>
                          
                          <button
                            onClick={() => deleteRoadmapItem(item.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 self-start sm:self-end mt-1 py-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ამოშლა გეგმიდან
                          </button>
                        </div>
                      </div>

                      {/* Interactive range display */}
                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-xs text-gray-500 font-mono mb-1.5">
                            <span>ათვისების დონე / თავდაჯერებულობა</span>
                            <span className="font-bold text-gray-900">{item.confidence}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={item.confidence}
                            onChange={e => handleConfidenceChange(item.id, parseInt(e.target.value))}
                            className="w-full accent-emerald-600"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Manual roadmap input generator */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">
                    ➕ ახალი სასწავლო მიზნის დამატება
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 mt-1 mb-4">დაამატე სასურველი დარგობრივი კომპეტენცია</h3>

                  <form onSubmit={addRoadmapItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">შესასწავლი უნარი (მაგ. Python Pandas)</label>
                      <input
                        type="text"
                        value={newRoadItemSkill}
                        onChange={e => setNewRoadItemSkill(e.target.value)}
                        placeholder="მაგ. Typescript ან Redux Toolkit"
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 mb-1">ნახსენები სასწავლო მასალის ბმული / კურსი</label>
                      <input
                        type="text"
                        value={newRoadItemResource}
                        onChange={e => setNewRoadItemResource(e.target.value)}
                        placeholder="მაგ. Coursera / Google Certificate"
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-600 mb-1">საკუთარი პრაქტიკული პროექტის იდეა</label>
                      <input
                        type="text"
                        value={newRoadItemProj}
                        onChange={e => setNewRoadItemProj(e.target.value)}
                        placeholder="აღწერე მარტივი პრაქტიკული პროექტი (მაგ. 'ბლოგის აწყობა MongoDB-ით')"
                        className="w-full p-2.5 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="bg-emerald-650 hover:bg-emerald-700 bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl transition duration-150 inline-flex items-center gap-1.5 shadow-md shadow-emerald-200"
                      >
                        <Plus className="w-4 h-4" /> სასწავლო მიზნის ჩამატება
                      </button>
                    </div>
                  </form>
                </div>

                {/* Helpful tips */}
                <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-3xl flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <h5 className="text-xs font-extrabold text-amber-900 uppercase tracking-tight mb-0.5">როგორ დავხუროთ ნაპრალები?</h5>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      დაიწყეთ პრაქტიკული დავალების შესრულებით, განათავსეთ პროგრესი თქვენს პორტფოლიოში (წინა ჩანართში) და შემდეგ წარუდგინეთ დამსაქმებელს ინტერვიუზე, რაც აჩვენებს თქვენს პროაქტიულ სწავლის უნარს.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTAINER 4: MENTORSHIP CHAT */}
            {activeTab === "chat" && (
              <div className="space-y-4">
                {/* Active Chat Component */}
                <Chatbot cvText={cvInput} syllabusText={syllabusInput} />
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Styled Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CareerNavigator AI — უნივერსიტეტის სტუდენტების სავიზიტო ბარათი და პროფესიული შუქურა.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Google Search Grounding</span>
            <span>ვერსია 2.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
