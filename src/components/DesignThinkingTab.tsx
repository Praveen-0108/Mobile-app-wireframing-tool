import React, { useState } from 'react';
import { DesignThinkingStage, DesignThinkingLog } from '../types';
import { fetchBrainstormAdvice } from '../api';
import { 
  Lightbulb, 
  Compass, 
  Target, 
  Wrench, 
  CheckCircle, 
  Cpu, 
  Sparkles, 
  Bookmark, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';

interface Props {
  appTheme: string;
  stages: Record<string, DesignThinkingStage>;
  setStages: React.Dispatch<React.SetStateAction<Record<string, DesignThinkingStage>>>;
}

const STAGES_CONFIG = {
  empathize: {
    title: 'Empathize',
    icon: Compass,
    color: 'border-blue-200 bg-blue-50/50 text-blue-700',
    accentColor: 'bg-blue-600',
    description: 'Understand user needs, feelings, and core motivations through qualitative observation, questionnaires, and interviews.',
    placeholder: 'Record user observations, user feedback notes, and field research results here...'
  },
  define: {
    title: 'Define',
    icon: Target,
    color: 'border-orange-200 bg-orange-50/50 text-orange-700',
    accentColor: 'bg-orange-600',
    description: 'Consolidate research findings, identify system constraints, and establish a clear, human-centered Problem Statement.',
    placeholder: 'Define standard problem statements, system friction points, and constraints here...'
  },
  ideate: {
    title: 'Ideate',
    icon: Lightbulb,
    color: 'border-yellow-200 bg-yellow-50/50 text-yellow-700',
    accentColor: 'bg-yellow-600',
    description: 'Brainstorm creative, out-of-the-box answers to defined problems. Sketch alternative solutions and map strategies.',
    placeholder: 'Write down brainstorming points, alternative layout designs, list features, and novel ideas here...'
  },
  prototype: {
    title: 'Prototype',
    icon: Wrench,
    color: 'border-purple-200 bg-purple-50/50 text-purple-700',
    accentColor: 'bg-purple-600',
    description: 'Generate experimental, cheap, and rapid models of the screens to quickly iterate on interactive elements.',
    placeholder: 'Describe prototype goals, fidelity choices, element link rules, and user interaction rules here...'
  },
  test: {
    title: 'Test',
    icon: CheckCircle,
    color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
    accentColor: 'bg-emerald-600',
    description: 'Put your interactive wireframe into simulation play. Gather user behavior results, interface bugs, and future iterations.',
    placeholder: 'List user comments, performance feedback, interface test logs, and feature enhancement proposals here...'
  }
};

export default function DesignThinkingTab({ appTheme, stages, setStages }: Props) {
  const [activeStage, setActiveStage] = useState<keyof typeof STAGES_CONFIG>('empathize');
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStageData = stages[activeStage];
  const config = STAGES_CONFIG[activeStage];
  const IconComponent = config.icon;

  const handleNotesChange = (text: string) => {
    setStages(prev => ({
      ...prev,
      [activeStage]: {
        ...prev[activeStage],
        notes: text
      }
    }));
  };

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logContent.trim()) return;

    const newLog: DesignThinkingLog = {
      id: `log-${Date.now()}`,
      title: logTitle.trim(),
      content: logContent.trim(),
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setStages(prev => ({
      ...prev,
      [activeStage]: {
        ...prev[activeStage],
        logs: [newLog, ...prev[activeStage].logs]
      }
    }));

    setLogTitle('');
    setLogContent('');
  };

  const deleteLog = (id: string) => {
    setStages(prev => ({
      ...prev,
      [activeStage]: {
        ...prev[activeStage],
        logs: prev[activeStage].logs.filter(l => l.id !== id)
      }
    }));
  };

  const handleBrainstorm = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBrainstormAdvice(
        activeStage,
        currentStageData.notes || 'No specific notes yet.',
        appTheme || 'Untitled Mobile App Project'
      );
      
      setStages(prev => ({
        ...prev,
        [activeStage]: {
          ...prev[activeStage],
          brainstormIdeas: response.ideas || [],
          brainstormAdvice: response.advice || ''
        }
      }));
    } catch (err: any) {
      setError(err.message || 'Brainstorm request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Design Thinking Studio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Build your mobile app wireframes chronologically using the five pillars of the Design Thinking process.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono">
          <BookMarkedIcon className="w-4 h-4 text-slate-500" />
          <span>Project: {appTheme || 'Unnamed Project'}</span>
        </div>
      </div>

      {/* Stage Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(STAGES_CONFIG) as Array<keyof typeof STAGES_CONFIG>).map((key) => {
          const cfg = STAGES_CONFIG[key];
          const isActive = activeStage === key;
          const StageIcon = cfg.icon;
          const hasLogs = stages[key].logs.length > 0;
          
          return (
            <button
              key={key}
              onClick={() => {
                setActiveStage(key);
                setError(null);
              }}
              className={`flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all ${
                isActive 
                  ? `ring-2 ring-offset-2 ring-slate-900 border-slate-900 shadow-sm ${cfg.color.split(' ')[1]}`
                  : 'border-slate-250 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="relative p-2 rounded-lg bg-slate-100 text-slate-700 mb-2">
                <StageIcon className="w-5 h-5" />
                {hasLogs && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-500"></span>
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">{cfg.title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{stages[key].logs.length} logs recorded</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage details & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.accentColor}`} />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Stage Context</span>
                <h3 className="text-lg font-bold text-slate-900">{config.title} Stage</h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-150 mb-6">
              {config.description}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Workspace Notes</label>
              <textarea
                value={currentStageData.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={config.placeholder}
                rows={7}
                className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Log Tracker Form & Items */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Activity & Workshop Logs ({currentStageData.logs.length})</span>
              <span className="text-xs text-slate-400 font-normal">Document step activity results</span>
            </h3>

            <form onSubmit={addLog} className="space-y-3 bg-slate-50 p-4 border border-slate-150 rounded-lg mb-6">
              <span className="text-xs font-bold text-slate-700 block">Create New Log Entry</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Activity Title (e.g. Persona Mapping)"
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="md:col-span-1 text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Key Findings, insights or team consensus points..."
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  className="md:col-span-2 text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!logTitle.trim() || !logContent.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-transparent text-white rounded-lg text-xs font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Log</span>
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {currentStageData.logs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Bookmark className="w-6 h-6 stroke-1" />
                  <span>No logs recorded for this stage yet. Add your team workshop logs above.</span>
                </div>
              ) : (
                currentStageData.logs.map((log) => (
                  <div key={log.id} className="p-3 border border-slate-200 hover:border-slate-300 bg-white rounded-lg flex items-start justify-between gap-2 group transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{log.title}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 flex items-center gap-1 font-mono">
                          <Calendar className="w-2.5 h-2.5" /> {log.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">{log.content}</p>
                    </div>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Brainstorm helper */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-[2.5] select-none pointer-events-none">
              <Sparkles className="w-24 h-24 text-white" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-slate-300" />
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono">AI UX Coach</span>
            </div>

            <h3 className="text-base font-bold text-white tracking-wide">
              Gemini AI Stage Assistant
            </h3>
            
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Generate stage-specific brainstorm ideas, checklists, and UX advice calibrated for: <span className="font-semibold text-slate-100 italic">"{appTheme || 'your application concept'}"</span>.
            </p>

            <button
              onClick={handleBrainstorm}
              disabled={loading || !appTheme}
              className="w-full mt-5 flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs py-2.5 px-4 rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-850" />
              <span>{loading ? 'Consulting Coach...' : 'Brainstorm Stage Insights'}</span>
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-[11px] text-red-200">
                {error}
              </div>
            )}

            {/* Generated Coach Ideas */}
            {currentStageData.brainstormIdeas.length > 0 && !loading && (
              <div className="mt-6 space-y-4 pt-5 border-t border-slate-800">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block">Action Items & Suggestions:</span>
                  <div className="space-y-2">
                    {currentStageData.brainstormIdeas.map((idea, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <span className="text-[10px] bg-slate-800 text-white font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{idea}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {currentStageData.brainstormAdvice && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono block mb-1">Coach UX Blueprint:</span>
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-800/60 p-3 rounded-lg border border-slate-750">
                      "{currentStageData.brainstormAdvice}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentStageData.brainstormIdeas.length === 0 && !loading && (
              <div className="mt-6 pt-5 border-t border-slate-800/80 text-center py-6 text-slate-500 text-xs">
                <span>Click the button above to receive real-time professional design advice for this stage.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookMarkedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
      />
    </svg>
  );
}
