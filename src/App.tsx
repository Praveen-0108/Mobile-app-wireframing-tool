import React, { useState } from 'react';
import { 
  Persona, 
  ResearchPlan, 
  UserFlowStep, 
  WireframeScreen, 
  DesignThinkingStage,
  DesignThinkingLog 
} from './types';
import DesignThinkingTab from './components/DesignThinkingTab';
import ResearchTab from './components/ResearchTab';
import UserFlowTab from './components/UserFlowTab';
import WireframeTab from './components/WireframeTab';
import { 
  Compass, 
  Lightbulb, 
  Users, 
  GitFork, 
  Smartphone, 
  Info, 
  HelpCircle,
  Clock
} from 'lucide-react';

const INITIAL_RESEARCH_DATA: ResearchPlan = {
  questions: [
    "What are the main frustrations you encounter when navigating public pet finder lists?",
    "How important are videos / bios compared to simple profile metrics when choosing a companion?",
    "What core contact information do you feel comfortable sharing instantly inside shelter applications?",
    "Do you prefer a card sorting feed, or a precise grid panel search layout?"
  ],
  targetAudience: "Busy modern animal lovers, working parents, and animal shelter volunteers searching for premium animal matches locally.",
  userNeeds: [
    "Frictionless search filtering by location & breed size",
    "Rapid video bios to inspect animal energy levels prior to adoption meetups",
    "Direct messaging application with local shelter advisors",
    "Ability to offline-save favorite profiles to compare at home"
  ]
};

const INITIAL_PERSONAS: Persona[] = [
  {
    id: "p-sarah",
    name: "Sarah Miller",
    role: "Busy Working Mom",
    age: 38,
    quote: "I need to locate highly kid-friendly puppies during short lunch breaks without hitting annoying login blocks.",
    goal: "Find clear age-appropriate matches with shelter video descriptions on a fast responsive single swipe feed.",
    painPoint: "Traditional shelter lists have outdated websites that render incredibly poorly on phones."
  },
  {
    id: "p-james",
    name: "James Carter",
    role: "Rescue Foster Coordinator",
    age: 26,
    quote: "Keeping track of digital adoption requests across multiple screens on the run is incredibly frustrating.",
    goal: "Access an interactive mobile dashboard showing pending approvals and urgent rescue cases clearly.",
    painPoint: "Messaging formats are unorganized and lead to repetitive communications."
  }
];

const INITIAL_USER_FLOW_STEPS: UserFlowStep[] = [
  {
    id: "step-1",
    title: "Onboarding Entry",
    description: "Sarah opens the finder app, selects search radii, and immediately browses a matching puppy swipe feed.",
    actionText: "Tap Search Radius",
    targetScreenId: "scr-home"
  },
  {
    id: "step-2",
    title: "Active Feed View",
    description: "Browse current dogs, swipe on a profile card to view the introduction bio video.",
    actionText: "View Video Profile",
    targetScreenId: "scr-details"
  },
  {
    id: "step-3",
    title: "Application Request",
    description: "Tap the main adopt invitation action button to open the rapid shelter form.",
    actionText: "Open Application",
    targetScreenId: "scr-application"
  }
];

