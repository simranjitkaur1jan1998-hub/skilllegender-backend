const { GoogleGenerativeAI } = require("@google/generative-ai");
const learnerMentorModel = require("../learnerMentor/learnerMentorModel");
const skillModel = require("../skills/skillModel");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// const model = genAI.getGenerativeModel({ model: "gemini-flash" });
// ✅ Correct
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// ✅ Correct for the current API
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.send({ success: false, message: "Prompt is required" });
    if (!process.env.GEMINI_API_KEY) {
        return res.send({ success: true, data: "Gemini API Key is not configured." });
    }
    const systemContext = `You are Skill-Ledger AI, a helpful assistant for the Skill-Ledger platform. 
    Skill-Ledger is a peer-to-peer skill swapping platform. Be concise and helpful.`;
    const result = await model.generateContent([systemContext, prompt]);
    const response = await result.response;
    res.send({ success: true, data: response.text() });
  } catch (err) {
    res.send({ success: false, message: "AI error: " + err.message });
  }
};



const recommendSkills = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.send({ success: false, message: "User ID is required" });

    // Get user details with skills
    const user = await learnerMentorModel.findById(userId).populate("skills");
    if (!user) return res.send({ success: false, message: "User not found" });

    const currentSkills = user.skills.map(s => s.name).join(", ");
    
    // Get all available skills in platform
    const allSkills = await skillModel.find({ isDeleted: false, isBlocked: false });
    const availableSkills = allSkills.map(s => s.name).join(", ");

    console.log("currentSkills", currentSkills);
    console.log("availableSkills", availableSkills);

      const prompt = `
      You are an expert learning path architect.
      User currently knows these skills: [${currentSkills}].
      The available skills in our platform are: [${availableSkills}].
      
      Your task is to recommend the 3 most logical "next steps" for this user. 
      Think in terms of natural progression and learning roadmaps (e.g., if they know HTML, recommend CSS; if they know Basic Math, recommend Algebra).
      
      Requirements:
      1. Recommendations must exist in our available skills list if possible, or be highly relevant concepts.
      2. Each recommendation must have a clear "Progression Reason" explaining how it builds on their current skills.
      
      Format your response strictly as a JSON array: [{"skill": "Skill Name", "reason": "Why this is the perfect next step"}]
      Return ONLY the JSON array.
    `;

    // Pass generationConfig to enforce JSON output
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    
    // Now you can parse it directly without Regex cleanup!
    const recommendations = JSON.parse(response.text());

    res.send({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.send({
      success: false,
      message: "Could not generate recommendations: " + err.message
    });
  }
};

module.exports = {
  askAI,
  recommendSkills
};
