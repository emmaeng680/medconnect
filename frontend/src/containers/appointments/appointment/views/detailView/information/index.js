import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FullTime, PrettyDate } from "../../../../../../components/dates";
import { Col, FluidContainer, Row } from "../../../../../../components/layout";
import { Loader } from "../../../../../../components/loaders";
import {
  BioData,
  Currency,
  FullName,
} from "../../../../../../components/users";
import {
  TitleBar,
  Widget,
  WidgetBody,
} from "../../../../../../components/widgets";
import axios from "axios";

function UserInfo(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:4090/api/users/${props.user.username}`,
          {
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );

        let data = response.data;

        if (response.status !== 200) {
          throw new Error(data.message);
        }

        setUser(data);
        setIsLoading(false);
      } catch (err) {
        console.error(`Failed to load patient information. ${err}`);
      }
    }

    initialize();
  }, [props.user, props.session]);

  return (
    <FluidContainer>
      <Row>
        {isLoading ? (
          <>
            <Col>
              <Loader isLoading={true} />
            </Col>
          </>
        ) : (
          <>
            <Col className='col-auto px-0'>
              <Link to={`/users/${user.username}`} className='font-weight-bold'>
                <FullName user={user} />
              </Link>
              <p className='my-0 md-font-sm text-muted'>
                <BioData user={user} />
              </p>
            </Col>
          </>
        )}
      </Row>
    </FluidContainer>
  );
}

function InfoRow(props) {
  return <Row>{props.children}</Row>;
}

function InfoTitle(props) {
  return (
    <Col className='col-12 col-sm-4 col-md-3 col-lg-2 font-weight-bold d-block'>
      {props.children}
    </Col>
  );
}

function InfoBody(props) {
  return (
    <Col className='col-12 col-sm-8 col-md-9 col-lg-10 mb-2 ml-0 d-block text-wrap'>
      {props.children}
    </Col>
  );
}

function ViewSection(props) {
  const startTime = props.appointment.startTime;
  const endTime = props.appointment.endTime;

  return (
    <FluidContainer>
      <InfoRow>
        <InfoTitle>Title</InfoTitle>
        <InfoBody>{props.appointment.title}</InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Patient</InfoTitle>
        <InfoBody>
          <UserInfo session={props.session} user={props.appointment.patient} />
        </InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Physician</InfoTitle>
        <InfoBody>
          <UserInfo
            session={props.session}
            user={props.appointment.physician}
          />
        </InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Start Time</InfoTitle>
        <InfoBody>
          <FullTime date={startTime} hour12={true} />,{" "}
          <PrettyDate date={startTime} />
        </InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>End Time</InfoTitle>
        <InfoBody>
          <FullTime date={endTime} hour12={true} />,{" "}
          <PrettyDate date={endTime} />
        </InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Service</InfoTitle>
        <InfoBody>{props.appointment.serviceName}</InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Service Charge</InfoTitle>
        <InfoBody>
          <Currency value={props.appointment.serviceCharge} />
        </InfoBody>
      </InfoRow>
      <InfoRow>
        <InfoTitle>Description</InfoTitle>
        <InfoBody>{props.appointment.description}</InfoBody>
      </InfoRow>
    </FluidContainer>
  );
}

export default function InformationSection(props) {
  return (
    <>
      <Widget>
        <TitleBar title='Information' />
        <WidgetBody>
          <ViewSection
            session={props.session}
            appointment={props.appointment}
          />
        </WidgetBody>
      </Widget>
    </>
  );
}
