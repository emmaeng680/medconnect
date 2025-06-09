import React, { useEffect, useState } from "react";

import AppointmentListView from "./views/listView";
import AppointmentDetailView from "./views/detailView";
import axios from "axios";

export default function Appointment(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [appointment, setAppointment] = useState({});

  // Initialize appointment by fetching appointment information.
  useEffect(() => {
    // console.log("here");
    async function initialize() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4090/api/appointments/${props.id}`,
          {
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );
        // console.log(response);
        let data = await response.data;
        if (response.status !== 200) {
          throw new Error(data.message);
        }
        setAppointment(data);
      } catch (err) {
        console.error(
          `Failed to get appointment information- ${props.id}. ${err}`
        );
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, [props.id, props.session]);

  async function handleStatus(e) {
    e.preventDefault();
    try {
      const newStatus = e.currentTarget.value;
      const body = { status: newStatus };

      const response = await axios.put(
        `http://localhost:4090/api/appointments/${props.id}`,
        body,
        {
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${props.session.authToken}`,
          },
        }
      );

      let data = await response.data;
      if (response.status !== 200) {
        throw new Error(data.message);
      }

      setAppointment((prevState) => {
        return {
          ...prevState,
          status: newStatus,
        };
      });
    } catch (err) {
      console.error(
        `Failed to update status for appointment- ${props.id}. ${err}`
      );
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    try {
      const response = await axios.delete(
        `http://localhost:4090/api/appointments/${props.id}`,
        {
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${props.session.authToken}`,
          },
        }
      );

      let data = await response.data;
      if (response.status !== 200) {
        throw new Error(data.message);
      }

      if (props.deleteAppointment) {
        await props.deleteAppointment(props.id);
      }
    } catch (err) {
      // console.log(`Failed to delete appointment- ${props.id}. ${err}`);
    }
  }

  

  if (props.listView) {
    return (
      <AppointmentListView
        isLoading={isLoading}
        session={props.session}
        appointment={appointment}
        handleStatus={handleStatus}
        handleDelete={handleDelete}
      />
    );
  } else {
    return (
      <AppointmentDetailView
        isLoading={isLoading}
        session={props.session}
        appointment={appointment}
        handleStatus={handleStatus}
        handleDelete={handleDelete}
      />
    );
  }
}
