import React, { useEffect, useState } from "react";
import { Layout } from "../components";
import OpenAIApi from "openai";

export default function Home() {
  const [initialText, setInitialText] = useState("");
  const [hint, setHint] = useState("");
  const [correctText, setCorrectText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // generateTexts();
  }, []);

  const generateTexts = async () => {
    setInitialText("");
    setCorrectedText("");
    setShowHint(false);

    const openai = new OpenAIApi({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `return json file with "question", "hint", "variations" and "answer" keys. 
            "question" should be one interesting sentence but grammatically wrong with multiple mistakes, chose advanced grammatical mistakes such as conditional statements, complex tenses, misused phrasal verbs, missed punctuation and etc, 
            "hint" should be a little hint about what was wrong with "incorrect", 
            "answer" should be exact sentence with correct grammar.
            "variations" should be list of 4 different answer but only one should be correct.`
          },
        ],
      });
      
      const result = completion.choices[0].message?.content;

      console.log('first', result)

      const data = JSON.parse(result as string);

      setInitialText(data?.question);
      setHint(data?.hint);
      setCorrectText(data?.answer);
    } catch ({ message }) {
      console.log("Error when generate texts: ", message);
    }
  };

  const getExplanation = () => {
    setShowHint(!showHint);
  };

  const onSubmit = () => {
    console.log("Correct Answer: ", correctText);
    const temp1 = correctedText.replace(/\s+/g, "").toLowerCase();
    const temp2 = correctText.replace(/\s+/g, "").toLowerCase();

    if (temp1 === temp2) {
      alert("Yey, Correct!");
      generateTexts();
    } else {
      alert("Not quite correct, try again!");
    }
  };

  return (
    <Layout title="home">
      <div className=" mx-4 flex flex-col items-center mt-4 md:mt-12 ">
        <h1 className="mb-8 font-thin text-gray-600 text-center">
          App is designed to generate random sentences with grammatical errors,
          giving you an opportunity to practice your skills in correcting them!
        </h1>

        <div className="bg-yellow-100 mb-4 rounded-2xl">
          <p className="px-4 py-4 font-thin">{initialText}</p>
        </div>
        <div>
          <textarea
            autoFocus
            rows={5}
            cols={100}
            placeholder="Write corrected sentence here..."
            className="w-full px-3 py-2 max-w-lg text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline resize-none min-h-32 sm:min-h-48 md:min-h-64"
            onChange={(e) => setCorrectedText(e.target.value)}
          />

          <div className="flex flex-row justify-between">
            <button
              onClick={getExplanation}
              className="bg-yellow-300 py-2 px-8 hover:bg-opacity-70 my-8 rounded"
            >
              hint
            </button>

            <button
              onClick={onSubmit}
              className="bg-green-600 px-8 py-2 my-8 hover:opacity-70 rounded disabled:pointer-events-none disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded">
          {showHint && (
            <>
              <p className="w-3/4 py-3 px-4 text-gray-600 text-thin">{hint}</p>
              <p className="w-3/4 py-3 px-4 text-gray-600 text-thin">
                {correctText}
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
