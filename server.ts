import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Generate Research plan & needs
app.post('/api/gemini/research', async (req: Request, res: Response) => {
  try {
    const { appTheme } = req.body;
    if (!appTheme) {
      return res.status(400).json({ error: 'appTheme is required' });
    }

    const ai = getAI();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are an expert UX Researcher. Based on the target application concept or theme: "${appTheme}", conduct a basic user research framework. Create 4 key interview questions, define the typical target audience profile, and outline 4 major user needs. Ensure your feedback is practical, grounded, and concise.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['questions', 'targetAudience', 'userNeeds'],
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 4 user interview / research questions.'
            },
            targetAudience: {
              type: Type.STRING,
              description: 'Brief summary of the ideal target audience.'
            },
            userNeeds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 4 core user needs extracted from research.'
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Research formulation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate research context' });
  }
});

// API: Generate Personas
app.post('/api/gemini/personas', async (req: Request, res: Response) => {
  try {
    const { appTheme, userNeeds } = req.body;
    if (!appTheme) {
      return res.status(400).json({ error: 'appTheme is required' });
    }

    const ai = getAI();
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are a professional UX Designer. For the app concept: "${appTheme}" and core user needs: "${Array.isArray(userNeeds) ? userNeeds.join(', ') : userNeeds}", generate 2 highly descriptive and contrasting user personas who will use this application. Include realistic demographic details, a memorable quote, core goal, and primary pain point.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['personas'],
          properties: {
            personas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['name', 'role', 'age', 'quote', 'goal', 'painPoint'],
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'Occupational or user role (e.g. Busy Working Parent, Amateur Pet Owner)' },
                  age: { type: Type.INTEGER },
                  quote: { type: Type.STRING, description: 'A realistic direct quote showcasing their attitude.' },
                  goal: { type: Type.STRING, description: 'Their single primary goal regarding this app.' },
                  painPoint: { type: Type.STRING, description: 'Their primary frustration/pain point.' }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Persona generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate user personas' });
  }
});

// API: Generate User Flow steps
app.post('/api/gemini/flow', async (req: Request, res: Response) => {
  try {
    const { appTheme, personaName, personaGoal } = req.body;
    if (!appTheme) {
      return res.status(400).json({ error: 'appTheme is required' });
    }

    const ai = getAI();
    const prompt = `Establish an interactive step-by-step sequential User Flow representing the typical application path for a user named "${personaName || 'Ideal User'}" whose goal is "${personaGoal || 'to navigate the app efficiently'}". The overall app theme is "${appTheme}". Provide exactly 4 sequential steps with screen titles, descriptions, and the primary action button text that triggers transition to the next screen.`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['steps'],
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['title', 'description', 'actionText'],
                properties: {
                  title: { type: Type.STRING, description: 'Title of the screen in this step.' },
                  description: { type: Type.STRING, description: 'What the user does/sees on this screen.' },
                  actionText: { type: Type.STRING, description: 'Text of the button/trigger to transition forward (e.g., "Submit Form", "Tap Login").' }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('User flow generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate user flows' });
  }
});

// API: Generate Mock Wireframe elements from screen prompt
app.post('/api/gemini/wireframe', async (req: Request, res: Response) => {
  try {
    const { screenName, appTheme, description } = req.body;
    if (!screenName || !appTheme) {
      return res.status(400).json({ error: 'screenName and appTheme are required' });
    }

    const ai = getAI();
    const prompt = `You are a UX/UI wireframe designer drafted on low-fidelity elements. For the mobile screen named "${screenName}" in the app "${appTheme}" (Screen context: "${description || 'General user view'}"), design a low-fidelity wireframe. Respond with a list of simple structural UI components to place inside this mobile viewport (assumed outer frame: 320px wide by 560px tall).
Elements are placed in relative pixel grids (x: 0-320, y: 0-560).
Coordinate ranges: x: 10 to 310, y: 30 to 520. Keep them tidy. Make sure they do not overlap.
Supported types: 'header' | 'input' | 'button' | 'card' | 'image' | 'text' | 'checkbox' | 'navbar' | 'icon'
Return exactly 5 to 7 logical components (for example: a navigation/header, inputs, standard content card, descriptive texts, actions buttons, or lower menu navigation).`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['elements'],
          properties: {
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['type', 'x', 'y', 'w', 'h', 'content'],
                properties: {
                  type: { 
                    type: Type.STRING, 
                    description: 'Type of standard low-fi wireframe component: header, input, button, card, image, text, checkbox, navbar, icon' 
                  },
                  x: { type: Type.INTEGER, description: 'X position from 0 to 320' },
                  y: { type: Type.INTEGER, description: 'Y position from 0 to 560' },
                  w: { type: Type.INTEGER, description: 'Width in pixels' },
                  h: { type: Type.INTEGER, description: 'Height in pixels' },
                  content: { type: Type.STRING, description: 'The text label, title, or button text to display inside the component.' },
                  placeholder: { type: Type.STRING, description: 'Optional helper text or input placeholder' }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Wireframe generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate visual components' });
  }
});

// API: Design Thinking Brainstorm Advice
app.post('/api/gemini/brainstorm', async (req: Request, res: Response) => {
  try {
    const { stage, context, appTheme } = req.body;
    if (!stage || !appTheme) {
      return res.status(400).json({ error: 'stage and appTheme are required' });
    }

    const ai = getAI();
    let prompt = `You are a design thinker and coach. Brainstorm insights and suggest action items for the "${stage.toUpperCase()}" phase of the Design Thinking process for the app project: "${appTheme}". Related context: "${context || 'General conceptual planning'}". Generate 3 highly specific, creative ideation points and 1 professional advice overview.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['ideas', 'advice'],
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concrete ideas or action items for this stage.'
            },
            advice: {
              type: Type.STRING,
              description: 'UX designer coaching tip/guidance.'
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(result.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Coaching brainstorm error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI brainstorm advice' });
  }
});

// Vite & Static file handler integration
async function runServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

runServer();
