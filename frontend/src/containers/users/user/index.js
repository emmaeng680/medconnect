import React, { useEffect, useState } from "react";

import UserListView from "./views/listView";
import UserDetailView from "./views/detailView";
import axios from "axios";

export default function User(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});

  // Initialize user by fetching information from server.
  useEffect(() => {
    const { username } = props;
    async function initialize() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4090/api/users/${username}`,
          {
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );
        // console.log("Res back", response);
        let data = response.data;
        if (response.status !== 200) {
          throw new Error(data.message);
        }

        setUser(data);
      } catch (err) {
        console.error(
          `Failed to get user information- ${props.username}. ${err}`
        );
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    }

    initialize();
  }, [props.username, props.session.authToken]);

  // Now render view.
  if (props.listView) {
    return (
      <UserListView isLoading={isLoading} session={props.session} user={user} />
    );
  } else {
    return (
      <UserDetailView
        isLoading={isLoading}
        session={props.session}
        user={user}
      />
    );
  }
}
