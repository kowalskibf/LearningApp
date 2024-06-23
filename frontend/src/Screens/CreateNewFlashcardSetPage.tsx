import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";

export default function CreateNewFlashcardSetPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");

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
      });
  };

  const fetchSubjects = async () => {
    fetch("http://127.0.0.1:8000/api/subjects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSubjects(data);
        setSubjectId(data[0].id);
      });
  };

  const createNewFlashcardSet = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/flashcardset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            title: title,
            description: description,
            subject_id: subjectId,
        }),
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/flashcardset/${d.flashcardSetId}/edit`));
  }

  useEffect(() => {
    fetchUser();
    fetchSubjects();
  }, []);

  if (user === undefined) {
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
        <div className="w-100 ta-left">
        <a href="/flashcards">
          <button className="bg-black">Back to flashcards</button>
        </a>
        </div>
        <div className="new-course-data">
          <div className="form-data">
            Title:
            &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-data">
            Description:
            &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-data">
            Choose subject:
            &nbsp;
            <select
              onChange={(e) => setSubjectId(e.target.value)}
            >
              {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>
        <br/>
        <button
          className="bg-black"
          type="button"
          onClick={createNewFlashcardSet}
        >Create a new set</button>
    </>
  );
}