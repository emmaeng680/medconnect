import React, { useEffect, useState } from "react";

import DetailedView from "./detailedView";
import axios from "axios";

export default function Chat(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState({});

  useEffect(() => {
    console.log("Props chat", props);
    async function initialize() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4090/api/chats/${props.id}`,
          {
            credentials: "same-origin",
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );
        // console.log("A chat", response);
        let data = response.data;
        if (response.status !== 200) {
          throw new Error(data.message);
        }

        setChat(data);
      } catch (err) {
        console.error(`Failed to initialize chat- ${props.id}. ${err}`);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [props.id, props.session]);

  if (props.listView) {
    return null;
  } else {
    return (
      <DetailedView session={props.session} chat={chat} isLoading={isLoading} />
    );
  }
}
