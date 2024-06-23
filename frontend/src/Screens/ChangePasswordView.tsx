import React, { useEffect, useState } from "react";
import "../App.css";
import "../types";

export default function ChangePasswordPage() {
    const [old_password, setOldPassword] = useState<string>("");
    const [new_password, setNewPassword] = useState<string>("");
    const [new_password2, setNewPassword2] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const changePassword = async () => {
        setSuccess(false);
        setError("");
        if(new_password.length < 8)
        {
            setError("New password must contain of at least 8 characters");
        }
        else if(new_password != new_password2)
        {
            setError("Passwords do not match");
        }
        else
        {
            const r = await fetch("http://127.0.0.1:8000/api/account/password/change", {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    old_password: old_password,
                    new_password: new_password,
                }),
            })
            .then((r) => {
                if(r.ok)
                {
                    setOldPassword("");
                    setNewPassword("");
                    setSuccess(true);
                }
                else if(r.status === 400)
                {
                    setError("Old password is wrong");
                }
                else
                {
                    setError("Something went wrong");
                }
            });
        }
    };


  return (
    <>
        {success ? (
            <span className="l">Password changed successfully!</span>
        ) : ""}
        {error ? (
            <span className="r">{error}</span>
        ) : ""}
        <br/>
        Old password:
        <input
            type="password"
            value={old_password}
            onChange={(e) => setOldPassword(e.target.value)}
        />
        <br/>
        New password:
        <input
            type="password"
            value={new_password}
            onChange={(e) => setNewPassword(e.target.value)}
        />
        <br/>
        Confirm your new password:
        <input
            type="password"
            value={new_password2}
            onChange={(e) => setNewPassword2(e.target.value)}
        />
        <br/>
        <button
            type="button"
            onClick={changePassword}
        >
        Save
        </button>
        <br/>
        <a href="/profile">Back</a>
    </>
  );
}