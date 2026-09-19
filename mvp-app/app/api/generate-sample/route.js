import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

const MODELS_TO_TRY = ["gemini-3.8-flash"];

export async function GET(req) {
  try {
    const userApiKey = req.headers.get("x-user-api-key");

    const prompt = `
      Write a highly complex, dense, and academic textbook excerpt (about 350-450 words, around half a page).
      Choose a random scientific or historical topic (e.g., Quantum Mechanics, Neuroscience, Renaissance Art, Astrophysics, Cellular Biology, Macroeconomics).
      The text should have long sentences, advanced vocabulary, and read like a university-level textbook.
      Do not include any intro or outro, just the raw text itself.
    `;

    let data = null;
    let lastError = null;
    const keysToTry = userApiKey ? [userApiKey] : API_KEYS;

    for (const key of keysToTry) {
      if (!key || key.startsWith("YOUR_")) continue;
      
      const ai = new GoogleGenerativeAI(key);
      
      for (const modelName of MODELS_TO_TRY) {
        try {
          const model = ai.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          data = result.response.text().trim();
          break; 
        } catch (err) {
          console.error(`[${modelName}] failed with key ${key.substring(0, 5)}... :`, err.message);
          lastError = err;
        }
      }
      if (data) break;
    }

    if (!data) {
      throw lastError || new Error("All API keys and models failed.");
    }

    return Response.json({ text: data }, { status: 200 });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: `API Error: ${error.message} (Please provide your own Gemini API key below to continue)` },
      { status: 500 }
    );
  }
}
