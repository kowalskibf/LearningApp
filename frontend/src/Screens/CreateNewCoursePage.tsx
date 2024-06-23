import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";

export default function CreateNewCoursePage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newCourseSubjectId, setNewCourseSubjectId] = useState<string>("");
  const [newCourseTitle, setNewCourseTitle] = useState<string>("");
  const [newCourseDescription, setNewCourseDescription] = useState<string>("");
  const [newCourseFile, setNewCourseFile] = useState<File | null>(null);

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
        setNewCourseSubjectId(data[0].id);
      });
  };

  const createNewCourse = async (event: { preventDefault: () => void}) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", newCourseTitle);
    formData.append("subject_id", newCourseSubjectId);
    formData.append("description", newCourseDescription);
    if(newCourseFile)
    formData.append("image", newCourseFile);
    const r = await fetch("http://127.0.0.1:8000/api/course", {
        method: "POST",
        headers: {
            Accept: "application/json",
            
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formData,
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/course/${d.courseId}/edit`));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      setNewCourseFile(e.target.files[0]);
      let fr = new FileReader();
      fr.onload = function () {
        document.getElementById("uploaded-image").src = fr.result;
      }
      fr.readAsDataURL(e.target.files[0]);
      console.log(newCourseFile);
    }
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
          <a href={"/courses"}>
            <button className="bg-black" type="button">
              Back to courses
            </button>
          </a>
        </div>
        <h3>Create new course</h3>
        <div className="new-course-data">
          <div className="form-data">
            Choose subject:
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <select
                id="course_subject"
                name="course_subject"
                onChange={(e) => setNewCourseSubjectId(e.target.value)}
            >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
            </select>
          </div>
          <div className="form-data">
            <label>
              Course title:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                  type="text"
                  id="subject_name"
                  name="subject_name"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
              />
            </label>
          </div>
          <div className="form-data">
            Course description:
            &nbsp;&nbsp;
            <textarea
                id="subject_name"
                name="subject_name"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
              />
          </div>
          <div className="form-data">
            <label>
              Course image:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <label className="input-type-file">
                Upload image
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
              </label>
            </label>
          </div>
          {
            newCourseFile &&
            <div className="form-data">
              <label>Uploaded image:</label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <img id="uploaded-image"></img>
            </div> 
          }
        </div>
        <br /><br />
        <button
          disabled={!newCourseTitle || !newCourseDescription}
          className="bg-black"
          type="button"
          onClick={createNewCourse}
        >
          Save
        </button>
    </>
  );
}