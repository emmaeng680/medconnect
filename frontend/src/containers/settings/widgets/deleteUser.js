import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavItem } from "../../../components/navs";
import {
  TitleBar,
  TitleButton,
  TitleButtons,
  Widget,
  WidgetBody,
} from "../../../components/widgets";
import axios from "axios";

export default function DeleteUserWidget(props) {
  const session = useSelector((s) => s.session);
  const dispatch = useDispatch();

  const [validateMode, setValidateMode] = useState(false);

  async function toggleValidateMode(e) {
    e.preventDefault();
    setValidateMode(!validateMode);
  }

  async function clickedAccept(e) {
    e.preventDefault();
    try {
      const deleteResponse = await axios.delete(
        `http://localhost:4090/api/users/${session.username}`,
        {
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.authToken}`,
          },
        }
      );

      let data = deleteResponse.data;
      if (deleteResponse.status !== 200) {
        throw new Error(data.message);
      }

      const signOutResponse = await axios.get(
        `http://localhost:4090/api/auth/signout`,
        {
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.authToken}`,
          },
        }
      );

      data = signOutResponse.data;
      if (signOutResponse.status !== 200) {
        throw new Error(data.message);
      }

      dispatch({
        type: "session/reset",
      });
    } catch (err) {
      console.error(`Failed to delete user. ${err}`);
    }
  }

  return (
    <Widget>
      <TitleBar title='Delete Account'>
        {validateMode ? (
          <>
            <TitleButtons>
              <NavItem>
                <TitleButton
                  name='Accept'
                  icon='check'
                  handleClick={clickedAccept}
                />
              </NavItem>
              <NavItem>
                <TitleButton
                  name='Cancel'
                  icon='clear'
                  handleClick={toggleValidateMode}
                />
              </NavItem>
            </TitleButtons>
          </>
        ) : (
          <>
            <TitleButton
              name='Delete'
              icon='delete'
              handleClick={toggleValidateMode}
            />
          </>
        )}
      </TitleBar>
      {validateMode && (
        <WidgetBody>
          <div class='alert alert-danger' role='alert'>
            Please keep in mind that all your information will be permanently
            removed from our website and cannot be retrieved. We are sorry to
            see you go.
          </div>
        </WidgetBody>
      )}
    </Widget>
  );
}
