import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { questions, userAnswers, originalText } = body;

    if (!questions || !userAnswers || !originalText) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const API_KEYS = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ];

    // Prepare wrong answers context
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

    let report = null;
    let lastError = null;

    for (const key of API_KEYS) {
      if (!key || key.startsWith("YOUR_")) continue;

      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        let aiText = result.response.text().trim();
        if (aiText.startsWith("```json")) {
          aiText = aiText.substring(7, aiText.length - 3).trim();
        } else if (aiText.startsWith("```")) {
          aiText = aiText.substring(3, aiText.length - 3).trim();
        }

        report = JSON.parse(aiText);
        break; // Success!
      } catch (err) {
        console.error("Report API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!report) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    return Response.json(report);

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to generate report." }, { status: 500 });
  }
}
