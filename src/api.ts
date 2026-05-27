import { ResearchPlan, Persona, UserFlowStep, WireframeElement } from './types';

export async function fetchResearchPlan(appTheme: string): Promise<ResearchPlan> {
  const res = await fetch('/api/gemini/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appTheme }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate research plan.');
  }
  return res.json();
}

export async function fetchPersonas(appTheme: string, userNeeds: string[]): Promise<{ personas: Persona[] }> {
  const res = await fetch('/api/gemini/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appTheme, userNeeds }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate user personas.');
  }
  const data = await res.json();
  const personas = (data.personas || []).map((p: any, idx: number) => ({
    ...p,
    id: `p-${Date.now()}-${idx}`
  }));
  return { personas };
}

export async function fetchUserFlow(appTheme: string, personaName: string, personaGoal: string): Promise<UserFlowStep[]> {
  const res = await fetch('/api/gemini/flow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appTheme, personaName, personaGoal }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate user flows.');
  }
  const data = await res.json();
  const steps = (data.steps || []).map((s: any, idx: number) => ({
    ...s,
    id: `step-${Date.now()}-${idx}`
  }));
  return steps;
}

export async function fetchWireframeElements(screenName: string, appTheme: string, description: string): Promise<WireframeElement[]> {
  const res = await fetch('/api/gemini/wireframe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenName, appTheme, description }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate wireframe layout.');
  }
  const data = await res.json();
  const elements = (data.elements || []).map((el: any, idx: number) => ({
    ...el,
    id: `el-${Date.now()}-${idx}`
  }));
  return elements;
}

export async function fetchBrainstormAdvice(
  stage: string,
  context: string,
  appTheme: string
): Promise<{ ideas: string[]; advice: string }> {
  const res = await fetch('/api/gemini/brainstorm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage, context, appTheme }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to gather design think brainstorming.');
  }
  return res.json();
}
