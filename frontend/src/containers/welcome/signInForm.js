import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, FormGroup, FormSubmit } from "../../components/form.js";
import axios from "axios";

export default function SignInForm(props) {
  const dispatch = useDispatch();

  const [fields, setfields] = useState({
    errorMessage: "",
    username: "",
    password: "",
  });

  function handleChange(e) {
    setfields({
      ...fields,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:4090/api/auth/signin`,
        {
          username: fields.username,
          password: fields.password,
        }
      );

      let data = response.data;
      // console.log(data)

      if (response.status !== 200) {
        throw new Error(data.message);
      }
      // console.log("Before dispatch my guy");

      dispatch({
        type: "session/set",
        payload: {
          ...data,
        },
      });
    } catch (err) {
      console.error(`Failed to sign in. ${err}`);
      setfields({
        ...fields,
        errorMessage: err.message,
      });
    }
  }

  return (

    <Form handleSubmit={handleSubmit}>
      <h1 className='text-center font-weight-bold'>Log in to your account</h1>
      {fields.errorMessage && (
        <div className='alert alert-danger p-2' role='alert'>
          {fields.errorMessage}
        </div>
      )}
      <FormGroup>
        <input
          id='username'
          type='text'
          name='username'
          className='form-control'
          placeholder='Enter your username'
          value={fields.username}
          onChange={handleChange}
          aria-label='Username'
          required
        />
      </FormGroup>
      <FormGroup>
        <input
          id='password'
          type='password'
          name='password'
          className='form-control'
          placeholder='Enter your password'
          value={fields.password}
          onChange={handleChange}
          aria-label='Password'
          required
        />
      </FormGroup>
      <FormGroup className='mb-2'>
        <FormSubmit className='btn-primary btn-md w-100'>Log in</FormSubmit>
      </FormGroup>
    </Form>
  );
}
