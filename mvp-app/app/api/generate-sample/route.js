import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

export async function GET() {
  try {
    const prompt = `
      Write a highly complex, dense, and academic textbook excerpt (about 350-450 words, around half a page).
      Choose a random scientific or historical topic (e.g., Quantum Mechanics, Neuroscience, Renaissance Art, Astrophysics, Cellular Biology, Macroeconomics).
      The text should have long sentences, advanced vocabulary, and read like a university-level textbook.
      Do not include any intro or outro, just the raw text itself.
    `;

    let data = null;
    let lastError = null;

    for (const key of API_KEYS) {
      if (!key || key.startsWith("YOUR_")) continue;
      
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        data = result.response.text().trim();
        break; // Success
      } catch (err) {
        console.error("Generate Sample API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    return Response.json({ text: data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
