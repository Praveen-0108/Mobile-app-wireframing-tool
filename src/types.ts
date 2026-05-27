export interface Persona {
  id: string;
  name: string;
  role: string;
  age: number;
  quote: string;
  goal: string;
  painPoint: string;
}

export interface ResearchPlan {
  questions: string[];
  targetAudience: string;
  userNeeds: string[];
}

export interface UserFlowStep {
  id: string;
  title: string;
  description: string;
  actionText: string;
  targetScreenId?: string; // Links this step directly to a wireframe screen
}

export type WireframeElementType = 
  | 'header' 
  | 'input' 
  | 'button' 
  | 'card' 
  | 'image' 
  | 'text' 
  | 'checkbox' 
  | 'navbar' 
  | 'icon';

export interface WireframeElement {
  id: string;
  type: WireframeElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  placeholder?: string;
  linkToScreenId?: string; // Clicking this element in simulator routes to another screen
}

export interface WireframeScreen {
  id: string;
  name: string;
  description: string;
  elements: WireframeElement[];
}

export interface DesignThinkingLog {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DesignThinkingStage {
  stage: 'empathize' | 'define' | 'ideate' | 'prototype' | 'test';
  notes: string;
  logs: DesignThinkingLog[];
  brainstormIdeas: string[];
  brainstormAdvice: string;
}