const INITIAL_SCREENS_DATA: WireframeScreen[] = [
  {
    id: "scr-home",
    name: "Shelter Home",
    description: "The primary swipe feed showing shelter dogs nearby.",
    elements: [
      { id: "el-h-1", type: "header", x: 10, y: 15, w: 300, h: 42, content: "🐾 Pet Finder Home" },
      { id: "el-h-2", type: "text", x: 20, y: 70, w: 280, h: 25, content: "Locating rescue dogs in your radius:" },
      { id: "el-h-3", type: "card", x: 20, y: 105, w: 280, h: 250, content: "🐶 Cooper (Golden Retriever, 2yo) - Swipe up to see bio video!" },
      { id: "el-h-4", type: "button", x: 20, y: 370, w: 280, h: 42, content: "View Cooper's Video Bio ➔", linkToScreenId: "scr-details" },
      { id: "el-h-5", type: "navbar", x: 10, y: 500, w: 300, h: 50, content: "Home | Matches | Alerts | Profile" }
    ]
  },
  {
    id: "scr-details",
    name: "Cooper's Video Bio",
    description: "Action-oriented detailed profile page featuring video playback and application triggers.",
    elements: [
      { id: "el-d-1", type: "header", x: 10, y: 15, w: 300, h: 42, content: "Cooper's Profile" },
      { id: "el-d-2", type: "image", x: 20, y: 70, w: 280, h: 160, content: "📹 (Video Playing: Cooper Catching Frisbee)" },
      { id: "el-d-3", type: "card", x: 20, y: 245, w: 280, h: 120, content: "Highlights: Vaccinated, child-friendly, energetic. Shelter: Happy Paws rescue center (1.2 miles away)." },
      { id: "el-d-5", type: "button", x: 20, y: 380, w: 280, h: 42, content: "Adopt Cooper Application ➔", linkToScreenId: "scr-application" },
      { id: "el-d-6", type: "navbar", x: 10, y: 500, w: 300, h: 50, content: "Home | Matches | Alerts | Profile" }
    ]
  },
  {
    id: "scr-application",
    name: "Adoption Form",
    description: "Rapid single-page checkout adopt submission.",
    elements: [
      { id: "el-a-1", type: "header", x: 10, y: 15, w: 300, h: 42, content: "Adopt Application" },
      { id: "el-a-2", type: "input", x: 20, y: 70, w: 280, h: 42, content: "Your Full Name", placeholder: "e.g. Sarah Miller" },
      { id: "el-a-3", type: "input", x: 20, y: 130, w: 280, h: 42, content: "Mobile Contact", placeholder: "e.g. 555-0342" },
      { id: "el-a-4", type: "input", x: 20, y: 190, w: 280, h: 42, content: "Household Pet Experience", placeholder: "e.g. Had dogs for 5 years" },
      { id: "el-a-5", type: "checkbox", x: 20, y: 245, w: 280, h: 30, content: "Authorize home safety inspection" },
      { id: "el-a-6", type: "button", x: 20, y: 290, w: 280, h: 42, content: "Submit adopting application ✨", linkToScreenId: "scr-home" },
      { id: "el-a-7", type: "navbar", x: 10, y: 500, w: 300, h: 50, content: "Home | Matches | Alerts | Profile" }
    ]
  }
];

