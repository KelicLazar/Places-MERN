import React, { useContext, useState } from "react";
import Button from "../../shared/components/FormElements/Button";
import Input from "../../shared/components/FormElements/Input";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/components/utils/validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useForm } from "../../shared/hooks/form-hook";

import Card from "../../shared/components/UIElements/Card";

import "./Auth.css";
import { AuthContext } from "../../shared/context/auth-context";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

const Auth = (props) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const authCtx = useContext(AuthContext);
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );
  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-Type": "application/json" }
        );
        authCtx.login(responseData.userId, responseData.token);
      } catch (err) {}
    } else {
      try {
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("name", formState.inputs.name.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/signup",
          "POST",
          formData
        );

        authCtx.login(responseData.userId, responseData.token);
      } catch (error) {}
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr></hr>
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              onInput={inputHandler}
              id="name"
              type="text"
              element="input"
              validators={[VALIDATOR_REQUIRE()]}
              label="Your name"
              errorText="Please enter a name."
            />
          )}
          {!isLoginMode && (
            <ImageUpload
              errorText="Please provide an image"
              id="image"
              center
              onInput={inputHandler}
            />
          )}
          <Input
            onInput={inputHandler}
            id="email"
            type="email"
            element="input"
            label="E-mail"
            validators={[VALIDATOR_EMAIL]}
            errorText="Please enter valid email."
          />
          <Input
            onInput={inputHandler}
            id="password"
            type="password"
            element="input"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter at least 6 characters."
          />

          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOG IN" : "SIGN UP"}
          </Button>
        </form>
        <Button onClick={switchModeHandler} inverse>
          SWITCH TO {!isLoginMode ? "LOG IN" : "SIGN UP"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
