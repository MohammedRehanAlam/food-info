import type { ProviderType } from '../context/ApiContext';

export interface NutritionInfo {
  foodName: string;
  confidenceScore: number;
  servingSize: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  ingredients: string[];
  healthBenefits: string;
  funFact: string;
}

const SYSTEM_PROMPT = `You are an expert nutritionist. Analyze the provided image of food. Identify the food and estimate its comprehensive nutritional content.
You MUST respond with a valid JSON object in the exact following format, without any markdown formatting, backticks, or extra text:
{
  "foodName": "Name of the dish/food",
  "confidenceScore": 95,
  "servingSize": "Estimated serving size (e.g., 1 cup, 200g)",
  "calories": "Estimated calories (e.g., 350 kcal)",
  "protein": "Estimated protein (e.g., 20g)",
  "carbs": "Estimated carbohydrates (e.g., 40g)",
  "fat": "Estimated fat (e.g., 15g)",
  "fiber": "Estimated fiber (e.g., 5g)",
  "sugar": "Estimated sugar (e.g., 10g)",
  "sodium": "Estimated sodium (e.g., 400mg)",
  "ingredients": ["List", "of", "estimated", "main", "ingredients"],
  "healthBenefits": "A short 1-3 sentence description of the main health benefits or drawbacks.",
  "funFact": "A fascinating historical fact, cultural origin story, or fun trivia about this dish."
}`;

export const analyzeImage = async (
  base64Image: string,
  provider: ProviderType,
  apiKey: string,
  model: string
): Promise<NutritionInfo> => {
  if (!apiKey) throw new Error(`API key for ${provider} is missing.`);
  if (!model) throw new Error(`Model for ${provider} is missing.`);
  
  // Clean base64 string
  const base64Data = base64Image.split(',')[1] || base64Image;

  try {
    let jsonResponse = '';

    if (provider === 'google') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: SYSTEM_PROMPT },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      jsonResponse = data.candidates[0].content.parts[0].text;
    } else if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: SYSTEM_PROMPT },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      jsonResponse = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Data } },
                { type: 'text', text: SYSTEM_PROMPT }
              ]
            }
          ]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      jsonResponse = data.content[0].text;
    } else if (['openrouter', 'groq', 'xai', 'qwen', 'deepseek'].includes(provider)) {
      const endpoints: Record<string, string> = {
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        xai: 'https://api.x.ai/v1/chat/completions',
        qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions'
      };

      const url = endpoints[provider];
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: SYSTEM_PROMPT },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
              ]
            }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      jsonResponse = data.choices[0].message.content;
    }

    const cleanJson = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as NutritionInfo;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error(error.message || 'Failed to analyze image. Please check your API key and try again.');
  }
};

export const verifyConnection = async (provider: ProviderType, apiKey: string, model: string): Promise<boolean> => {
  if (!apiKey || !model) throw new Error("API key and model are required for verification.");

  const TEST_PROMPT = "Respond with exactly the word OK";

  try {
    if (provider === 'google') {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: TEST_PROMPT }] }] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return true;
    } else if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: TEST_PROMPT }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return true;
    } else {
      // OpenAI Compatible
      const endpoints: Record<string, string> = {
        openai: 'https://api.openai.com/v1/chat/completions',
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        groq: 'https://api.groq.com/openai/v1/chat/completions',
        xai: 'https://api.x.ai/v1/chat/completions',
        qwen: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions'
      };

      const response = await fetch(endpoints[provider], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: TEST_PROMPT }],
          max_tokens: 10
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return true;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Verification failed');
  }
};
