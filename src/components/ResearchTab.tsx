import React, { useState } from 'react';
import { ResearchPlan, Persona } from '../types';
import { fetchResearchPlan, fetchPersonas } from '../api';
import { 
  Users, 
  HelpCircle, 
  Lightbulb, 
  Sparkles, 
  Plus, 
  Trash2, 
  UserPlus, 
  Quote, 
  Target, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

interface Props {
  appTheme: string;
  setAppTheme: React.Dispatch<React.SetStateAction<string>>;
  research: ResearchPlan;
  setResearch: React.Dispatch<React.SetStateAction<ResearchPlan>>;
  personas: Persona[];
  setPersonas: React.Dispatch<React.SetStateAction<Persona[]>>;
}

export default function ResearchTab({ 
  appTheme, 
  setAppTheme, 
  research, 
  setResearch, 
  personas, 
  setPersonas 
}: Props) {
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Persona Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaRole, setNewPersonaRole] = useState('');
  const [newPersonaAge, setNewPersonaAge] = useState<number>(30);
  const [newPersonaQuote, setNewPersonaQuote] = useState('');
  const [newPersonaGoal, setNewPersonaGoal] = useState('');
  const [newPersonaPainPoint, setNewPersonaPainPoint] = useState('');

  // Manual Need input state
  const [newNeed, setNewNeed] = useState('');

  const triggerResearchFetch = async () => {
    if (!appTheme.trim()) {
      setError('Please provide a basic application concept to research.');
      return;
    }
    setLoadingResearch(true);
    setError(null);
    try {
      const plan = await fetchResearchPlan(appTheme);
      setResearch(plan);
    } catch (err: any) {
      setError(err.message || 'Failed to conduct user research suggestions.');
    } finally {
      setLoadingResearch(false);
    }
  };

  const triggerPersonasFetch = async () => {
    if (!appTheme.trim()) {
      setError('Specify an application concept first.');
      return;
    }
    const needsSource = research.userNeeds.length > 0 
      ? research.userNeeds 
      : ['General ease of mobile flow navigation'];
      
    setLoadingPersonas(true);
    setError(null);
    try {
      const result = await fetchPersonas(appTheme, needsSource);
      setPersonas(result.personas);
    } catch (err: any) {
      setError(err.message || 'Failed to generate user persona mockups.');
    } finally {
      setLoadingPersonas(false);
    }
  };

  const handleAddManualNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeed.trim()) return;
    setResearch(prev => ({
      ...prev,
      userNeeds: [...prev.userNeeds, newNeed.trim()]
    }));
    setNewNeed('');
  };

  const handleRemoveNeed = (index: number) => {
    setResearch(prev => ({
      ...prev,
      userNeeds: prev.userNeeds.filter((_, idx) => idx !== index)
    }));
  };

  const handleAddManualPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonaName.trim() || !newPersonaRole.trim() || !newPersonaGoal.trim()) {
      setError('Please fill in Name, Role, and main Goal for the persona.');
      return;
    }

    const persona: Persona = {
      id: `p-manual-${Date.now()}`,
      name: newPersonaName.trim(),
      role: newPersonaRole.trim(),
      age: Number(newPersonaAge) || 30,
      quote: newPersonaQuote.trim() || 'I want a frictionless custom experience.',
      goal: newPersonaGoal.trim(),
      painPoint: newPersonaPainPoint.trim() || 'System complexity is overwhelming.'
    };

    setPersonas(prev => [...prev, persona]);
    
    // Clear Form
    setNewPersonaName('');
    setNewPersonaRole('');
    setNewPersonaAge(30);
    setNewPersonaQuote('');
    setNewPersonaGoal('');
    setNewPersonaPainPoint('');
    setShowAddForm(false);
    setError(null);
  };

  const handleDeletePersona = (id: string) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* App Topic Definition Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2">Define Your Mobile Application Theme</h3>
        <p className="text-xs text-slate-500 mb-4">
          Provide your target product theme or pitch below. Gemini AI will assist you in defining user frameworks.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={appTheme}
            onChange={(e) => setAppTheme(e.target.value)}
            placeholder="e.g., Local pet adoption finder with video bios"
            className="flex-1 text-sm px-3.5 py-2.5 border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-sans"
          />
          <button
            onClick={triggerResearchFetch}
            disabled={loadingResearch || !appTheme.trim()}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-5 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loadingResearch ? 'Researching...' : 'Conduct User Research'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: User Research vs Personas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Column Left: User Research Frame */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-slate-900 text-sm">User Research Framework</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Suggested Questions</span>
            </div>

            {research.questions.length === 0 ? (
              <div className="text-center py-10 px-4 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <HelpCircle className="w-7 h-7 text-slate-350 stroke-1" />
                <p>Click "Conduct Research" above to have Gemini prepare target questions, needs, and audience blueprints.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Target Audience Summary */}
                {research.targetAudience && (
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Audience Profile</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">{research.targetAudience}</p>
                  </div>
                )}

                {/* Interview Questions */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Key Research Interview Questions</span>
                  <div className="space-y-2">
                    {research.questions.map((question, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-white border border-slate-100 rounded-lg">
                        <span className="text-[10px] bg-slate-150 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                          Q{idx + 1}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans italic">"{question}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Needs Tracker */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <h4 className="font-bold text-slate-900 text-sm">Defined User Needs</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Total: {research.userNeeds.length}</span>
            </div>

            {/* Quick manual need insertion */}
            <form onSubmit={handleAddManualNeed} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add customized need/requirement (e.g. Offline tracking)"
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
                className="flex-1 text-xs px-2.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!newNeed.trim()}
                className="px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </form>

            <div className="space-y-2">
              {research.userNeeds.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">No defined user needs recorded. Formulate them with Gemini or type one above.</p>
              ) : (
                research.userNeeds.map((need, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-xs hover:border-slate-350 transition-all">
                    <div className="flex gap-2 items-center">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />
                      <span className="text-slate-700 font-sans">{need}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveNeed(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Delete need item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column Right: User Personas Profile Space */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-slate-900 text-sm">Interactive User Personas</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPersonasFetch}
                  disabled={loadingPersonas || !appTheme.trim()}
                  className="flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 border border-slate-250 font-semibold px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-600" />
                  <span>{loadingPersonas ? 'Generating...' : 'AI Generate (2)'}</span>
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 text-[10px] text-white bg-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>Add Manual</span>
                </button>
              </div>
            </div>

            {/* Manual Persona Addition Form */}
            {showAddForm && (
              <form onSubmit={handleAddManualPersona} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 space-y-3">
                <h5 className="text-xs font-bold text-slate-800 block">Create Custom User Persona</h5>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g. Jack R.)"
                    value={newPersonaName}
                    onChange={(e) => setNewPersonaName(e.target.value)}
                    className="col-span-1 text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Busy Dad)"
                    value={newPersonaRole}
                    onChange={(e) => setNewPersonaRole(e.target.value)}
                    className="col-span-1 text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={newPersonaAge}
                    onChange={(e) => setNewPersonaAge(Number(e.target.value))}
                    className="col-span-1 text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Memo quote (e.g. I hate wasting precious minutes looking up options)"
                  value={newPersonaQuote}
                  onChange={(e) => setNewPersonaQuote(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <textarea
                    placeholder="Core Goal (What do they want to achieve with this app?)"
                    value={newPersonaGoal}
                    onChange={(e) => setNewPersonaGoal(e.target.value)}
                    rows={2}
                    className="text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                    required
                  />
                  <textarea
                    placeholder="Primary Pain Point (What blocks them?)"
                    value={newPersonaPainPoint}
                    onChange={(e) => setNewPersonaPainPoint(e.target.value)}
                    rows={2}
                    className="text-xs p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs text-white bg-slate-950 font-semibold rounded hover:bg-slate-800"
                  >
                    Save Persona
                  </button>
                </div>
              </form>
            )}

            {/* Persona Cards Loop */}
            <div className="space-y-4">
              {personas.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <UserPlus className="w-8 h-8 text-slate-350 stroke-1" />
                  <p>No user personas created. Click "AI Generate" above or add a manual user profile to structure your persona guidelines.</p>
                </div>
              ) : (
                personas.map((persona) => (
                  <div key={persona.id} className="p-4 border border-slate-200 hover:border-slate-350 rounded-xl bg-white shadow-sm hover:shadow-md transition-all group relative">
                    {/* Delete trigger */}
                    <button
                      onClick={() => handleDeletePersona(persona.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-50"
                      title="Remove persona"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-sm font-bold border border-slate-200 flex-shrink-0">
                        {persona.name.charAt(0)}
                      </div>
                      <div className="space-y-2 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{persona.name}</span>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              Age {persona.age}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">{persona.role}</span>
                        </div>

                        {persona.quote && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border-l-2 border-slate-400 flex items-start gap-1">
                            <Quote className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-slate-600 leading-normal italic font-sans">{persona.quote}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                              <Target className="w-3 h-3 text-slate-600" /> Goal / Motivator:
                            </span>
                            <p className="text-xs text-slate-800 leading-relaxed font-sans">{persona.goal}</p>
                          </div>
                          <span className="hidden md:block border-r border-slate-100" />
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-slate-500" /> Core Frustration:
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{persona.painPoint}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
