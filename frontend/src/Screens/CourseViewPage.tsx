import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import { timeAgo, getColorForSubject } from "../functions";
import "../types";
import ProgressBar from "../Components/ProgressBar";

type Params = {
    id: string;
}

export default function CourseViewPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [course, setCourse] = useState<Course>();
  const { id } = useParams<Params>();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [progressInfo, setProgressInfo] = useState<AccountsToCourses>();

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

  const postOrPutInfo = async () => {
    fetch(`http://127.0.0.1:8000/api/accountstocourses/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    });
    fetch(`http://127.0.0.1:8000/api/accountstocourses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    });
  };

  const fetchProgressInfo = async () => {
    fetch(`http://127.0.0.1:8000/api/accountstocourses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setProgressInfo(d));
  }


  const downloadCertificate = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/course/${id}/certificate`, {
          method: "GET",
          headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
          },
      });

      if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificate_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          fetchCourse();
      } else {
          console.log("Certificate download failed");
      }
  };

  useEffect(() => {
    fetchUser();
    fetchCourse();
    fetchSlides();
    fetchProgressInfo();
  }, []);

  if (user === undefined || course === undefined || progressInfo === undefined) {
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
              <div>
                <img className="avatar-medium" src={API_URL + (course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : course.author.avatar )} />
                <div className="avatar-user-level">
                  <p style={{backgroundColor: getColorForSubject(course.author_subject_info.subject.id), color: "white"}}>{course.author_subject_info.subject.name}</p>
                  <p style={{backgroundColor: getColorForSubject(course.author_subject_info.subject.id), color: "white"}}>Lvl. {course.author_subject_info.level}</p>
                </div>
              </div>
              &nbsp;&nbsp;
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
          <div className="back-next-buttons">
          {
            (progressInfo.progress && !progressInfo.completed) ?
            <>
              <a href={`/course/${id}/slide/${progressInfo.progress}/view`}>
                <button className="bg-black">Continue</button>
              </a>
              <a href={`/course/${id}/slide/1/view`}>
                <button onClick={(e) => postOrPutInfo()} className="bg-black">Start again</button>
              </a>
            </> :
            <>
              <a href={`/course/${id}/slide/1/view`}>
                <button onClick={(e) => postOrPutInfo()} className="bg-black">Start</button>
              </a>
            </>
          }
          </div>
          <br />
          <div className="course-progress">
            {
              !progressInfo.completed ?
              <>
                {
                  progressInfo.progress > 0 &&
                  <>
                    <h2>Current progress</h2>
                    <br />
                    <ProgressBar width={300} height={30} progress={progressInfo.progress / course.slidesCount * 300} displayPercentage={true} />
                    <br />
                    <b>{progressInfo.progress} / {course.slidesCount} slides viewed</b> 
                  </>
                }
              </> :
              <>
                <div style={{display: "flex", flexDirection: "column", flexWrap: "wrap", alignItems: "center"}}>
                  <div style={{display: "flex", alignItems: "center"}}>
                    <svg fill="#00cc00" width="30px" height="30px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg" stroke="#00cc00"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M854.344 1317.685 503.209 966.55l79.85-79.85 271.285 271.285 520.207-520.32 79.849 79.962-600.056 600.057ZM960.056 0c-529.355 0-960 430.645-960 960s430.645 960 960 960c529.243 0 960-430.645 960-960S1489.3 0 960.056 0Z" fill-rule="evenodd"></path> </g></svg>
                    &nbsp;
                    <b>Completed!!</b>
                  </div>
                  <br />
                  <button className="bg-green" style={{width: "250px"}} onClick={(e) => downloadCertificate()}>Download certificate</button>
                </div>

              </>
            }
          </div>
        </div>

    </>
  );
}