import OpenAI from "openai";

const MOCK_QUIZ_DATA = [
  [
    { "question": "What is the primary function of mitochondria? 🔋", "options": ["Digestion", "Energy production", "Photosynthesis"], "correctAnswer": 1 },
    { "question": "Which organelle is known as the control center? 🧠", "options": ["Nucleus", "Ribosome", "Cell Wall"], "correctAnswer": 0 },
    { "question": "What surrounds and protects a plant cell? 🧱", "options": ["Cell Membrane", "Cytoplasm", "Cell Wall"], "correctAnswer": 2 }
  ],
  [
    { "question": "Who painted the Mona Lisa? 🎨", "options": ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso"], "correctAnswer": 1 },
    { "question": "In which city is the Eiffel Tower located? 🗼", "options": ["London", "Rome", "Paris"], "correctAnswer": 2 },
    { "question": "What is the longest river in the world? 🌊", "options": ["Amazon", "Nile", "Yangtze"], "correctAnswer": 1 }
  ]
];

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
    if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

    const groq = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

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
    console.error("Groq API Error, running MOCK FALLBACK:", error.message);
    await new Promise(res => setTimeout(res, 3500));
    return Response.json(MOCK_QUIZ_DATA[Math.floor(Math.random() * MOCK_QUIZ_DATA.length)]);
  }
}
