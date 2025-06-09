import React, { useState } from "react";
import { Form } from "../../components/form";
import { useExtendClass } from "../../components/hooks";
import { LgIcon } from "../../components/icons";
import {
  NavBar,
  NavBrand,
  NavCollapsible,
  NavLink,
  NavLinks,
  NavToggler,
} from "../../components/navs";

function Toggler(props) {
  const { className, icon, ...otherProps } = props;
  return (
    <NavToggler
      className={useExtendClass("md-btn p-2 mx-1", className)}
      {...otherProps}>
      <LgIcon className='d-flex align-items-center'>{icon}</LgIcon>
    </NavToggler>
  );
}

export function TitleBarLink(props) {
  const { className, title, icon, ...otherProps } = props;
  return (
    <NavLink
      {...otherProps}
      className={useExtendClass(
        "md-btn mx-1 p-2 d-flex align-items-center",
        className
      )}
      tooltip={title}
      role='button'>
      <LgIcon>{icon}</LgIcon>
      <p className='my-0 pl-2 text-truncate d-md-none'>{title}</p>
    </NavLink>
  );
}

export function TitleBarLinks(props) {
  return <NavLinks>{props.children}</NavLinks>;
}

export function TitleBarSearch(props) {
  const [fields, setFields] = useState({
    query: "",
  });

  async function handleChange(e) {
    setFields({
      ...fields,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (props.handleSearch) {
        props.handleSearch(fields.query);
      }
    } catch (err) {
      console.error(`Failed to handle search query. ${err}`);
    }
  }

  return (
    <Form
      handleSubmit={handleSubmit}
      className={useExtendClass(
        "form-inline mx-1 my-2 my-lg-0",
        props.className
      )}>
      <div className='input-group w-100'>
        <input
          id='titlebarSearch01'
          type='text'
          className='form-control'
          name='query'
          placeholder={props.placeholder}
          value={fields.query}
          onChange={handleChange}
          aria-label='Search Query'
          aria-describedby='titlebarSearch02'
        />
        <div className='input-group-append'>
          <button
            id='titlebarSearch02'
            type='button'
            className='btn btn-sm btn-outline-secondary'>
            <LgIcon>search</LgIcon>
          </button>
        </div>
      </div>
    </Form>
  );
}

export default function TitleBar(props) {

  return (
    <NavBar className='navbar-expand-md navbar-light row md-tbar sticky-top justify-content-start'>
      <Toggler target='sideBar01' icon='menu' toggleType='modal' />
      <NavBrand className='mr-auto p-1 font-weight-bold'>
        {props.title}
      </NavBrand>
      {props.children && (
        <>
          <Toggler target='titleBarNav01' icon='more_vert' />
          <NavCollapsible
            id='titleBarNav01'
            className='justify-content-end order-last order-md-4'>
            {props.children}
          </NavCollapsible>
        </>
      )}
    </NavBar>
  );
}

