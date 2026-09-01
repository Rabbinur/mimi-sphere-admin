const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ================= GEMINI =================
const callGemini = async (
  prompt: string,
  retry = 2,
): Promise<string | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if ((res.status === 503 || res.status === 429) && retry > 0) {
        console.log("Gemini busy → retry");
        await sleep(1500);
        return callGemini(prompt, retry - 1);
      }
      throw new Error(data?.error?.message);
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err: any) {
    console.log("Gemini failed:", err.message);
    return null;
  }
};

// ================= OPENROUTER =================
const callOpenRouter = async (prompt: string): Promise<string | null> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return null;
    }

    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Shopping Cart BD",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "OpenRouter error");
    }

    return data?.choices?.[0]?.message?.content;
  } catch (err: any) {
    console.log("OpenRouter failed:", err.message);
    return null;
  }
};

// ================= MAIN =================
export const askAI = async (prompt: string): Promise<string> => {
  const gemini = await callGemini(prompt);
  if (gemini) return gemini;

  const openRouter = await callOpenRouter(prompt);
  if (openRouter) return openRouter;

  return "Server busy 😅 পরে আবার চেষ্টা করুন";
};
