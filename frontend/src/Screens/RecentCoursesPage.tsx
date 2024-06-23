import React, { useEffect, useState } from "react";
import "../App.css";
import ProgressBar from "../Components/ProgressBar";
import "../types";


export default function RecentCoursesPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [recentCourses, setRecentCourses] = useState<AccountsToCourses[]>([]);

  const MAX_RECENT_COURSES_SHOWING = 999; // TODO na przyklad 4, 6, 8

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

  const fetchRecentCourses = async () => {
    fetch("http://127.0.0.1:8000/api/accountstocourses/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setRecentCourses(d));
  };

  const downloadCertificate = async (id: number) => {
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
    } else {
        console.log("Certificate download failed");
    }
};

  useEffect(() => {
    fetchUser();
    fetchRecentCourses();
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
          <a href="/home">
            <button className="bg-black">
              Back
            </button>
          </a>
        </div>
        <br/>
        <h2>My courses</h2>
        <br />
        {recentCourses.map((atc, i) => (
          <div className="recent-courses-page" key={i}>
            {i < MAX_RECENT_COURSES_SHOWING ? (
              <>
                <div className="recent-course-page">
                  <a href={`/course/${atc.course.id}/view`}>
                    <div className="recent-course">
                      <img className="avatar-large" src={API_URL + (atc.course.image ? atc.course.image : "/course_images/course_images/no_photo.jpg")} /><br/>
                      <div style={{textAlign: "left", marginLeft: "25px"}}>
                        <b>{atc.course.title}</b>
                        <div style={{display: "flex", alignItems: "center"}}>
                          {
                            !atc.completed ?
                            <>
                              <p style={{fontSize: "12px"}}>Progress</p>
                              &nbsp;&nbsp;
                              <ProgressBar width={100} height={8} progress={atc.progress / atc.course.slidesCount * 100} displayPercentage={false} />
                            </> :
                            <div className="course-completed-bar">Completed</div>
                          }
                        </div>
                      </div>
                    </div>
                  </a>
                  {
                    atc.completed ? (
                      <button className="button-download-recent-course-page" onClick={(e) => downloadCertificate(atc.course.id)}>View certificate</button>
                    ) : ("")
                  }
                </div>
              </>
            ) : ""}
          </div>
        ))}
    </>
  );
}