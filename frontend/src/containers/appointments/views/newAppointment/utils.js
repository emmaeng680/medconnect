import React from 'react';
import { LgIcon } from '../../../../components/icons';
import { Col, FluidContainer, Row } from '../../../../components/layout';
import { BioData, Currency, FullName } from '../../../../components/users';


export function PhysicianItem(props) {
    return (
        <FluidContainer>
            <Row>
                <Col>
                    <Row className="text-truncate">{<FullName user={props.user} />}</Row>
                    <Row className="md-font-sm text-truncate text-muted">
                        {<BioData user={props.user} />}
                    </Row>
                </Col>
                {(props.clickable) &&
                    <Col className="col-auto d-flex align-items-center">
                        <LgIcon>navigate_next</LgIcon>
                    </Col>
                }
            </Row>
        </FluidContainer>
    );
}


export function ServiceItem(props) {
    return (
        <FluidContainer>
            <Row>
                <Col>
                    <Row className="text-truncate">{props.service.name}</Row>
                    <Row className="md-font-sm text-truncate text-muted">
                        {<Currency value={props.service.rate} />}
                    </Row>
                </Col>
                {(props.clickable) &&
                    <Col className="col-auto d-flex align-items-center">
                        <LgIcon>navigate_next</LgIcon>
                    </Col>
                }
            </Row>
        </FluidContainer>
    );
}