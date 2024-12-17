import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export const generateDailyQuestion = async (): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Generate a fun and engaging daily question for a chat conversions.",
        },
      ],
      max_tokens: 50,
    });
    console.log("GenerateDailyQuestion - open ai call: ");
    console.log(response);
    console.log(response.choices[0]?.message.content);

    return (
      response.choices[0]?.message?.content?.trim() ||
      "What's your favorite hobby?"
    );
  } catch (error) {
    console.error("Error generating daily question:", error);
    return "Here is a random question: What's your favorite book?";
  }
};
