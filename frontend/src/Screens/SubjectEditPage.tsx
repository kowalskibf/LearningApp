import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";

type Params = {
    id: string;
}

export default function SubjectEditPage() {
  const [user, setUser] = useState<User>();
  const [subject, setSubject] = useState<Subject>();
  const { id } = useParams<Params>();
  const [subjectName, setSubjectName] = useState<string>("");
  const [editSuccessful, setEditSuccessful] = useState<boolean>(false);

  const fetchUser = async () => {
    fetch("http://127.0.0.1:8000/api/auth/users/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        console.log(data);
      });
  };

  const fetchSubject = async () => {
    fetch(`http://127.0.0.1:8000/api/subject/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSubject(data);
        console.log(data);
        setSubjectName(data.name);
      });
  };
  
  const editSubject = async (event: { preventDefault: () => void}) => {
    event.preventDefault();
    const r = await fetch(`http://127.0.0.1:8000/api/subject/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            name: subjectName,
        }),
    })
    .then((r) => {
        if(r.ok)
        {
            console.log("ok");
            setEditSuccessful(true);

        }
        else
        {
            console.log("nie dziala");
        }
    });
  };


  useEffect(() => {
    fetchUser();
    fetchSubject();
  }, []);

  if (user === undefined || subject === undefined) {
    return (
      <div>
        <div className="skeleton"></div>
        <div className="skeleton"></div>
        <div className="skeleton"></div>
        <div className="skeleton"></div>
      </div>
    );
  }

  return (
    <>
        {editSuccessful ? (
          <>
            <span className="l">Edit successful!</span>
            <br/>
          </>
        ) : ""}
        Id: {subject.id}<br/>
        <input
            type="text"
            id="name"
            name="name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
        />
        <button
            type="button"
            onClick={editSubject}
        >
            Save
        </button>
        <a href="/subjects">Back</a>

    </>
  );
}