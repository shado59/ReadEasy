import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

export async function POST(req) {
  try {
    const { text, files, customInstruction } = await req.json();
    const userApiKey = req.headers.get("x-user-api-key");

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
              data: file.base64.includes(',') ? file.base64.split(',')[1] : file.base64,
              mimeType: file.mimeType
            }
          });
        }
      });
    }

    let data = null;
    let lastError = null;
    const keysToTry = userApiKey ? [userApiKey] : API_KEYS;

    for (const key of keysToTry) {
      if (!key || key.startsWith("YOUR_")) continue;

      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(parts);
        data = JSON.parse(result.response.text());
        break; 
      } catch (err) {
        console.error("API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw lastError || new Error("All API keys failed.");
    }

    return Response.json(data);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: "Our AI servers are currently busy. Please try again later or provide your own Gemini API key below to continue." },
      { status: 500 }
    );
  }
}
