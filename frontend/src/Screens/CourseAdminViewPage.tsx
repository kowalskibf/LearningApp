import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import { timeAgo } from "../functions";
import "../types";

type Params = {
    id: string;
}

export default function CourseAdminViewPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [course, setCourse] = useState<Course>();
  const { id } = useParams<Params>();
  const [slides, setSlides] = useState<Slide[]>([]);

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

  const fetchAccount = async () => {
    fetch("http://127.0.0.1:8000/api/account", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => {setAccount(d); if(d.isAdmin == false){window.location.replace("/home");}});
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

  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchCourse();
    fetchSlides();
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
        <div className="course-name-page">
          <h2>{course.title}</h2>
          <div className="layer">
            <div className="slide-created-by">
              <p>Created by:</p>
              &nbsp;&nbsp;
              <img className="avatar-small" src={API_URL + (course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : course.author.avatar )} />
              <p>{course.author.user.username}</p>
            </div>
            <div className="last-update-info">
              <i>Last updated {timeAgo(new Date(course.modificationDate))}</i>
            </div>
          </div>
          <br /><br />
          <div className="slide-content">
            {course.description}
          </div>
          {slides.map((slide, i) => (
            <div className="slide-admin-view">
                <h3>Slide {i+1} - {slide.title ? slide.title : <i>brak</i>}</h3>
                &nbsp;&nbsp;&nbsp;
                <a href={`/admin/course/${id}/slide/${slide.slideNumber}/view`}>
                    <button className="bg-black">View</button>
                </a>
            </div>
          ))};
        </div>

    </>
  );
}