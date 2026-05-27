import React, { useState } from 'react';
import { WireframeScreen, WireframeElement, WireframeElementType, UserFlowStep } from '../types';
import { fetchWireframeElements } from '../api';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Smartphone, 
  Layout, 
  Edit3, 
  Save, 
  Minimize2, 
  Maximize2,
  Sliders,
  Play,
  StopCircle,
  Hash,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Search,
  CheckSquare,
  Compass,
  Link,
  ChevronLeft
} from 'lucide-react';

interface Props {
  appTheme: string;
  screens: WireframeScreen[];
  setScreens: React.Dispatch<React.SetStateAction<WireframeScreen[]>>;
  steps: UserFlowStep[];
}

export default function WireframeTab({ appTheme, screens, setScreens, steps }: Props) {
  const [activeScreenId, setActiveScreenId] = useState<string>('');
  const [selectedElementId, setSelectedElementId] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatorScreenId, setSimulatorScreenId] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New screen creation form
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDesc, setNewScreenDesc] = useState('');

  // Choose the active screen
  const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0];
  const selectedElement = activeScreen?.elements.find(el => el.id === selectedElementId);

  // Ensure activeScreenId is valid
  React.useEffect(() => {
    if (screens.length > 0 && !activeScreenId) {
      setActiveScreenId(screens[0].id);
    }
  }, [screens, activeScreenId]);

  // Start Simulation Flow
  const startSimulation = () => {
    if (screens.length === 0) {
      setError('Create at least one wireframe screen to simulate.');
      return;
    }
    const startId = activeScreenId || screens[0].id;
    setSimulatorScreenId(startId);
    setIsSimulating(true);
    setError(null);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  // Add a fully-custom Blank Screen
  const handleCreateScreen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;

    const screenId = `scr-${Date.now()}`;
    const newScreen: WireframeScreen = {
      id: screenId,
      name: newScreenName.trim(),
      description: newScreenDesc.trim() || 'A generic application view screen.',
      elements: [
        {
          id: `el-hdr-${Date.now()}`,
          type: 'header',
          x: 15,
          y: 20,
          w: 290,
          h: 40,
          content: newScreenName.trim()
        }
      ]
    };

    setScreens(prev => [...prev, newScreen]);
    setActiveScreenId(screenId);
    setNewScreenName('');
    setNewScreenDesc('');
  };

  // Delete a Screen
  const handleDeleteScreen = (id: string, name: string) => {
    if (confirm(`Do you want to delete wireframe screen "${name}"?`)) {
      setScreens(prev => prev.filter(s => s.id !== id));
      if (activeScreenId === id) {
        const remaining = screens.filter(s => s.id !== id);
        setActiveScreenId(remaining.length > 0 ? remaining[0].id : '');
      }
    }
  };

  // Autocomplete and populate UI elements using Gemini AI UX recommendations
  const handleAIGenerateElements = async () => {
    if (!activeScreen) {
      setError('Please select or create a screen first.');
      return;
    }
    setLoadingAI(true);
    setError(null);
    try {
      const generated = await fetchWireframeElements(
        activeScreen.name, 
        appTheme || 'Mobile App', 
        activeScreen.description
      );
      
      setScreens(prev => prev.map(s => {
        if (s.id === activeScreen.id) {
          return {
            ...s,
            elements: generated
          };
        }
        return s;
      }));
      
      if (generated.length > 0) {
        setSelectedElementId(generated[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to auto-generate elements with AI.');
    } finally {
      setLoadingAI(false);
    }
  };

  // Insert a custom basic Element
  const addElement = (type: WireframeElementType) => {
    if (!activeScreen) return;
    
    // Assign reasonable default sizes & coordinates depending on type
    let w = 120, h = 40, x = 100, y = 200, content = 'UI Component', placeholder = '';
    
    switch (type) {
      case 'header':
        w = 300; h = 45; x = 10; y = 15;
        content = activeScreen.name;
        break;
      case 'navbar':
        w = 300; h = 50; x = 10; y = 500;
        content = 'Home | Search | Profile';
        break;
      case 'button':
        w = 180; h = 40; x = 70; y = 430;
        content = 'Tap Action Button';
        break;
      case 'input':
        w = 280; h = 42; x = 20; y = 240;
        content = 'User Input Field';
        placeholder = 'Enter value here...';
        break;
      case 'card':
        w = 280; h = 130; x = 20; y = 100;
        content = 'Post Card View';
        break;
      case 'image':
        w = 280; h = 120; x = 20; y = 100;
        content = '🖼 image/placeholder';
        break;
      case 'text':
        w = 260; h = 30; x = 30; y = 80;
        content = 'Informative helper label';
        break;
      case 'checkbox':
        w = 200; h = 30; x = 20; y = 350;
        content = 'Accept Conditions';
        break;
      case 'icon':
        w = 40; h = 40; x = 260; y = 25;
        content = '🔔';
        break;
    }

    // Try to stack automatically below highest elements
    if (activeScreen.elements.length > 0 && type !== 'header' && type !== 'navbar') {
      const maxY = Math.max(...activeScreen.elements.map(el => el.y + el.h));
      if (maxY + 15 < 480) {
        y = maxY + 12;
      }
    }

    const newElement: WireframeElement = {
      id: `el-${Date.now()}`,
      type,
      x,
      y,
      w,
      h,
      content,
      placeholder
    };

    setScreens(prev => prev.map(s => {
      if (s.id === activeScreen.id) {
        return {
          ...s,
          elements: [...s.elements, newElement]
        };
      }
      return s;
    }));
    setSelectedElementId(newElement.id);
  };

  // Modify Selected Element properties
  const updateSelectedElement = (updates: Partial<WireframeElement>) => {
    if (!activeScreen || !selectedElement) return;

    setScreens(prev => prev.map(s => {
      if (s.id === activeScreen.id) {
        return {
          ...s,
          elements: s.elements.map(el => {
            if (el.id === selectedElement.id) {
              return { ...el, ...updates };
            }
            return el;
          })
        };
      }
      return s;
    }));
  };

  // Delete an Element
  const deleteElement = (id: string) => {
    if (!activeScreen) return;
    setScreens(prev => prev.map(s => {
      if (s.id === activeScreen.id) {
        return {
          ...s,
          elements: s.elements.filter(el => el.id !== id)
        };
      }
      return s;
    }));
    if (selectedElementId === id) {
      setSelectedElementId('');
    }
  };

  // Quick Preset Layout Templates definitions
  const applyPresetLayout = (preset: 'form' | 'feed' | 'dashboard') => {
    if (!activeScreen) return;
    
    let defaultElements: WireframeElement[] = [];
    const timestamp = Date.now();

    if (preset === 'form') {
      defaultElements = [
        { id: `el-f1-${timestamp}`, type: 'header', x: 10, y: 15, w: 300, h: 45, content: `${activeScreen.name} Form` },
        { id: `el-f2-${timestamp}`, type: 'text', x: 20, y: 75, w: 280, h: 25, content: 'Please enter your profile details.' },
        { id: `el-f3-${timestamp}`, type: 'input', x: 20, y: 115, w: 280, h: 42, content: 'Email Account', placeholder: 'Enter email address' },
        { id: `el-f4-${timestamp}`, type: 'input', x: 20, y: 175, w: 280, h: 42, content: 'User Display Name', placeholder: 'Enter username' },
        { id: `el-f5-${timestamp}`, type: 'checkbox', x: 20, y: 235, w: 280, h: 30, content: 'I agree to the Terms of Service' },
        { id: `el-f6-${timestamp}`, type: 'button', x: 20, y: 290, w: 280, h: 42, content: 'Save Info', linkToScreenId: '' },
        { id: `el-f7-${timestamp}`, type: 'navbar', x: 10, y: 500, w: 300, h: 50, content: 'Home | Profile | Settings' }
      ];
    } else if (preset === 'feed') {
      defaultElements = [
        { id: `el-fd1-${timestamp}`, type: 'header', x: 10, y: 15, w: 250, h: 45, content: 'Activity Feed' },
        { id: `el-fd2-${timestamp}`, type: 'icon', x: 270, y: 18, w: 40, h: 40, content: '🔍' },
        { id: `el-fd3-${timestamp}`, type: 'card', x: 15, y: 75, w: 290, h: 180, content: 'Interactive Post 1: Video Bio profile content details' },
        { id: `el-fd4-${timestamp}`, type: 'card', x: 15, y: 270, w: 290, h: 180, content: 'Interactive Post 2: Community announcement details' },
        { id: `el-fd5-${timestamp}`, type: 'navbar', x: 10, y: 500, w: 300, h: 50, content: 'Explore | Notifications | Help' }
      ];
    } else if (preset === 'dashboard') {
      defaultElements = [
        { id: `el-db1-${timestamp}`, type: 'header', x: 10, y: 15, w: 300, h: 45, content: 'Workspace Analytics' },
        { id: `el-db2-${timestamp}`, type: 'card', x: 15, y: 75, w: 135, h: 90, content: 'Adoptions: 283' },
        { id: `el-db3-${timestamp}`, type: 'card', x: 170, y: 75, w: 135, h: 90, content: 'Active Users: 1,402' },
        { id: `el-db4-${timestamp}`, type: 'image', x: 15, y: 180, w: 290, h: 140, content: '📈 Performance Line Chart' },
        { id: `el-db5-${timestamp}`, type: 'button', x: 15, y: 340, w: 290, h: 45, content: 'Export Full CSV Summary report' },
        { id: `el-db6-${timestamp}`, type: 'navbar', x: 10, y: 500, w: 300, h: 50, content: 'Dashboard | Alerts | Account' }
      ];
    }

    setScreens(prev => prev.map(s => {
      if (s.id === activeScreen.id) {
        return { ...s, elements: defaultElements };
      }
      return s;
    }));
    if (defaultElements.length > 0) {
      setSelectedElementId(defaultElements[0].id);
    }
  };

  // Get active screen in Simulator
  const simulatedScreen = screens.find(s => s.id === simulatorScreenId) || screens[0];

  return (
    <div className="space-y-6">
      {/* Simulation Simulator Modal Frame overlay */}
      {isSimulating && simulatedScreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-8 max-w-4xl w-full">
            {/* Phone Simulator Layout Block */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-widest block">Interactive Live Preview</span>
              
              {/* Outer Phone Structure */}
              <div className="w-[340px] h-[610px] bg-slate-900 border-[10px] border-slate-800 rounded-[50px] shadow-inner relative ring-4 ring-offset-4 ring-offset-slate-950 ring-slate-700/50 flex flex-col overflow-hidden">
                {/* Speaker pill notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-slate-700 rounded-full" />
                </div>
                
                {/* Simulated iPhone Screen content */}
                <div className="flex-1 bg-[#F1F3F5] relative p-1 mt-6 select-none overflow-hidden rounded-[24px]">
                  {/* Outer view frame representing elements relative positioning inside viewport */}
                  {simulatedScreen.elements.map((el) => {
                    let style: React.CSSProperties = {
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.w}px`,
                      height: `${el.h}px`,
                    };

                    const hasLink = !!el.linkToScreenId;

                    return (
                      <div
                        key={el.id}
                        style={style}
                        onClick={() => {
                          if (el.linkToScreenId) {
                            setSimulatorScreenId(el.linkToScreenId);
                          }
                        }}
                        className={`text-slate-900 border flex flex-col justify-center px-2 py-1 text-center transition-all ${
                          hasLink 
                            ? 'cursor-pointer hover:scale-[1.02] hover:bg-slate-100 border-indigo-300 bg-indigo-50/70 border-dashed ring-2 ring-indigo-500/10'
                            : 'border-slate-350 bg-white'
                        } overflow-hidden rounded shadow-[1px_1px_2px_rgba(0,0,0,0.05)]`}
                        title={hasLink ? `Links to ${screens.find(sc => sc.id === el.linkToScreenId)?.name}` : undefined}
                      >
                        {el.type === 'header' && (
                          <span className="text-sm font-bold truncate text-slate-800 border-b border-slate-200 pb-1.5">{el.content}</span>
                        )}
                        {el.type === 'input' && (
                          <div className="text-left">
                            <span className="text-[9px] text-slate-400 block font-medium truncate mb-0.5">{el.content}</span>
                            <div className="bg-slate-50 border border-slate-200 py-1 px-1.5 rounded text-[10px] text-slate-500 text-ellipsis overflow-hidden">
                              {el.placeholder || 'Enter response...'}
                            </div>
                          </div>
                        )}
                        {el.type === 'button' && (
                          <div className="bg-slate-800 border-slate-900 border text-white font-semibold text-[10px] py-1 rounded shadow-sm text-ellipsis overflow-hidden flex items-center justify-center gap-1">
                            <span>{el.content}</span>
                            {hasLink && <ChevronRight className="w-2.5 h-2.5 text-indigo-200" />}
                          </div>
                        )}
                        {el.type === 'card' && (
                          <div className="text-left flex flex-col justify-between h-full">
                            <span className="text-[10px] font-bold text-slate-705 truncate block">{el.content}</span>
                            <p className="text-[9px] text-slate-400 line-clamp-3">Generic mock card summary, visual grid container for sub-elements.</p>
                          </div>
                        )}
                        {el.type === 'image' && (
                          <div className="bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center h-full">
                            <span className="text-[9px] text-slate-400 font-mono italic">Placeholder: {el.content}</span>
                          </div>
                        )}
                        {el.type === 'text' && (
                          <span className="text-[10px] text-slate-600 block text-left truncate leading-relaxed">{el.content}</span>
                        )}
                        {el.type === 'checkbox' && (
                          <div className="flex items-center gap-1 text-left">
                            <div className="w-2.5 h-2.5 border border-slate-300 bg-slate-50 rounded" />
                            <span className="text-[9px] text-slate-600 truncate">{el.content}</span>
                          </div>
                        )}
                        {el.type === 'navbar' && (
                          <div className="flex items-center justify-around h-full font-semibold text-[9px] bg-slate-100 border-t border-slate-300 pt-0.5">
                            {el.content.split('|').map((item, id) => (
                              <span key={id} className="text-slate-700 hover:text-slate-950 font-bold">{item.trim()}</span>
                            ))}
                          </div>
                        )}
                        {el.type === 'icon' && (
                          <span className="text-base flex items-center justify-center">{el.content}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Home Indicator line */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>

            {/* Simulation controllers & details tracker */}
            <div className="w-full md:w-80 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-sidebar-border pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>User Flow Simulator</span>
                  </h3>
                  <button
                    onClick={stopSimulation}
                    className="p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
                    title="Stop Play Simulation"
                  >
                    <StopCircle className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Current Simulator Screen</span>
                    <span className="text-lg font-bold text-white mt-1 block">{simulatedScreen.name}</span>
                    <p className="text-xs text-slate-400 italic mt-1 leading-normal">"{simulatedScreen.description}"</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block font-mono">Interaction Blueprint Tip</span>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      Flow elements highlighted with <span className="text-indigo-400 font-bold">dashed blue borders</span> possess an active link trigger. 
                      Click them inside the phone viewport to test transitions directly!
                    </p>
                  </div>

                  {/* Highlight current logical flow steps that align with this screen */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Mapped Flow Matches</span>
                    {steps.filter(st => st.targetScreenId === simulatedScreen.id).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No formal UX User Flow steps mapped to this layout.</p>
                    ) : (
                      steps.filter(st => st.targetScreenId === simulatedScreen.id).map(st => (
                        <div key={st.id} className="p-2.5 bg-emerald-950/20 border border-emerald-900 rounded-lg text-emerald-300 flex items-start gap-2 text-xs">
                          <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">{st.title}</span>
                            <span className="text-[10px] text-emerald-400/85">Action requirement: "{st.actionText}"</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Reset/Back Simulation Options */}
              <div className="pt-6 border-t border-slate-800 space-y-2.5">
                <span className="text-[10px] text-slate-400 block">Debug / Jump Screen directly</span>
                <div className="flex flex-wrap gap-1.5">
                  {screens.map(scr => (
                    <button
                      key={scr.id}
                      onClick={() => setSimulatorScreenId(scr.id)}
                      className={`text-[10px] px-2.5 py-1 rounded font-medium border cursor-pointer ${
                        simulatorScreenId === scr.id
                          ? 'bg-slate-100 text-slate-950 border-white font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                      }`}
                    >
                      {scr.name}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={stopSimulation}
                  className="w-full mt-4 text-center py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-250 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Return to Component Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Layout Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Wireframe Screens Navigator Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 font-mono">App Screens ({screens.length})</span>
              <button
                onClick={startSimulation}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-slate-900 border border-transparent px-2.5 py-1 rounded shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Simulate App</span>
              </button>
            </div>

            {/* List existing screens */}
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {screens.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No screens available. Add screen templates or define one below.</p>
              ) : (
                screens.map(scr => {
                  const isActive = scr.id === activeScreenId;
                  return (
                    <div
                      key={scr.id}
                      className={`flex items-center justify-between p-2 rounded-lg border group transition-all text-xs ${
                        isActive
                          ? 'border-slate-900 bg-slate-50 font-bold text-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveScreenId(scr.id);
                          setSelectedElementId('');
                        }}
                        className="flex-1 text-left py-1 truncate cursor-pointer font-sans"
                      >
                        {scr.name}
                      </button>
                      <button
                        onClick={() => handleDeleteScreen(scr.id, scr.name)}
                        className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete wireframe design screen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add New Screen Form */}
            <form onSubmit={handleCreateScreen} className="border-t border-slate-150 pt-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-850 block">Create Blank Screen</span>
              <input
                type="text"
                placeholder="e.g. Product Details Screen"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                className="w-full text-xs p-2 border border-slate-250 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none font-sans"
                required
              />
              <input
                type="text"
                placeholder="Brief purpose (e.g., View pet photos)"
                value={newScreenDesc}
                onChange={(e) => setNewScreenDesc(e.target.value)}
                className="w-full text-xs p-2 border border-slate-250 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!newScreenName.trim()}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Create Screen Layout
              </button>
            </form>
          </div>

          {/* Preset Visual Templates for faster wireframing */}
          {activeScreen && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block font-mono border-b border-slate-100 pb-2">Screen Preset Layouts</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Instantly populate standard wireframe structures inside <span className="font-semibold">"{activeScreen.name}"</span>. Overwrites current viewport.
              </p>
              <div className="grid grid-cols-1 gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetLayout('form')}
                  className="p-2 border border-slate-200 text-left rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-medium font-sans flex items-center justify-between cursor-pointer"
                >
                  <span>User Entry Form</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLayout('feed')}
                  className="p-2 border border-slate-200 text-left rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-medium font-sans flex items-center justify-between cursor-pointer"
                >
                  <span>Media & Post Feed</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetLayout('dashboard')}
                  className="p-2 border border-slate-200 text-left rounded-lg text-xs bg-slate-50 hover:bg-slate-100 font-medium font-sans flex items-center justify-between cursor-pointer"
                >
                  <span>Analytics Dashboard</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Central UI Editor: The interactive Phone Viewport Canvas */}
        <div className="xl:col-span-2 flex flex-col items-center">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm w-full max-w-[400px] flex flex-col items-center">
            
            {/* Header info */}
            {activeScreen ? (
              <div className="w-full text-center mb-4 border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Workspace Canvas</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">{activeScreen.name} Wireframe</span>
                <span className="text-xs text-slate-500 italic">"{activeScreen.description}"</span>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                <span>Please select/create a screen from the navigator sidebar to start drawing.</span>
              </div>
            )}

            {/* Simulated Phone canvas wrapper */}
            {activeScreen && (
              <div className="w-[324px] h-[564px] border-[5px] border-slate-800 rounded-[30px] p-0.5 relative bg-slate-100 shadow-md">
                
                {/* Visual phone container viewport */}
                <div className="w-full h-full bg-[#f4f6f8] relative overflow-hidden select-none rounded-[22px]">
                  
                  {activeScreen.elements.map((el) => {
                    const isSelected = el.id === selectedElementId;
                    let style: React.CSSProperties = {
                      position: 'absolute',
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.w}px`,
                      height: `${el.h}px`,
                    };

                    return (
                      <div
                        key={el.id}
                        style={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElementId(el.id);
                        }}
                        className={`text-slate-900 border flex flex-col justify-center px-2 py-1 text-center transition-all ${
                          isSelected
                            ? 'ring-2 ring-indigo-600 border-indigo-600 scale-[1.01] bg-indigo-50/70 z-10'
                            : 'border-slate-300 bg-white hover:border-slate-400 cursor-pointer'
                        } overflow-hidden rounded`}
                      >
                        {el.type === 'header' && (
                          <span className="text-xs font-bold truncate text-slate-800 border-b border-slate-150 pb-1">{el.content}</span>
                        )}
                        {el.type === 'input' && (
                          <div className="text-left">
                            <span className="text-[9px] text-slate-400 block font-medium truncate">{el.content}</span>
                            <div className="bg-slate-50 border border-slate-200 py-0.5 px-1 rounded text-[10px] text-slate-400 text-ellipsis overflow-hidden">
                              {el.placeholder || 'input place...'}
                            </div>
                          </div>
                        )}
                        {el.type === 'button' && (
                          <div className="bg-slate-800 text-white font-semibold text-[10px] py-1 rounded shadow-sm text-ellipsis overflow-hidden">
                            {el.content}
                          </div>
                        )}
                        {el.type === 'card' && (
                          <div className="text-left flex flex-col justify-between h-full py-0.5">
                            <span className="text-[10px] font-bold text-slate-800 truncate block leading-tight">{el.content}</span>
                            <p className="text-[8px] text-slate-400 line-clamp-2">Low-Fidelity structural post card element.</p>
                          </div>
                        )}
                        {el.type === 'image' && (
                          <div className="bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center h-full">
                            <span className="text-[9px] text-slate-400 font-mono italic">{el.content}</span>
                          </div>
                        )}
                        {el.type === 'text' && (
                          <span className="text-[10px] text-slate-500 block text-left truncate">{el.content}</span>
                        )}
                        {el.type === 'checkbox' && (
                          <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 border border-slate-300 bg-slate-50 rounded" />
                            <span className="text-[9px] text-slate-500 truncate">{el.content}</span>
                          </div>
                        )}
                        {el.type === 'navbar' && (
                          <div className="flex items-center justify-around h-full font-semibold text-[8px] bg-slate-100 border-t border-slate-200 pt-0.5">
                            {el.content.split('|').map((item, id) => (
                              <span key={id} className="text-slate-500">{item.trim()}</span>
                            ))}
                          </div>
                        )}
                        {el.type === 'icon' && (
                          <span className="text-xs flex items-center justify-center">{el.content}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Toolbar widgets */}
            {activeScreen && (
              <div className="w-full mt-4 bg-slate-50 border border-slate-150 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2 font-mono">Insert Elements Tool</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => addElement('header')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Header</span>
                  </button>
                  <button onClick={() => addElement('card')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Card</span>
                  </button>
                  <button onClick={() => addElement('input')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Input</span>
                  </button>
                  <button onClick={() => addElement('button')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Button</span>
                  </button>
                  <button onClick={() => addElement('text')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Text</span>
                  </button>
                  <button onClick={() => addElement('image')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Image</span>
                  </button>
                  <button onClick={() => addElement('navbar')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Navbar</span>
                  </button>
                  <button onClick={() => addElement('icon')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Icon/Emoji</span>
                  </button>
                  <button onClick={() => addElement('checkbox')} className="py-1 px-2 border border-slate-200 bg-white text-[11px] font-medium rounded hover:bg-slate-100 flex items-center justify-center gap-1 cursor-pointer">
                    <span>Checkbox</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Columns: AI Layout Co-Pilot & Element Properties Inspector */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* AI Canvas Co-Pilot Layout Auto-Generator */}
          {activeScreen && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-slate-300" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Gemini AI Co-Pilot</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Auto-Generate Low-Fi Wireframe</h3>
              <p className="text-[11px] text-slate-350 leading-relaxed mb-4">
                Let Gemini automatically structure user details, lists, cards, and input fields optimized for this screen.
              </p>
              
              <button
                type="button"
                onClick={handleAIGenerateElements}
                disabled={loadingAI}
                className="w-full flex items-center justify-center gap-1 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
                <span>{loadingAI ? 'Drafting Blueprint...' : 'Draft Mobile Canvas'}</span>
              </button>
            </div>
          )}

          {/* Core Properties Panel / Inspector */}
          {activeScreen && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500 font-mono">Properties Panel</span>
                {selectedElement && (
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                    title="Remove selected element"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {selectedElement ? (
                <div className="space-y-4 text-xs font-sans">
                  {/* Widget classification */}
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-mono">COMPONENT ID</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedElement.id.slice(0, 10)}...</span>
                    <span className="text-[10px] tracking-wider uppercase font-bold bg-slate-200 text-slate-650 px-1.5 py-0.5 rounded ml-2">
                      {selectedElement.type}
                    </span>
                  </div>

                  {/* Positioning Coordinate Metrics */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Layout Coordinates</span>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                          <span>X-Axis (Offset Left)</span>
                          <span className="font-bold">{selectedElement.x} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="280"
                          value={selectedElement.x}
                          onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                          className="w-full accent-slate-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                          <span>Y-Axis (Offset Top)</span>
                          <span className="font-bold">{selectedElement.y} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="480"
                          value={selectedElement.y}
                          onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                          className="w-full accent-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-450 block font-mono mb-1">WIDTH</label>
                          <input
                            type="number"
                            min="10"
                            max="310"
                            value={selectedElement.w}
                            onChange={(e) => updateSelectedElement({ w: Number(e.target.value)  || 20 })}
                            className="w-full p-1 border border-slate-250 rounded font-mono text-center outline-none bg-white font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-450 block font-mono mb-1">HEIGHT</label>
                          <input
                            type="number"
                            min="10"
                            max="500"
                            value={selectedElement.h}
                            onChange={(e) => updateSelectedElement({ h: Number(e.target.value) || 20 })}
                            className="w-full p-1 border border-slate-250 rounded font-mono text-center outline-none bg-white font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Content Label */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Content Text / Content Label</label>
                    <input
                      type="text"
                      value={selectedElement.content}
                      onChange={(e) => updateSelectedElement({ content: e.target.value })}
                      className="w-full p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none font-medium"
                    />
                  </div>

                  {/* Field Placeholder if input type */}
                  {selectedElement.type === 'input' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Placeholder Guide Text</label>
                      <input
                        type="text"
                        value={selectedElement.placeholder || ''}
                        onChange={(e) => updateSelectedElement({ placeholder: e.target.value })}
                        className="w-full p-2 border border-slate-200 bg-white rounded focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  )}

                  {/* Interactive screen navigation mapping */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono flex items-center gap-1">
                      <Link className="w-3.5 h-3.5 text-slate-600" />
                      <span>Screen Navigation Link</span>
                    </label>
                    <p className="text-[10px] text-slate-400 leading-normal mb-1.5">
                      Select target view screen. In Simulator Mode, tapping this component navigates instantly there.
                    </p>
                    <select
                      value={selectedElement.linkToScreenId || ''}
                      onChange={(e) => updateSelectedElement({ linkToScreenId: e.target.value || undefined })}
                      className="w-full p-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold"
                    >
                      <option value="">(None - Non-interactive)</option>
                      {screens.map(scr => (
                        <option key={scr.id} value={scr.id}>{scr.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <span>No element selected. Click on any component inside the central Phone Canvas viewport to refine dimensions, coordinates, labels, and interaction triggers.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
