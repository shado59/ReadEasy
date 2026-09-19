import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

const MODELS_TO_TRY = ["gemini-3.8-flash"];

export async function POST(req) {
  try {
    const body = await req.json();
    const { questions, userAnswers, originalText } = body;
    const userApiKey = req.headers.get("x-user-api-key");

    if (!questions || !userAnswers || !originalText) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const wrongAnswersContext = questions.map((q, idx) => {
      if (userAnswers[idx] !== q.correctAnswer) {
        return `Question: ${q.question}\nCorrect Answer: ${q.options[q.correctAnswer]}\nUser's Wrong Answer: ${q.options[userAnswers[idx]]}`;
      }
      return null;
    }).filter(x => x !== null).join("\n\n");

    const prompt = `
      You are an expert, highly encouraging tutor. The user just took a quiz based on a text and got some questions wrong.
      
      Original Text:
      "${originalText}"

      Here are the questions they got wrong:
      ${wrongAnswersContext}

      Your task is to generate a "Weak Point Analysis Report". 
      For each wrong answer:
      1. Gently explain *why* their answer was incorrect.
      2. Re-explain the core concept from the original text in a very simple, easy-to-understand way.
      3. Do NOT make them feel bad. Use an encouraging tone.

      Format your response strictly as a JSON array of objects, where each object has:
      - "topic": A short title of what they misunderstood (e.g. "Photosynthesis Process")
      - "explanation": The gentle explanation and re-teaching of the concept.

      Return ONLY the raw JSON array. No markdown blocks, no extra text.
    `;

    let data = null;
    let lastError = null;
    const keysToTry = userApiKey ? [userApiKey] : API_KEYS;

    for (const key of keysToTry) {
      if (!key || key.startsWith("YOUR_")) continue;
      
      const ai = new GoogleGenerativeAI(key);
      
      for (const modelName of MODELS_TO_TRY) {
        try {
          const config = { model: modelName };
          if (modelName.includes("1.5")) {
            config.generationConfig = { responseMimeType: "application/json" };
          }
          
          const model = ai.getGenerativeModel(config);
          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          
          data = JSON.parse(rawText.replace(/```json\n?|```/g, '').trim());
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

    const finalReport = Array.isArray(data) ? data : (data.report || Object.values(data)[0] || []);
    return Response.json(finalReport);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: `API Error: ${error.message} (Please provide your own Gemini API key below to continue)` },
      { status: 500 }
    );
  }
}
