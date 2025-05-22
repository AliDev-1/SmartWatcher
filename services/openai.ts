import axios from "axios";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Generates movie/TV show title suggestions from a natural language query
 */
export const generateMovieTitles = async (query: string): Promise<string[]> => {
  console.log("🔍 OpenAI Query:", query);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              'You are a movie and TV show expert that converts descriptive queries into a list of 20 specific movie or TV show titles that match the description. ONLY return a JSON object with a \'titles\' array of strings. Example: {"titles": ["The Matrix", "Inception", "The Truman Show", "Ex Machina", "Her"]}',
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    console.log("✅ OpenAI Response received");
    const content = response.data.choices[0].message.content;
    console.log("📄 Raw content:", content);

    const parsedContent = JSON.parse(content);
    console.log("🎬 Suggested titles:", parsedContent.titles);

    return parsedContent.titles || [];
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return [];
  }
};
