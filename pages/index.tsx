import React, { useState } from "react";
import { Layout } from "../components";

export default function Home() {
  const [initialText, setInitialText] = useState("");
  const [hint, setHint] = useState("");
  const [correctText, setCorrectText] = useState("");

  const [showHint, setShowHint] = useState(false);

  const [isDisabled, setIsDisabled] = useState(false);

  const getText = async () => {
    setInitialText("");
    setShowHint(false);
    setIsDisabled(true);

    // fetch(`${process.env.NEXT_PUBLIC_CUSTOM_DOMAIN}/api/hello`, {
    fetch(`https://fix3dprint.com/api/hello`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const data = JSON.parse(res?.result);

        setInitialText(data?.incorrect);
        setHint(data?.hint);
        setCorrectText(data?.corrected);
      });
  };

  const getExplanation = () => {
    setShowHint(!showHint);
  };

  const onSubmit = () => {
    console.log("Correct Answer: ", correctText);
    const temp1 = initialText.replace(/\s+/g, "").toLowerCase();
    const temp2 = correctText.replace(/\s+/g, "").toLowerCase();

    if (temp1 === temp2) {
      alert("Yey, Correct!");
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
      alert("Not quite correct, try again!");
    }
  };

  return (
    <Layout title="home">
      <div className=" mx-4 flex flex-col items-center mt-4 md:mt-12 ">
        <h1 className="mb-8 font-thin text-gray-600">
          App will generate grammatically wrong random sentence, so that you can
          practice to make it correct!
        </h1>
        <button
          disabled={isDisabled}
          onClick={getText}
          className="bg-blue-400 py-2 px-8 hover:opacity-70 mb-8 rounded disabled:pointer-events-none disabled:opacity-50"
        >
          Generate
        </button>
        {/* 
        {statusText.length > 0 && (
          <p className="text-blue-400 pb-4">{statusText}</p>
        )} */}

        <div>
          <textarea
            autoFocus
            rows={5}
            cols={100}
            value={initialText}
            className="w-full px-3 py-2 max-w-lg text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline resize-none min-h-32 sm:min-h-48 md:min-h-64"
            onChange={(e) => setInitialText(e.target.value)}
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
              className="bg-green-600 py-2 px-8 hover:opacity-70 rounded my-8"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="bg-gray-100 rounded">
          {showHint && (
            <p className="w-3/4 py-3 px-4 text-gray-600 text-thin">{hint}</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
