import React, { useEffect, useRef } from 'react';
import { FluidContainer, Row, Col } from "../../components/layout.js";

import SignInForm from "./signInForm.js";
import RegisterForm from "./register.js";


function ContentMedia() {
    return (
        <FluidContainer className="md-wc-banner">
            <h1 className="text-center font-weight-bold">mediconnection</h1>
            <h4 className="text-center">self help, where you need it, when you need it.</h4>
        </FluidContainer>
    );
}


function RegisterModal(props) {
    const closeButtonRef = useRef(null);

    // Reset faded background back to normal when modal unmounts.
    useEffect(() => {
        const closeButton = closeButtonRef.current;

        return function closeModal() {
            if (closeButton) {
                closeButton.click();
            }
        }
    });

    return (
        <FluidContainer>
            <Row>
                <button type="button" class="btn btn-success col" 
                    data-toggle="modal" data-target="#registerModal01">
                    Create a new Account
                </button>
            </Row>
            <div class="modal fade" id="registerModal01" tabindex="-1" 
                role="dialog" aria-labelledby="registerModalTitle" 
                    aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 id="registerModalTitle" class="modal-title font-weight-bold">
                                Register today.
                            </h5>
                            <button ref={closeButtonRef} type="button" 
                                class="close" data-dismiss="modal" 
                                    aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <RegisterForm />
                        </div>
                    </div>
                </div>
            </div>
        </FluidContainer>
    );
}


export default function ContentBar(props) {
    return (
        
        <Row className="justify-content-center flex-grow-1 md-wc-cbar">
            <Row className= "flex-grow-1 mx-auto">
                    <ContentMedia />
                </Row>
            <Col className="col-md-11 col-xl-10 d-flex align-items-start align-items-sm-center">
                <Row className="flex-grow-1">
                    <Col className= "float: none margin: auto">
                        <SignInForm />
                        <RegisterModal />
                    </Col>
                    
                    
                </Row>
            </Col>
        </Row>
    );
}
