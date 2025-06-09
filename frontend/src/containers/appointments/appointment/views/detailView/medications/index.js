import React, { useState } from "react";
import { useCompareUsers } from "../../../../../../components/hooks";
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

export default function MedicationSection(props) {
  const [state, setState] = useState({
    medications: [],
    limit: 10,
  });

  async function appendMedications() {
    try {
      const url = `http://localhost:4090/api/appointments/${props.appointment._id}/medications`;
      console.log(props.appointment._id);

      const searchParams = new URLSearchParams();
      searchParams.append(
        "page",
        Math.ceil(state.medications.length / state.limit)
      );
      searchParams.append("limit", state.limit);

      const response = await axios.get(`${url}?${searchParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${props.session.authToken}`,
        },
      });

      console.log(response);
      let newMedications = response.data;
      if (response.status !== 200) {
        throw new Error(newMedications.message);
      }

      setState((prevState) => {
        const updatedMedications = [
          ...prevState.medications,
          ...newMedications,
        ];

        return {
          ...prevState,
          medications: updatedMedications,
        };
      });
    } catch (err) {
      console.error(`Failed to append more medications. ${err}`);
    }
  }

  async function appendMedication(newMedication) {
    setState((prevState) => {
      const newMedications = [newMedication, ...prevState.medications];

      return {
        ...prevState,
        medications: newMedications,
      };
    });
  }

  async function deleteMedication(id) {
    try {
      const response = await axios.delete(
        `http://localhost:4090/api/appointments/${props.appointment._id}/medications/${id}`,
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
        const newMedications = state.medications.filter((medication) => {
          return medication.id !== id;
        });

        return {
          ...prevState,
          medications: newMedications,
        };
      });
    } catch (err) {
      console.error(`Failed to delete medication- ${id}. ${err}`);
    }
  }

  // Now render view
  const isCurrentUserPhysician = useCompareUsers(
    props.session,
    props.appointment.physician
  );

  return (
    <>
      <Widget>
        <TitleBar title='Medications'>
          {isCurrentUserPhysician && (
            <TitleToggler
              target='apptMedicationAdd01'
              expandIcon='add'
              collapseIcon='clear'
            />
          )}
        </TitleBar>
        <WidgetCollapsible id='apptMedicationAdd01'>
          <AddSection
            session={props.session}
            appointment={props.appointment}
            appendMedication={appendMedication}
          />
        </WidgetCollapsible>
        <ListSection
          session={props.session}
          medications={state.medications}
          deleteMedication={deleteMedication}
        />
      </Widget>
      <AutoLoader callback={appendMedications} />
    </>
  );
}
