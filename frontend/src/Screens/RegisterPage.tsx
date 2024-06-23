import React, { useEffect, useState } from "react";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");

  const [registerError, setRegisterError] = useState<string>("");

  const validUsername = new RegExp("^([a-z0-9]{1,25})$");

  const logIn = async (username: string, password: string) => {
    const response = await fetch("http://127.0.0.1:8000/api-token-auth/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          response
            .json()
            .then((data) => {
              localStorage.setItem("token", data.token);
            })
            .then(() => window.location.replace("/home"));
        } else {
          throw Error("Something went wrong");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username.length == 0 || username.length > 25) {
      setRegisterError("Username must be between 1 and 25 characters long");
    } else if (!validUsername.test(username)) {
      setRegisterError("Username must be alphanumeric");
    } else if (email.length == 0 || email.length > 40) {
      setRegisterError("Email must be between 1 and 40 characters long");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setRegisterError("Invalid email format");
    } else if (password1.length < 8 || password1.length > 25) {
      setRegisterError("Password must be between 8 and 25 characters long");
    } else if (password1 != password2) {
      setRegisterError("Passwords do not match");
    } else {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          username: username,
          password: password1,
          email: email,
        }),
      })
        .then((response) => {
          if (response.ok) {
            logIn(username, password1);
          } else if (response.status === 409) {
            setRegisterError("Username already taken");
          } else {
            setRegisterError("Something went wrong");
            throw Error("Something went wrong");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="login-main-container">
      <h2>Register</h2>
      <br />
      <div className="new-course-data">
        <form onSubmit={register}>
          <div className="form-data">
            <label>
              Username:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="text"
                className="login-form-input"
                placeholder="Username"
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
          </div>
          <div className="form-data">
            <label>
              Email:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="text"
                className="login-form-input"
                placeholder="Email"
                id="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>
          <div className="form-data">
            <label>
              Password:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="password"
                className="login-form-input"
                placeholder="Password"
                id="password1"
                name="password1"
                value={password1}
                onChange={(event) => setPassword1(event.target.value)}
              />
            </label>
          </div>
          <div className="form-data">
            <label>
              Repeat password:
              &nbsp;
              <input
                  type="password"
                  className="login-form-input"
                  placeholder="Confirm password"
                  id="password2"
                  name="password2"
                  value={password2}
                  onChange={(event) => setPassword2(event.target.value)}
                />
            </label>
          </div>
          <div className="w-100 ta-right">
            <button type="submit" className="bg-black">
              Register
            </button>
          </div>
        </form>
      </div>
      {registerError.length === 0 ? "" : (
        <div className="r">
          {registerError}
        </div>
      )}
      <div className="login-no-account">
        Already have an account?{" "}
        <a href="/login">
          <span className="span-secondary-color">Login here</span>
        </a>
        !
      </div>
    </div>
  );
}