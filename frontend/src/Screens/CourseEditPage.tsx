import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";

type Params = {
    id: string;
}

export default function CourseEditPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [course, setCourse] = useState<Course>();
  const { id } = useParams<Params>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newCourseSubjectId, setNewCourseSubjectId] = useState<string>("");
  const [newCourseTitle, setNewCourseTitle] = useState<string>("");
  const [newCourseDescription, setNewCourseDescription] = useState<string>("");
  const [newCourseFile, setNewCourseFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);

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

  const fetchCourse = async () => {
    fetch(`http://127.0.0.1:8000/api/course/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourse(data);
        console.log(data);
        setNewCourseTitle(data.title);
        setNewCourseDescription(data.description);
        setNewCourseSubjectId(data.subject.id);
      });
  };
  
  const fetchSlides = async () => {
    fetch(`http://127.0.0.1:8000/api/course/${id}/slides`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setSlides(d));
  };

  const editCourse = async (event: { preventDefault: () => void}) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", newCourseTitle);
    formData.append("subject_id", newCourseSubjectId);
    formData.append("description", newCourseDescription);
    if(newCourseFile)
    formData.append("image", newCourseFile);
    const r = await fetch(`http://127.0.0.1:8000/api/course/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formData,
    })
    .then((r) => {
        if(r.ok)
        {
            console.log("ok");
            setEditSuccessful(true);
            fetchCourse();

        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  const fetchAccount = async () => {
    fetch("http://127.0.0.1:8000/api/account", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setAccount(d));
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


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      setNewCourseFile(e.target.files[0]);
      console.log(newCourseFile);
    }
  }

  const createNewSlide = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/course/${id}/slide/new`, {
      method: "POST",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      }
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/course/${id}/slide/${d.slideNumber}/edit`))
  };

  

  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchCourse();
    fetchSlides();
    fetchSubjects();
  }, []);

  if (user === undefined || course === undefined) {
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
      {
        (account?.isAdmin || course.author.user.id === user.id) ?
        <>
          {editSuccessful ? (
            <>
              <span className="l">Edit successful!</span>
              <br/>
            </>
          ) : ""}
          <div className="w-100 ta-left">
            <a href="/courses">
              <button className="bg-black">Back to courses</button>
            </a>
          </div>
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
              </label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <img className="robocza-klasa-zdj-courses" src={API_URL + course.image} />
            </div>
            <div className="w-100 ta-right">
              <label className="input-type-file">
                Upload new image
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <div className="slides-list-edit">
            {!slides.length && 
              <i>The course has no slides yet</i>
            }
            <div className="w-100 ta-right">
              <button
                className="bg-black"
                type="button"
                onClick={createNewSlide}
              >
                Create New Slide
              </button>
            </div>
            <br />
            {slides.map((slide) => (
              <div className="slide-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                <a href={`/course/${id}/slide/${slide.slideNumber}/edit`}>
                  <button>
                    {slide.title}
                  </button>
                </a>
              </div>
            ))}
          </div>
          <button
            disabled={!newCourseTitle || !newCourseDescription}
            className="mt-40 bg-black"
            type="button"
            onClick={editCourse}
          >
            Save
          </button>
        </> :
        <>
          <h2>You are not permitted to enter this page</h2>
        </>
      }
        
    </>
  );
}