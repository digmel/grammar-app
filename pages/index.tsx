import React, { useEffect, useState } from "react";
import { Layout } from "../components";
import {
  List,
  ThemeIcon,
  rem,
  Highlight,
  Progress,
  LoadingOverlay,
  Box,
  Loader,
  Button,
  Group,
  Mark,
  Stack,
  Text,
  Center,
  Select,
} from "@mantine/core";
import { IconCircleDashed, IconCircle } from "@tabler/icons-react";
import OpenAIApi from "openai";

// const data = require("./mockResponse.json");

const topicData = require("./topicsData.json");

export default function Home() {
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [correctText, setCorrectText] = useState("");
  const [variations, setVariations] = useState<Record<string, string>>({});
  const [userSelection, setUserSelection] = useState<string>("");
  const [highLights, setHighLights] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [topic, setTopic] = useState<string | null>("");

  const getQuestion = async () => {
    setShowResults(false);
    setLoading(true);
    setShowHint(false);
    setUserSelection("");

    const openai = new OpenAIApi({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `return json file with "question", "hint", "variations" and "answer" keys.
            "question" should be one interesting sentence but grammatically wrong with one or multiple mistakes, chose advanced grammatical mistakes focused on tha topic - ${topic},
            "hint" should be a little hint about what was wrong with "incorrect" with similar simpler example and list of words pointing to the area which needs to be corrected, return single objet with "hint" and "keywords",
            "variations" should be a list of 4 different answer but only one should be correct. Use prefixes - A, B, C, D, as keys and return single object. Use random correct variants.
            "answer" should be a correct answer prefix from variations.`,
          },
        ],
      });

      const response = completion.choices[0].message?.content;

      console.log(response);

      const data = JSON.parse(response as string);

      setVariations(data?.variations);
      setQuestion(data?.question);
      setHint(data?.hint.hint);
      setHighLights(data?.hint.keywords);
      setCorrectText(data?.answer);
      setLoading(false);
    } catch (message) {
      console.log("Error when generate texts: ", message);
    }
  };

  const getExplanation = () => {
    setShowHint(!showHint);
  };

  const onSubmit = (key: string) => {
    setCount(count + 1);
    setUserSelection(key);
    console.log("Selected Answer: ", key);

    if (key === correctText) {
      console.log("Yey, Correct!");
      setCorrectAnswers(correctAnswers + 1);
    } else {
      console.log("NOT Correct, sorry!");
    }
  };

  useEffect(() => {
    localStorage.setItem("correctAnswers", correctAnswers.toString());
    localStorage.setItem("wrongAnswers", (5 - correctAnswers).toString());
  }, [correctAnswers]);

  useEffect(() => {
    if (count == 5) {
      setShowResults(true);
      setCount(0);
      setCorrectAnswers(0);
      setQuestion("");
    }
  }, [count]);

  return (
    <Layout title="home">
      <h1 className="mb-8 font-thin text-gray-600 text-center">
        Practice English grammar with AI-powered Grammacho!
      </h1>

      {question == "" && !showResults && (
        <Center>
          <Stack>
            <Select
              label="Choose grammar problem to practice"
              placeholder="Pick a topic"
              data={topicData}
              searchable
              onChange={(value) => setTopic(value)}
            />

            <Button onClick={() => getQuestion()}>
              {loading && count == 0 ? (
                <Loader color="white" type="dots" />
              ) : (
                "Start"
              )}
            </Button>
          </Stack>
        </Center>
      )}

      {showResults && (
        <Center>
          <Stack>
            <Text>
              Great! You correctly answered{" "}
              <Mark color="green">
                {localStorage.getItem("correctAnswers")}
              </Mark>{" "}
              questions.
            </Text>
            <Text>
              Mistakes:{" "}
              <Mark color="red">{localStorage.getItem("wrongAnswers")}</Mark>
            </Text>
            <Button
              onClick={() => {
                setShowResults(false);
                localStorage.setItem("correctAnswers", "0");
                localStorage.setItem("wrongAnswers", "0");
              }}
            >
              {loading && count == 0 ? (
                <Loader color="white" type="dots" />
              ) : (
                "Back to Home"
              )}
            </Button>
          </Stack>
        </Center>
      )}

      {question != "" && (
        <div className=" mx-4 flex flex-col items-center mt-4 md:mt-12 ">
          <div className="h-12 w-64">
            <Progress value={count * 20} size="lg" transitionDuration={200} />
          </div>

          <Box pos="relative">
            <LoadingOverlay
              visible={loading}
              loaderProps={{
                children: <Loader color="blue" size="xl" type="dots" />,
              }}
            />
            <div className="mb-4 rounded-2xl">
              <Highlight highlight={showHint ? highLights : ""}>
                {question}
              </Highlight>
            </div>

            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="lightgray" size={24} radius="xl">
                  <IconCircle style={{ width: rem(16), height: rem(16) }} />
                </ThemeIcon>
              }
            >
              {Object?.entries(variations).map(([key, item]) => (
                <List.Item
                  key={key}
                  onClick={() => onSubmit(key)}
                  icon={
                    userSelection === key && (
                      <ThemeIcon color="blue" size={24} radius="xl">
                        <IconCircleDashed
                          style={{ width: rem(16), height: rem(16) }}
                        />
                      </ThemeIcon>
                    )
                  }
                >
                  {key}) {item}
                </List.Item>
              ))}
            </List>
          </Box>

          <div className="flex justify-between gap-12 md:gap-96">
            <button
              onClick={getExplanation}
              className="bg-yellow-300 py-2 px-8 hover:bg-opacity-70 my-8 rounded"
            >
              hint
            </button>

            <button
              onClick={() => getQuestion()}
              className="bg-sky-500 px-8 py-2 my-8 hover:opacity-70 rounded disabled:pointer-events-none disabled:opacity-50"
              disabled={userSelection == ""}
            >
              Next
            </button>
          </div>

          <div className="bg-gray-100 rounded">
            {showHint && (
              <p className="w-3/4 py-3 px-4 text-gray-600 text-thin">{hint}</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
