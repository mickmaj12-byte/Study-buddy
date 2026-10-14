
const allowedModes = ["explain", "summarize", "quiz"];

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const { mode, input, subject = "General", style = "bullet points", count = 5, level = "Medium" } = req.body || {};

  if (!allowedModes.includes(mode)) {
    return res.status(400).json({ error: "Invalid study tool." });
  }
  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Enter a question or study material." });
  }
  if (input.length > 12000) {
    return res.status(413).json({ error: "Keep input under 12,000 characters." });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "Add OPENAI_API_KEY in your hosting settings." });
  }

  let instructions;
  let prompt;

  if (mode === "explain") {
    instructions = "You are a friendly school tutor. Explain clearly step by step, use age-appropriate language, and help the student understand.";
    prompt = `Subject: ${subject}\nQuestion: ${input}`;
  } else if (mode === "summarize") {
    instructions = "Summarize accurately for a student. Use only the supplied material and do not invent facts.";
    prompt = `Make a ${style} summary of these notes:\n${input}`;
  } else {
    instructions = "Create practice questions from the supplied material. Number each question and put an answer key with short explanations at the end.";
    const n = [5, 8, 10].includes(Number(count)) ? Number(count) : 5;
    const difficulty = ["Easy", "Medium", "Challenging"].includes(level) ? level : "Medium";
    prompt = `Create ${n} ${difficulty} practice questions from:\n${input}`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions,
        input: prompt,
        max_output_tokens: 1400
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("AI provider error:", response.status);
      return res.status(502).json({
        error: response.status === 429
          ? "AI usage limit reached. Check API billing."
          : "The AI service could not complete your request."
      });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("AI request failed:", error.message);
    return res.status(502).json({ error: "Could not reach the AI service." });
  }
};
