import React from 'react';
import { useExtendClass } from "./hooks.js";


export function ToolTipButton(props) {
    const { id, name, className, title, handleClick, disabled, children } = props;
    const btnClass = useExtendClass("btn", className);

    return (
        <button 
            type="button" 
            id={id} 
            name={name}
            className={btnClass}
            data-toggle="tooltip" 
            data-placement="bottom" 
            title={title}
            onClick={handleClick} 
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export function DropdownButton(props) {
    const { id, name, className, disabled, children } = props;
  
    return (
      <button
        type="button"
        id={id}
        name={name}
        className={useExtendClass("btn", className)}
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        disabled={disabled ? true : false}
      >
        {children}
      </button>
    );
  }
  


export function Button(props) {
    const {propsClassName, ...otherProps} = props;
    const className = useExtendClass("d-flex align-items-center", props.className);
    
    if (props.isDropdown) {
        return <DropdownButton className={className} {...otherProps} />
    } else {
        return <ToolTipButton className={className} {...otherProps} />
    }
}


export function SmButton(props) {
    const { className, children, ...otherProps } = props;
    const buttonClassName = useExtendClass("btn-sm", className);
  
    return (
      <Button className={buttonClassName} {...otherProps}>
        {children}
      </Button>
    );
  }
  


export function LgButton(props) {
    const { className, ...otherProps } = props;
    return (
      <Button className={useExtendClass("btn-lg", className)} {...otherProps}>
        {props.children}
      </Button>
    );
  }
  