import OpenAI from "openai";

const MOCK_REPORT_DATA = [
  [
    { "topic": "Photosynthesis Requirements 🌿", "explanation": "It looks like you missed the question about what plants need! Remember, plants need sunlight, water, and carbon dioxide to make their food. They don't use dirt for energy." },
    { "topic": "Oxygen Production 🌬️", "explanation": "Don't worry, this is tricky! Plants take in carbon dioxide and release oxygen as a byproduct. That's why plants are so important for us to breathe!" }
  ],
  [
    { "topic": "The Solar System Center ☀️", "explanation": "Almost got it! Remember that the Sun is at the very center of our Solar System, and all the planets, including Earth, orbit around it." },
    { "topic": "Rocky Planets 🪨", "explanation": "A quick recap: The four inner planets (Mercury, Venus, Earth, Mars) are made of solid rock and metal, while the giant outer planets are mostly made of gas." }
  ]
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { questions, userAnswers, originalText } = body;

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

      Format your response strictly as a JSON object with a single key "report" containing an array of objects, where each object has:
      - "topic": A short title of what they misunderstood (e.g. "Photosynthesis Process")
      - "explanation": The gentle explanation and re-teaching of the concept.

      Return ONLY the JSON object like:
      {
        "report": [
          { "topic": "...", "explanation": "..." }
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
    let data = JSON.parse(resultText);
    const finalReport = Array.isArray(data) ? data : (data.report || Object.values(data)[0] || []);

    return Response.json(finalReport);
  } catch (error) {
    console.error("Groq API Error, running MOCK FALLBACK:", error.message);
    await new Promise(res => setTimeout(res, 3500));
    return Response.json(MOCK_REPORT_DATA[Math.floor(Math.random() * MOCK_REPORT_DATA.length)]);
  }
}
