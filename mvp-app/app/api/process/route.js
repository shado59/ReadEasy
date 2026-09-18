import OpenAI from "openai";

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
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content;
    const data = JSON.parse(resultText);

    return Response.json(data);
  } catch (error) {
    console.error("Groq API Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
