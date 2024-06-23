import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";

export default function CreateThreadPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [threadSubjectId, setThreadSubjectId] = useState<string>("");
  const [threadTitle, setThreadTitle] = useState<string>("");
  const [threadContent, setThreadContent] = useState<string>("");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: ["right", "center", "justify"] }],
      ["link", "video", "code-block", "image"],
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "link",
    "color",
    "video",
    "image",
    "background",
    "align"
  ];

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
        setThreadSubjectId(data[0].id);
      });
  };

  const createNewThread = async () => {
    const r = await fetch("http://127.0.0.1:8000/api/thread", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            subject_id: threadSubjectId,
            title: threadTitle,
            content: threadContent,
        }),
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/threads`));
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
        <link href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" rel="stylesheet" />
        <div className="w-100 ta-left">
          <a href="/threads">
            <button className="bg-black">Back</button>
          </a>
        </div>
        <h2>Create new thread</h2>
        <br />
        <div className="new-course-data">
          <div className="form-data">
            <label>
              Choose subject:
              &nbsp;&nbsp;
              <select
                onChange={(e) => setThreadSubjectId(e.target.value)}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-data">
            <label>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Title:
              &nbsp;&nbsp;
              <input
                type="text"
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="w-100 ta-left">
          <h2>Your question:</h2>
          <br />
          <ReactQuill
          theme="snow"
          modules={modules}
          formats={formats}
          value={threadContent}
          onChange={setThreadContent}
          />
          <br />
          <button
            className="bg-black"
            type="button"
            onClick={createNewThread}
          >Post thread</button>
        </div>
        
    </>
  );
}