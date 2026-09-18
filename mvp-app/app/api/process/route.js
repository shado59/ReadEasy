import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

export async function POST(req) {
  try {
    const { text, files, customInstruction } = await req.json();

    const prompt = `
      You are an engaging and highly helpful assistant for students with dyslexia or those learning English.
      Input text: "${text || "Read the text from the provided images or PDFs"}"
      
      ${customInstruction ? `SPECIAL INSTRUCTION FROM USER: "${customInstruction}"\nEnsure you follow this instruction strictly while structuring the response.` : ""}
      
      Instead of long text, break down the information into logical, bite-sized sections (like slides in a presentation).
      Return a JSON object EXACTLY like this:
      {
        "original": [
          { "title": "Section 1", "text": "First part of the exact original text..." },
          { "title": "Section 2", "text": "Second part..." }
        ],
        "simple": [
          { "title": "Main Idea 🌟", "text": "A simplified, easy-to-read version. Use emojis." },
          { "title": "Details 📚", "text": "More simplified details..." }
        ],
        "verySimple": [
          { "title": "What it is ✨", "text": "Very short and basic version." },
          { "title": "Why it matters 💡", "text": "Short sentences only." }
        ],
        "questions": [
          {
            "question": "Question 1? (Include an emoji)",
            "options": ["Option A", "Option B", "Option C"],
            "correctAnswer": 0
          }
        ]
      }
      Provide exactly 3 questions. Ensure the text is structured beautifully.
    `;

    let parts = [prompt];

    if (files && files.length > 0) {
      files.forEach(file => {
        if (file.base64) {
          parts.push({
            inlineData: {
              data: file.base64.split(',')[1],
              mimeType: file.mimeType
            }
          });
        }
      });
    }

    let data = null;
    let lastError = null;

    for (const key of API_KEYS) {
      if (!key || key.startsWith("YOUR_")) continue;

      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({
          model: "gemini-3.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(parts);
        data = JSON.parse(result.response.text());
        break; // Success! Break out of the fallback loop
      } catch (err) {
        console.error("API Key failed:", err.message);
        lastError = err;
        // loop continues to the next key
      }
    }

    if (!data) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
