import React, { useState } from 'react';
import { UserFlowStep, Persona, WireframeScreen } from '../types';
import { fetchUserFlow } from '../api';
import { 
  GitCommit, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  Trash2, 
  Link2, 
  AlertCircle,
  HelpCircle,
  Smartphone,
  ChevronRight,
  Settings
} from 'lucide-react';

interface Props {
  appTheme: string;
  personas: Persona[];
  steps: UserFlowStep[];
  setSteps: React.Dispatch<React.SetStateAction<UserFlowStep[]>>;
  screens: WireframeScreen[];
}

export default function UserFlowTab({ appTheme, personas, steps, setSteps, screens }: Props) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Step Editor State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAction, setNewAction] = useState('Tap Next');
  const [newTargetScreenId, setNewTargetScreenId] = useState('');

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);

  const handleGenerateFlow = async () => {
    if (!appTheme) {
      setError('Please define your Application Theme in the User Research tab first.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const pName = selectedPersona ? selectedPersona.name : 'Ideal User';
      const pGoal = selectedPersona ? selectedPersona.goal : 'Navigate app easily';
      
      const generatedSteps = await fetchUserFlow(appTheme, pName, pGoal);
      
      // Auto-assign logical screen link if screens exist with similar names
      const enhancedSteps = generatedSteps.map(step => {
        const matchingScreen = screens.find(scr => 
          scr.name.toLowerCase().includes(step.title.toLowerCase()) || 
          step.title.toLowerCase().includes(scr.name.toLowerCase())
        );
        return {
          ...step,
          targetScreenId: matchingScreen ? matchingScreen.id : ''
        };
      });

      setSteps(enhancedSteps);
    } catch (err: any) {
      setError(err.message || 'Failed to generate user flows.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newStep: UserFlowStep = {
      id: `step-manual-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      actionText: newAction.trim() || 'Tap Next',
      targetScreenId: newTargetScreenId || undefined
    };

    setSteps(prev => [...prev, newStep]);
    setNewTitle('');
    setNewDesc('');
    setNewAction('Tap Next');
    setNewTargetScreenId('');
    setError(null);
  };

  const handleDeleteStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStepScreenLink = (stepId: string, screenId: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id === stepId) {
        return { ...s, targetScreenId: screenId || undefined };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Flow Architecture</h2>
          <p className="text-sm text-slate-500 mt-1">
            Map out screen-by-screen pathways that users traverse to accomplish their core goals.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-250 text-red-700 text-xs p-3.5 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid split: Persona-driven flows vs Step sequence editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Persona selector & generator triggers */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-slate-700" />
                <span>Persona-Driven Flow</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Select a research persona. Gemini will outline their custom user path to complete their goal.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Choose User Persona</label>
              {personas.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                  <p className="text-xs text-slate-400 leading-normal">No personas found. Create personas in the Research & Personas tab first.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedPersonaId}
                    onChange={(e) => setSelectedPersonaId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-800"
                  >
                    <option value="">-- Start with Generic User Flow --</option>
                    {personas.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                    ))}
                  </select>

                  {selectedPersona && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Persona Target Goal</span>
                      <p className="text-xs text-slate-700 font-medium font-sans leading-relaxed">"{selectedPersona.goal}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateFlow}
              disabled={loading || !appTheme}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-4 rounded-lg shadow-sm disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? 'Mapping Logical Steps...' : 'AI Generate Flow Sequence'}</span>
            </button>
          </div>

          {/* Add Manual Flow Step Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Add Custom Flow Step</h3>
            
            <form onSubmit={handleAddStep} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Screen / Step Name</label>
                <input
                  type="text"
                  placeholder="e.g., Video Profile Feed"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">User Action & View Description</label>
                <textarea
                  placeholder="e.g., Scrolls feed of animals, clicks on 'Adopt Me' to submit application form."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Action Trigger</label>
                  <input
                    type="text"
                    placeholder="e.g. Tap Adopt Button"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Link to Wireframe Screen</label>
                  <select
                    value={newTargetScreenId}
                    onChange={(e) => setNewTargetScreenId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-250 bg-white rounded-md focus:ring-1 focus:ring-slate-900 outline-none"
                  >
                    <option value="">(None)</option>
                    {screens.map(scr => (
                      <option key={scr.id} value={scr.id}>{scr.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 border border-transparent text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Flow Step</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Step connector layout */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 text-sm">Visual Flow Pathway</h4>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                {steps.length} total screens mapped
              </span>
            </div>

            {steps.length === 0 ? (
              <div className="text-center py-20 px-4 text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
                <Smartphone className="w-10 h-10 text-slate-300 stroke-1" />
                <p className="max-w-md">No user flow sequences mapped. Create a logical progression of screens so that you can understand the layout flow.</p>
                <button
                  onClick={handleGenerateFlow}
                  disabled={loading || !appTheme}
                  className="mt-2 flex items-center gap-1.5 text-xs text-slate-800 bg-slate-100 border border-slate-250 px-3.5 py-1.5 rounded-lg hover:bg-slate-200 transition-all font-semibold font-sans cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-600" />
                  <span>AI Generate default sequence</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                {steps.map((step, idx) => {
                  const correlatedScreen = screens.find(s => s.id === step.targetScreenId);
                  
                  return (
                    <div key={step.id} className="relative pl-12 group transition-all">
                      {/* Left timeline badge/number */}
                      <span className="absolute left-3.5 top-0 flex items-center justify-center w-6.5 h-6.5 bg-slate-100 group-hover:bg-slate-900 text-slate-700 group-hover:text-white rounded-full font-bold text-xs ring-4 ring-white border border-slate-200 transition-all">
                        {idx + 1}
                      </span>

                      <div className="p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-350 hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{step.title}</span>
                            <span className="text-[10px] bg-slate-100/80 px-2 py-0.5 border border-slate-150 rounded text-slate-500 font-semibold uppercase tracking-wider font-mono">
                              Step {idx + 1} Screen
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.description}</p>
                          
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 py-1 px-2.5 rounded-lg w-fit">
                            <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 font-mono">Action:</span>
                            <span className="text-[11px] text-slate-700 font-semibold">{step.actionText || 'Tap Next'}</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>

                        {/* Screen Link Select & actions */}
                        <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                          <div className="space-y-1.5 text-left md:text-right flex-1 md:flex-initial">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1 justify-start md:justify-end">
                              <Link2 className="w-3 h-3" />
                              <span>Link proto wireframe</span>
                            </label>
                            
                            <select
                              value={step.targetScreenId || ''}
                              onChange={(e) => updateStepScreenLink(step.id, e.target.value)}
                              className="text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                            >
                              <option value="">(None Linked)</option>
                              {screens.map(scr => (
                                <option key={scr.id} value={scr.id}>{scr.name}</option>
                              ))}
                            </select>

                            {correlatedScreen && (
                              <p className="text-[10px] text-emerald-600 font-medium">
                                ✓ Linked to {correlatedScreen.name} elements
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 p-1.5 rounded-md border border-slate-200 hover:border-red-200 transition-colors self-end md:self-auto"
                            title="Delete this screen from flow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Path flow helper text indicator under box */}
                      {idx < steps.length - 1 && (
                        <div className="py-2.5 pl-6 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 font-mono">
                          <span>THEN action "</span>
                          <span className="text-slate-600 font-bold">{step.actionText || 'Tap Next'}</span>
                          <span>" navigates to Screen {idx + 2}...</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
