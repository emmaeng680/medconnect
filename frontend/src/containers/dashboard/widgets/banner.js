import React, { useEffect, useState } from "react";
import { BodyCard } from "../../../components/cards";
import { PrettyDate } from "../../../components/dates";
import { LgIcon } from "../../../components/icons";
import { Col, FluidContainer, Row } from "../../../components/layout";
import { FullName, Username } from "../../../components/users";
import axios from "axios";

function WelcomeMessage(props) {
  const today = new Date();
  return (
    <Row className='justify-content-between'>
      <Col className='align-items-center'>
        <PrettyDate date={today} />
      </Col>
      <Col className='text-muted col-auto'>
        <h6 className='text-muted my-1 py-0'>
          {`Welcome ${FullName({ user: props.session })}.`}
        </h6>
      </Col>
    </Row>
  );
}

function ServicesAlert(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function getCount() {
      try {
        setIsLoading(true);
        const username = Username({ user: props.session });
        const page = 0;
        const limit = 10;

        const { data, status } = await axios.get(
          `http://localhost:4090/api/users/${username}/services?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${props.session.authToken}`,
            },
          }
        );

        if (status !== 200) {
          throw new Error(data.message);
        }
        setCount(data.length);
      } catch (err) {
        console.error(`Failed to get count of services. ${err}`);
      } finally {
        setIsLoading(false);
      }
    }

    getCount();
  }, [props.session]);

  if (isLoading || count > 0) {
    return null;
  } else {
    return (
      <Row className='mt-3'>
        <Col>
          <div className='alert alert-danger d-flex p-2' role='alert'>
            <LgIcon className='mx-1'>person</LgIcon>
            <p className='my-0'>
              Consider adding services to your profile to make it easier for
              patients to schedule new appointments with you.
            </p>
          </div>
        </Col>
      </Row>
    );
  }
}

function Banner({ session }) {
  const { isPhysician } = session;
  const currentUserIsPhysician = Boolean(isPhysician);

  return (
    <BodyCard className='rounded'>
      <FluidContainer>
        <WelcomeMessage session={session} />
        {currentUserIsPhysician && <ServicesAlert session={session} />}
      </FluidContainer>
    </BodyCard>
  );
}

export default Banner;
