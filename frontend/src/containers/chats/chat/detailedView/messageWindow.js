import React, { useEffect, useRef, useState } from "react";
import { Col, FluidContainer, Row } from "../../../../components/layout";
import { FullTime, PrettyDate } from "../../../../components/dates";
import { AutoLoader } from "../../../../components/loaders";
import axios from "axios";

export default function MessageWindow(props) {
  const bottomRef = useRef(null);

  const [state, setState] = useState({
    messages: [],
    limit: 10,
  });
  // console.log("Message window", props);
  useEffect(() => {
    const currentBottomRef = bottomRef.current;

    async function appendMessage(message) {
      try {
        setState((prevState) => {
          const updatedMessages = [...prevState.messages, message];

          return {
            ...prevState,
            messages: updatedMessages,
          };
        });

        currentBottomRef.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      } catch (err) {
        console.error(`Failed to receive chat message from server. ${err}`);
      }
    }

    if (props.channel) {
      props.channel.on("chat", appendMessage);
    }
  }, [props.channel]);

  async function appendMessages() {
    // console.log("I was clicked");
    try {
      if (props.chat) {
        const url = `http://localhost:4090/api/chats/${props.chat._id}/messages`;

        const searchParams = new URLSearchParams();
        searchParams.append(
          "page",
          Math.ceil(state.messages.length / state.limit)
        );
        searchParams.append("limit", state.limit);

        const messagesResponse = await axios.get(
          `${url}?${searchParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );
        console.log("Charley", messagesResponse);
        let data = messagesResponse.data;
        if (messagesResponse.status !== 200) {
          throw new Error(data.message);
        }

        const newMessages = data.reverse();
        setState((prevState) => {
          const updatedMessages = [...newMessages, ...prevState.messages];

          return {
            ...prevState,
            messages: updatedMessages,
          };
        });
      }
    } catch (err) {
      console.error(`Failed to append chat messages. ${err}`);
    }
  }

  // Now render message window.
  let lastTimestamp = null;
  let lastUsername = "";

  const messageItems = [];
  for (const [idx, message] of state.messages.entries()) {
    let newMessages = message;

    if (newMessages.info) {
      newMessages = newMessages.info;
    } else {
      console.log("No info. Most likely new");
    }

    let timestamp = new Date(newMessages.timestamp);

    if (
      !lastTimestamp ||
      lastTimestamp.toDateString() !== timestamp.toDateString()
    ) {
      let dateItem = (
        <Row key={`date-${idx}`} className='justify-content-center mt-3'>
          <Col className='col-auto md-chat-sys'>
            <p className='md-font-sm my-0 text-muted'>
              <PrettyDate date={timestamp} />
            </p>
          </Col>
        </Row>
      );

      messageItems.push(dateItem);
      lastTimestamp = timestamp;
      lastUsername = "";
    }

    let currentUsername = newMessages.sender;
    let isCurrentUser =
      props.session.username === currentUsername ? true : false;

    let chatAlign = isCurrentUser
      ? "justify-content-end"
      : "justify-content-start";
    let chatColor = isCurrentUser ? "md-chat-out" : "md-chat-in";
    let chatSpacing = lastUsername === currentUsername ? "mt-1" : "mt-3";

    let messageItem = (
      <Row key={idx} className={`${chatAlign} ${chatSpacing}`}>
        <Col className='col-10'>
          <Row className={chatAlign}>
            <FluidContainer className={`md-chat-msg ${chatColor} mx-2 p-2`}>
              <p className='my-0'>{newMessages.content}</p>
              <footer className='d-flex justify-content-end'>
                <p className='my-0 md-font-xs text-muted'>
                  <FullTime date={timestamp} />
                </p>
              </footer>
            </FluidContainer>
          </Row>
        </Col>
      </Row>
    );

    messageItems.push(messageItem);
    lastUsername = currentUsername;
  }

  return (
    <Row className='md-msg-window flex-grow-1 overflow-y border-top border-bottom'>
      <Col>
        <AutoLoader callback={appendMessages} />
        {messageItems}
        <span ref={bottomRef} className='p-1'></span>
      </Col>
    </Row>
  );
}
