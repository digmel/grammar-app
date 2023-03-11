import { Configuration, OpenAIApi } from "openai";
import React, { useEffect, useState } from "react";
import { Layout } from "../components";

export default function Home() {
  const [initialText, setInitialText] = useState("");
  const [hint, setHint] = useState("");
  const [correctText, setCorrectText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    generateTexts();
  }, []);

  const generateTexts = async () => {
    setInitialText("");
    setShowHint(false);

    const configuration = new Configuration({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `return json file with "incorrect", "hint", and "corrected" keys. "incorrect" should be one interesting sentence but grammatically wrong with multiple mistakes, chose advanced grammatical mistakes such as conditional statements, complex tenses, misused phrasal verbs, missed punctuation and etc, "hint" should be a little hint about what was wrong with "incorrect", and "corrected" should be exact sentence with correct grammar.`,
          },
        ],
      });

      const result = completion.data.choices[0].message?.content;

      const data = JSON.parse(result as string);

      setInitialText(data?.incorrect);
      setHint(data?.hint);
      setCorrectText(data?.corrected);
    } catch ({ message }) {
      console.log("Error when generate texts: ", message);
    }

    // TODO: implement protective API route.
    // fetch(`./api/hello`, {
    //   method: "GET",
    //   mode: "cors",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((res) => res.json())
    //   .then((res) => {
    //     const data = JSON.parse(res?.result);

    //     setInitialText(data?.incorrect);
    //     setHint(data?.hint);
    //     setCorrectText(data?.corrected);
    //   });
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
        {/* <button
          disabled={isDisabled}
          onClick={generateTexts}
          className="bg-blue-400 py-2 px-8 hover:opacity-70 mb-4 rounded disabled:pointer-events-none disabled:opacity-50"
        >
          Generate
        </button> */}

        <div className="bg-yellow-100 mb-4 rounded-2xl">
          <p className="px-4 py-4 font-thin">{initialText}</p>
        </div>
        {/* 
        {statusText.length > 0 && (
          <p className="text-blue-400 pb-4">{statusText}</p>
        )} */}

        <div>
          <textarea
            autoFocus
            rows={5}
            cols={100}
            placeholder="Write corrected sentence here..."
            // value={initialText}
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
