import { GoogleGenerativeAI } from "@google/generative-ai";

const MOCK_SAMPLE_DATA = [
  "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles. It is the foundation of all quantum physics including quantum chemistry, quantum field theory, quantum technology, and quantum information science. Classical physics, the collection of theories that existed before the advent of quantum mechanics, describes many aspects of nature at an ordinary (macroscopic) scale, but is not sufficient for describing them at small (atomic and subatomic) scales. Most theories in classical physics can be derived from quantum mechanics as an approximation valid at large (macroscopic) scale.",
  "Neuroplasticity, also known as brain plasticity, or neural plasticity, is the ability of neural networks in the brain to change through growth and reorganization. These changes range from individual neuron pathways making new connections, to systematic adjustments like cortical remapping. Examples of neuroplasticity include circuit and network changes that result from learning a new ability, environmental influences, practice, and psychological stress. Neuroplasticity was once thought by neuroscientists to manifest only during childhood, but research in the latter half of the 20th century showed that many aspects of the brain can be altered (or are \"plastic\") even through adulthood."
];

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
        break; 
      } catch (err) {
        console.error("Sample API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    return Response.json({ text: data }, { status: 200 });
  } catch (error) {
    console.error("Gemini API Error, running MOCK FALLBACK:", error.message);
    await new Promise(res => setTimeout(res, 3500));
    return Response.json({ text: MOCK_SAMPLE_DATA[Math.floor(Math.random() * MOCK_SAMPLE_DATA.length)] }, { 
      status: 200,
      headers: { 'X-Is-Mock': 'true' }
    });
  }
}
