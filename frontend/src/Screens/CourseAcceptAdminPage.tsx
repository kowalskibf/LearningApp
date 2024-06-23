// import React from "react";
import React, { useEffect, useState } from "react";
import "../App.css";
import "../types";


export default function CourseAcceptAdminPage() {
    const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  const fetchUser = async () => {
    fetch("http://127.0.0.1:8000/api/auth/users/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setUser(d));
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

  const fetchCourses = async () => {
    fetch("http://127.0.0.1:8000/api/courses/notaccepted", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        console.log(courses);
      });
  };

  const acceptCourse = async (courseId: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseId}/accept`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        }
    })
    .then((r) => {
        if(r.ok)
        {
            fetchCourses();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  }; 

  const deleteCourse = async (courseId: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseId}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        }
    })
    .then((r) => {
        if(r.ok)
        {
            fetchCourses();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };


  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchCourses();
  }, []);

  if (user === undefined || account === undefined) {
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
    <div>
      <div className="courses">
      {
        !courses.length &&
        <i>There are no courses pending for acceptation</i>
      }
      {courses.map((course) => (
        <>
          <div className="course">
            <a href={`/admin/course/${course.id}/view`}>
              <img className="robocza-klasa-zdj-courses" src={API_URL + (course.image ? course.image : "/course_images/course_images/no_photo.jpg")} />
              <p className="ff-roboto">{course.title ? course.title : "Bez tytułu"}</p>
              <br />
              <div className="course-author">
                <img className="avatar-small" src={API_URL + (course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : course.author.avatar)} />
                <p className="fs-12">{course.author.user.username ? course.author.user.username : "brak"}</p>
              </div>
              <div className="course-length-info">
                <div className="course-pages-quantity">
                  <p className="fs-12">{course.slidesCount} pages</p>
                </div>
                <div className="course-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.6 18.6L12 12V2.5"/><circle cx="12" cy="12" r="10"/></svg>
                  {/* @TODO Add time to course */}
                  <p className="fs-12">1-2h</p>
                </div>
              </div>
            </a>
            <div style={{display: "flex", justifyContent: "space-around"}}>
              <button className="bg-green" onClick={(e) => acceptCourse(course.id)}>Accept</button>
              <button className="bg-red" onClick={(e) => deleteCourse(course.id)}>Decline</button>
            </div>
          </div>
        
        </>
      ))}
      </div>
    </div>
  );
};