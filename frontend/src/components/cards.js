import React from 'react';
import { useExtendClass } from "./hooks.js";


export function Card(props) {
  const { className, ...otherProps } = props;
  const classes = useExtendClass("card", className);
  
  return (
    <div className={classes} { ...otherProps } >
      {props.children}
    </div>
  );
}


export function CardHeader(props) {
  const { className, ...otherProps } = props;
  const headerClass = useExtendClass("card-header", className);
  
  return (
    <div className={headerClass} {...otherProps}>
      {props.children}
    </div>
  );
}



export function CardBody(props) {
    const { className, ...otherProps } = props;
    return (
        <div className={useExtendClass("card-body", className)} { ...otherProps } >
            {props.children}
        </div>
    );
}


export function CardFooter(props) {
    const { className, ...otherProps } = props;
    return (
        <div className={useExtendClass("card-footer", className)} { ...otherProps } >
            {props.children}
        </div>
    );
}

export function BodyCard(props) {
  const { className, ...otherProps } = props;
  return (
      <div className={useExtendClass("card card-body", props.className)} { ...otherProps } >
          {props.children}
      </div>
  );
}