const INITIAL_STAGES: Record<string, DesignThinkingStage> = {
  empathize: {
    stage: 'empathize',
    notes: 'Observations from shelter team and user adoption candidates confirm primary friction points: 1) Candidates are overwhelmed by long complex registration flows, 2) Seeing photos only is insufficient - users want energetic video markers, 3) Real-time adoption advisors increase applicant trust by 60%.',
    logs: [
      { id: 'l1', title: 'User Interview Block', content: 'Met 4 candidate adopters; confirmed they value short video interactions before driving out.', createdAt: 'May 27, 04:12 AM' },
      { id: 'l2', title: 'Shelter Field Visit', content: 'Discovered rescue workers are too busy to answer redundant phone calls regarding weight limits.', createdAt: 'May 27, 04:30 AM' }
    ],
    brainstormIdeas: [],
    brainstormAdvice: ''
  },
  define: {
    stage: 'define',
    notes: 'Problem Statement: "How might we empower busy, local animal lovers to securely discover and confidently submit child-friendly rescue puppy requests during brief daily breaks using structured video bio loops?"',
    logs: [
      { id: 'l3', title: 'Problem Mapping', content: 'Identified the target gap: lack of trust in plain image cards.', createdAt: 'May 27, 04:35 AM' }
    ],
    brainstormIdeas: [],
    brainstormAdvice: ''
  },
  ideate: {
    stage: 'ideate',
    notes: 'Ideas: Swipe loops with clear animal metrics (vaccinated, kids compatibility icons), layout templates showing video player windows directly inline, one-tap adopting checkout request buttons with automatic follow-up contacts.',
    logs: [],
    brainstormIdeas: [],
    brainstormAdvice: ''
  },
  prototype: {
    stage: 'prototype',
    notes: 'Rapid prototyping plan: 3 screens mapped on vector layouts - Home feed, Video Bio, Adoption quick application form. Link key primary triggers together for clickable mobile simulator play.',
    logs: [],
    brainstormIdeas: [],
    brainstormAdvice: ''
  },
  test: {
    stage: 'test',
    notes: 'User testing results with low-fi simulated views: Candidates completed adoption queries in 45 seconds. Feedback loops requested Breed and Size selectors to clean layout density.',
    logs: [],
    brainstormIdeas: [],
    brainstormAdvice: ''
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'thinking' | 'research' | 'flow' | 'wireframe'>('thinking');
  const [appTheme, setAppTheme] = useState<string>('Local pet adoption finder with video bios');
  
  // States
  const [research, setResearch] = useState<ResearchPlan>(INITIAL_RESEARCH_DATA);
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [steps, setSteps] = useState<UserFlowStep[]>(INITIAL_USER_FLOW_STEPS);
  const [screens, setScreens] = useState<WireframeScreen[]>(INITIAL_SCREENS_DATA);
  const [stages, setStages] = useState<Record<string, DesignThinkingStage>>(INITIAL_STAGES);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* Premium Studio Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-xs">
              <Compass className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">Mobile App Wireframe Co-Pilot</span>
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 border border-slate-200 rounded-full font-mono uppercase">UX Studio</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm sm:max-w-xl truncate">
                Conduct research, map personas, model flows, and draft low-fidelity wireframes with Gemini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-stretch md:self-auto justify-between">
            <div className="flex items-center gap-1.5 px-2 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>UTC: {new Date().toISOString().substring(11,16)}</span>
            </div>
            <div className="text-[10px] bg-white px-2 py-1 rounded text-slate-700 font-bold border border-slate-200/60 shadow-xxs">
              Live Preview
            </div>
          </div>
        </div>

        {/* Global tab manager */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px overflow-x-auto space-x-1 py-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('thinking')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'thinking'
                  ? 'bg-slate-900 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>1. Design Thinking Studio</span>
              <span className="text-[9px] bg-slate-200/55 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {Object.values(stages).reduce((acc, current: any) => acc + current.logs.length, 0)} logs
              </span>
            </button>

            <button
              onClick={() => setActiveTab('research')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'research'
                  ? 'bg-slate-900 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. Research & Personas</span>
              <span className="text-[9px] bg-slate-200/55 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {personas.length} personas
              </span>
            </button>

            <button
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'flow'
                  ? 'bg-slate-900 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span>3. User Flow Mapping</span>
              <span className="text-[9px] bg-slate-200/55 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold">
                {steps.length} steps
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wireframe')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'wireframe'
                  ? 'bg-slate-900 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>4. Wireframe & Simulator</span>
              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">
                {screens.length} views
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render Active Window views */}
        {activeTab === 'thinking' && (
          <DesignThinkingTab 
            appTheme={appTheme} 
            stages={stages} 
            setStages={setStages} 
          />
        )}

        {activeTab === 'research' && (
          <ResearchTab 
            appTheme={appTheme} 
            setAppTheme={setAppTheme} 
            research={research} 
            setResearch={setResearch} 
            personas={personas} 
            setPersonas={setPersonas} 
          />
        )}

        {activeTab === 'flow' && (
          <UserFlowTab 
            appTheme={appTheme} 
            personas={personas} 
            steps={steps} 
            setSteps={setSteps} 
            screens={screens} 
          />
        )}

        {activeTab === 'wireframe' && (
          <WireframeTab 
            appTheme={appTheme} 
            screens={screens} 
            setScreens={setScreens} 
            steps={steps} 
          />
        )}

      </main>

      {/* Elegant Footer branding credit */}
      <footer className="bg-white border-t border-slate-200 py-4.5 mt-12 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <span>💡 Chronology based on five-phase design thinking paradigms.</span>
          <span>© 2026 UX-Flow Co-Pilot. Full Local Sandbox active.</span>
        </div>
      </footer>
    </div>
  );
}
