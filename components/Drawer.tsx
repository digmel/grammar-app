import React, { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Drawer, Button, ScrollArea, Stack } from "@mantine/core";

const topicsData = require("../pages/topicsData.json");

function DrawerComponent({ setTopic }: any) {
  const [opened, { open, close }] = useDisclosure(false);
  const [user, setUser] = useState("");

  const onClick = (e: any) => {
    setTopic(e.target.innerText);
    close();
  };

  const content = topicsData.map((item: string, index: number) => (
    <Button variant="gradient" key={index} color="black" onClick={onClick}>
      {item}
    </Button>
  ));

  useEffect(() => {
    const res = (window as any)?.localStorage.getItem("current-user");
    setUser(res);
  }, []);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title={`Hi there!! Choose topic:`}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack align="flex-start">{content}</Stack>
      </Drawer>

      <Button onClick={open} m="xl">
        Menu
      </Button>
    </>
  );
}

export default DrawerComponent;
