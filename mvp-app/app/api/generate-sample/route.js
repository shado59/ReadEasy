import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

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
      
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        data = result.response.text().trim();
        break; 
      } catch (err) {
        console.error("Sample API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw lastError || new Error("All API keys failed.");
    }

    return Response.json({ text: data }, { status: 200 });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: "Our AI servers are currently busy. Please try again later or provide your own Gemini API key below to continue." },
      { status: 500 }
    );
  }
}
