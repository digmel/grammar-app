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
  Divider,
} from "@mantine/core";
import { IconCircleDashed, IconCircle } from "@tabler/icons-react";
import OpenAIApi from "openai";
import DrawerComponent from "../components/Drawer";

const openai = new OpenAIApi({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
  const [topicID, setTopicID] = useState<string>("");

  const [guide, setGuide] = useState([]);

  const getQuestion = async () => {
    setShowResults(false);
    setLoading(true);
    setShowHint(false);
    setUserSelection("");

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `return json file with "question", "hint", "variations" and "answer" keys for English practice quiz.
            "question" should be one interesting, advanced sentence, but put "____" empty symbol instead of grammatical words, focused on the topic - ${topic},
            "hint" should be a good, long, explanation in simple words about how to solve "question" with similar example sentence and list of clue words to highlight in "question", return single objet with "hint" and "keywords",
            "variations" should be a list of 4 different answer for "____" empty symbol in "question", but only one should create a fully, grammatically correct sentence. Use prefixes - A, B, C, D, as keys and return single object. Use random correct variants.
            "answer" should be a correct answer prefix from "variations".`,
          },
        ],
      });

      const response = completion.choices[0].message?.content;

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

  const onSubmit = async (key: string) => {
    setCount(count + 1);
    setUserSelection(key);
    console.log("Selected Answer: ", key);

    const questionResult = {
      selectedAnswer: key,
      correctAnswer: correctText,
      question: question,
      variations: variations,
    };

    if (topic && topicID) {
      const existedQuestionsJSON = await window.localStorage.getItem(topicID);

      if (existedQuestionsJSON) {
        const existedQuestions = JSON.parse(existedQuestionsJSON);
        existedQuestions && existedQuestions.push(questionResult);
        await window.localStorage.setItem(
          topicID,
          JSON.stringify(existedQuestions)
        );
      } else {
        await window.localStorage.setItem(
          topicID,
          JSON.stringify([questionResult])
        );
      }
    }

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
      setGuide([]);
      setTopic("");
    }
  }, [count]);

  useEffect(() => {
    if (topic) {
      let cacheKey = topic.toLowerCase();
      cacheKey = cacheKey.replace(/[^a-z0-9]+/g, "_");
      setTopicID(cacheKey);
    }
  }, [topic]);

  const handleGuide = async () => {
    if (topic) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `return explanation of English grammar subject with 5 different examples and explaining rule with everyday language, focused on the topic - ${topic}, use JSON format, return "rules" list about this topic, to explain each rule, use "title" key for rule's title, the "explanation" key for simplified description of what it is and how it works, and the "examples" key with list of 3 different examples where this rule is being implemented.`,
            },
          ],
        });

        const response = completion.choices[0].message?.content;

        console.log("guide", response);

        const data = JSON.parse(response as string);
        setGuide(data?.rules);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <Layout title="home">
      <DrawerComponent setTopic={setTopic} />
      <h1 className="mb-8 font-thin text-gray-600 text-center">
        Practice English grammar with AI-powered Grammacho!
      </h1>

      <Center m="lg">{topic && <Text>Topic: {topic}</Text>}</Center>

      <Center m="lg">
        {topicID && localStorage.getItem(topicID) && (
          <Text>
            Score:
            {JSON?.parse(localStorage.getItem(topicID) ?? "").length}
          </Text>
        )}
      </Center>

      {question == "" && !showResults && (
        <Center>
          <Stack>
            {/* <Select
              label="Choose user"
              data={["Chimaera", "Bumblebee"]}
              searchable
              onChange={(value) =>
                window.localStorage.setItem(
                  "current-user",
                  JSON.stringify(value)
                )
              }
            /> */}

            {!topic && <Text>Choose a topic from Menu to Start practice</Text>}

            <Button onClick={() => getQuestion()} disabled={!topic}>
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
        <Center mb="xl">
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

            {JSON.parse(localStorage.getItem(topicID) ?? "").map(
              (item: any, index: any) => (
                <Stack key={index}>
                  <Divider />
                  <Text>{item.question}</Text>

                  <Group>
                    <Text>Your Selected Answer:</Text>
                    <Text color="yellow">
                      {item.variations[item.selectedAnswer]}
                    </Text>
                  </Group>

                  <Group>
                    <Text>Correct Answer:</Text>
                    <Text color="green">
                      {item.variations[item.correctAnswer]}
                    </Text>
                  </Group>

                  <Divider />
                </Stack>
              )
            )}
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
                  <p
                    className={`${
                      userSelection !== ""
                        ? key === correctText
                          ? "text-green-500"
                          : "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    {key}) {item}
                  </p>
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

      {topic != "" && (
        <div className="mt-8 flex items-center justify-center flex-1 flex-col gap-12">
          <button
            onClick={handleGuide}
            className="bg-sky-500 text-white font-semibold px-6 py-3 my-8 hover:bg-sky-600 rounded-md transition duration-200 ease-in-out disabled:pointer-events-none disabled:bg-sky-300"
          >
            Show Topic Rules
          </button>

          {guide.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden p-6 space-y-4"
            >
              <h3 className="text-xl font-bold text-gray-900">{item?.title}</h3>
              <p className="text-gray-600">{item?.explanation}</p>

              {item?.examples?.map((example: any, index: number) => (
                <p
                  key={index}
                  className="text-gray-500 text-sm pl-4 border-l-2 border-sky-500"
                >
                  {example}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "300px" }}></div>
    </Layout>
  );
}
