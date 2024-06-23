import React, { useState } from "react";

export default function Login() {

  const [loginError, setLoginError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Make a request to your API to check if the credentials are valid
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
          setLoginError("Invalid credentials");
          throw Error("Something went wrong");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="login-main-container">
      <div className="new-course-data">
        <form onSubmit={handleSubmit}>
          <div className="form-data">
            <label>
              Login:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                type="text"
                className="login-form-input"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
          </div>
          <div className="form-data">
            Password:
            &nbsp;&nbsp;&nbsp;&nbsp;
            <input
              type="password"
              className="login-form-input"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <br />
          <div className="w-100 ta-right">
            <button className="bg-black" type="submit">
              Log in
            </button>
          </div>
        </form>
      </div>
      {loginError.length === 0 ? "" : (
        <div className="r">
          {loginError}
        </div>
      )}
      <br /><br />
      <div className="login-no-account">
        Don't have an account? <a href="/register"><span className="span-secondary-color">Register here</span></a>!
      </div>
    </div>
  );
}