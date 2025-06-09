import React, { useState } from "react";
import { AutoLoader } from "../../../../../../components/loaders";
import {
  TitleBar,
  TitleToggler,
  Widget,
  WidgetCollapsible,
} from "../../../../../../components/widgets";

import AddSection from "./addSection";
import ListSection from "./listSection";
import axios from "axios";

export default function ServiceSection(props) {
  const [state, setState] = useState({
    services: [],
    limit: 10,
  });

  async function appendServices() {
    try {
      const url = `http://localhost:4090/api/users/${props.user.username}/services`;

      const searchParams = new URLSearchParams();
      searchParams.append(
        "page",
        Math.ceil(state.services.length / state.limit)
      );
      searchParams.append("limit", state.limit);

      const response = await axios.get(`${url}?${searchParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${props.session.authToken}`,
        },
      });
      // console.log("Service add", response);
      let newServices = response.data;
      if (response.status !== 200) {
        throw new Error(newServices.message);
      }

      setState((prevState) => {
        const updatedServices = [...prevState.services, ...newServices];

        return {
          ...prevState,
          services: updatedServices,
        };
      });
    } catch (err) {
      console.error(`Failed to append more services. ${err}`);
    }
  }

  async function appendService(newService) {
    // console.log("I was called");
    setState((prevState) => {
      const newServices = [newService, ...prevState.services];

      return {
        ...prevState,
        services: newServices,
      };
    });
  }

  async function deleteService(id) {
    try {
      // console.log("Delete id", id);
      const response = await axios.delete(
        `http://localhost:4090/api/users/${props.user.username}/services/${id}`,
        {
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${props.session.authToken}`,
          },
        }
      );

      let data = response.data;
      if (response.status !== 200) {
        throw new Error(data.message);
      }

      setState((prevState) => {
        const newServices = state.services.filter((service) => {
          return service.id !== id;
        });

        return {
          ...prevState,
          services: newServices,
        };
      });
    } catch (err) {
      console.error(`Failed to delete service- ${id}. ${err}`);
    }
  }

  return (
    <>
      <Widget>
        <TitleBar title='Services'>
          {!props.disableEdit && (
            <TitleToggler
              target='userServiceAdd01'
              expandIcon='add'
              collapseIcon='clear'
            />
          )}
        </TitleBar>
        <WidgetCollapsible id='userServiceAdd01'>
          <AddSection
            session={props.session}
            user={props.user}
            appendService={appendService}
          />
        </WidgetCollapsible>
        <ListSection
          session={props.session}
          services={state.services}
          deleteService={deleteService}
        />
      </Widget>
      <AutoLoader callback={appendServices} />
    </>
  );
}
