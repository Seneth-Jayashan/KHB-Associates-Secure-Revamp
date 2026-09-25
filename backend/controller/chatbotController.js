require('dotenv').config();

// CWE-798 remediation: the Gemini API key lives only on the server (GEMINI_API_KEY in backend/.env)
// and is sent to Google in the x-goog-api-key header. It is never placed in a URL, logged,
// or returned to the browser.
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const MAX_MESSAGE_LENGTH = 500;
const MAX_OUTPUT_TOKENS = 512;
const UPSTREAM_TIMEOUT_MS = 30000;

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY is not set - /api/chatbot/message will return 503.');
}

// Only allow a plain model name so the env value can never alter the request path
const getModel = () => {
  const model = process.env.GEMINI_MODEL;
  return model && /^[A-Za-z0-9._-]+$/.test(model) ? model : DEFAULT_MODEL;
};

exports.sendMessage = async (req, res) => {
  const message = req.body && req.body.message;

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'A message is required.' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res
      .status(400)
      .json({ message: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'Chatbot service is currently unavailable.' });
  }

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/${getModel()}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message.trim() }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      // Log only the status - never the request, headers or upstream body
      console.error(`❌ chatbot upstream error: HTTP ${response.status}`);
      return res.status(502).json({ message: 'Chatbot service is currently unavailable.' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      console.error(`❌ chatbot empty reply (finishReason: ${data?.candidates?.[0]?.finishReason || 'none'})`);
      return res.status(502).json({ message: 'Chatbot service is currently unavailable.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    // Log only the error name (e.g. TimeoutError) - error objects can carry request details
    console.error(`❌ chatbot request failed: ${error.name}`);
    return res.status(502).json({ message: 'Chatbot service is currently unavailable.' });
  }
};
