import axios from "axios";

const HF_MODELS = [
  "google/flan-t5-base",
  "facebook/blenderbot-400M-distill"
];

const callHuggingFace = async (apiKey, model, message) => {
  console.log("Trying model:", model);

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    { inputs: message },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};

const extractReply = (data) => {
  if (!data) return null;

  // Text generation models
  if (data.generated_text) return data.generated_text;

  // Some HF models return array responses
  if (Array.isArray(data)) {
    if (data[0]?.generated_text) return data[0].generated_text;
    if (data[0]?.summary_text) return data[0].summary_text;
    if (data[0]?.translation_text) return data[0].translation_text;
  }

  // Conversation models
  if (data?.conversation?.generated_responses?.length > 0) {
    return data.conversation.generated_responses[0];
  }

  return null;
};

export const getAIResponse = async (message) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not set in .env file");
  }

  let lastError = null;

  for (const model of HF_MODELS) {
    try {
      const data = await callHuggingFace(apiKey, model, message);

      // Handle 503 - model loading
      if (data?.error?.includes("loading") || data?.estimated_time) {
        console.log(`Model ${model} is loading, trying next...`);
        continue;
      }
      if (data?.error) {
        console.error(`AI ERROR (${model}):`, data.error);
        lastError = data.error;
        continue;
      }

      const reply = extractReply(data);
      if (reply) return reply;
    } catch (error) {
      console.error("AI ERROR:", error.response?.data || error.message);
      lastError = error.response?.data || error.message;
    }
  }

  return "I understand how you're feeling. I'm here to listen. Can you tell me more about what's on your mind?";
};