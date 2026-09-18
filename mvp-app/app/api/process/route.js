import OpenAI from "openai";

const MOCK_DATA = [
  {
    "original": [
      { "title": "Photosynthesis Overview", "text": "Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that can later be released to fuel the organism's metabolic activities." },
      { "title": "Chemical Energy", "text": "This chemical energy is stored in carbohydrate molecules, such as sugars, which are synthesized from carbon dioxide and water." }
    ],
    "simple": [
      { "title": "Making Food 🌿", "text": "Photosynthesis is how plants make their own food using sunlight." },
      { "title": "Ingredients 💧", "text": "Plants need sunlight, water, and air (carbon dioxide) to make sugar for energy." }
    ],
    "verySimple": [
      { "title": "Plant Food ✨", "text": "Plants make food from the sun." },
      { "title": "Why we care 🫁", "text": "This gives us oxygen to breathe!" }
    ],
    "questions": [
      { "question": "What do plants use for energy? ☀️", "options": ["Sunlight", "Dirt", "Rocks"], "correctAnswer": 0 },
      { "question": "What is the main food plants make? 🍬", "options": ["Water", "Sugar", "Salt"], "correctAnswer": 1 },
      { "question": "What do plants release that humans need? 🌬️", "options": ["Carbon dioxide", "Oxygen", "Nitrogen"], "correctAnswer": 1 }
    ]
  },
  {
    "original": [
      { "title": "The Solar System", "text": "The Solar System is the gravitationally bound system of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud." },
      { "title": "Planetary Composition", "text": "The inner planets—Mercury, Venus, Earth and Mars—are terrestrial planets, being composed primarily of rock and metal." }
    ],
    "simple": [
      { "title": "Our Cosmic Home 🪐", "text": "The Solar System includes the Sun and everything going around it, like planets." },
      { "title": "Rocky Planets 🪨", "text": "The inner planets closest to the Sun are made of solid rock and metal." }
    ],
    "verySimple": [
      { "title": "The Sun ✨", "text": "Our solar system has one star, the Sun." },
      { "title": "Earth 🌍", "text": "Earth is the third planet from the Sun." }
    ],
    "questions": [
      { "question": "What is at the center of our Solar System? ☀️", "options": ["Earth", "The Sun", "Jupiter"], "correctAnswer": 1 },
      { "question": "What are the inner planets mostly made of? 🪨", "options": ["Gas", "Water", "Rock and metal"], "correctAnswer": 2 },
      { "question": "How many stars are in our Solar System? ⭐", "options": ["One", "Ten", "Billions"], "correctAnswer": 0 }
    ]
  }
];

export async function POST(req) {
  try {
    const { text, files, customInstruction } = await req.json();

    const prompt = `
      You are an engaging and highly helpful assistant for students with dyslexia or those learning English.
      Input text: "${text || "Read the text from the provided images or PDFs"}"
      
      ${customInstruction ? \`SPECIAL INSTRUCTION FROM USER: "\${customInstruction}"\\nEnsure you follow this instruction strictly while structuring the response.\` : ""}
      
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
    if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

    const groq = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

    const hasImage = files && files.length > 0 && files.some(f => f.base64);
    const selectedModel = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

    let messageContent = prompt;
    
    if (hasImage) {
      messageContent = [{ type: "text", text: prompt }];
      files.forEach(file => {
        if (file.base64) {
          const base64Data = file.base64.includes(',') ? file.base64.split(',')[1] : file.base64;
          messageContent.push({
            type: "image_url",
            image_url: {
              url: \`data:\${file.mimeType};base64,\${base64Data}\`
            }
          });
        }
      });
    }

    const requestOptions = {
      messages: [{ role: "user", content: messageContent }],
      model: selectedModel,
    };

    if (!hasImage) {
      requestOptions.response_format = { type: "json_object" };
    }

    const completion = await groq.chat.completions.create(requestOptions);

    let resultText = completion.choices[0].message.content.trim();
    
    if (resultText.startsWith("\`\`\`json")) {
      resultText = resultText.substring(7, resultText.length - 3).trim();
    } else if (resultText.startsWith("\`\`\`")) {
      resultText = resultText.substring(3, resultText.length - 3).trim();
    }

    const data = JSON.parse(resultText);
    return Response.json(data);
  } catch (error) {
    console.error("Groq API Error, running MOCK FALLBACK:", error.message);
    await new Promise(res => setTimeout(res, 3500));
    return Response.json(MOCK_DATA[Math.floor(Math.random() * MOCK_DATA.length)], {
      headers: { 'X-Is-Mock': 'true' }
    });
  }
}
