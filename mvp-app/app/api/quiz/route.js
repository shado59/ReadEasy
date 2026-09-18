import OpenAI from "openai";

export async function POST(req) {
  try {
    const { contextText, existingQuestions } = await req.json();

    const prompt = `
      You are an engaging assistant creating quizzes for students.
      Context text: "${contextText}"
      
      These questions already exist, DO NOT repeat them:
      ${JSON.stringify(existingQuestions)}
      
      Generate EXACTLY 3 NEW multiple-choice questions based on the context text.
      Return a JSON object with a single key "questions" containing an array EXACTLY like this:
      {
        "questions": [
          {
            "question": "Question 1? (Include an emoji)",
            "options": ["Option A", "Option B", "Option C"],
            "correctAnswer": 0
          }
        ]
      }
    `;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set.");
    }

    const groq = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content;
    const data = JSON.parse(resultText);

    const finalData = Array.isArray(data) ? data : (data.questions || []);

    return Response.json(finalData);
  } catch (error) {
    console.error("Groq API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
