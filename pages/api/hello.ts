import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

type Data = {
  result?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `return json file with "incorrect", "hint", and "corrected" keys. "incorrect" should be one interesting sentence but grammatically wrong with multiple mistakes, chose advanced grammatical mistakes such as conditional statements, complex tenses, misused phrasal verbs, missed punctuation and etc, "hint" should be a little hint about what was wrong with "incorrect", and "corrected" should be exact sentence with correct grammar.`,
        },
      ],
    });

    console.log("first", completion.data.choices[0].message?.content);

    const result2 = completion
      ? completion.data.choices[0].message?.content
      : "";
    res.status(200).json({ result: result2 });
  } catch ({ message }) {
    console.log("Error connected with openAI API", message);
  }
}
