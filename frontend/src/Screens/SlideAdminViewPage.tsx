import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";
import { timeAgo } from "../functions";

type Params = {
    courseid: string;
    slidenum: string;
}

export default function SlideAdminViewPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [course, setCourse] = useState<Course>();
  const { courseid, slidenum } = useParams<Params>();
  const [slide, setSlide] = useState<Slide>();

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
  
  const fetchSlide = async () => {
    fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/${slidenum}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => {
        setSlide(d);
    });
  };

  useEffect(() => {
    fetchUser();
    fetchSlide();
  }, []);

  if (user === undefined || slide === undefined) {
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
      <div className="slide-view-page">
        <div className="w-100 ta-left">
          <a href={"/courses"}>
            <button className="bg-black" type="button">
              Back to courses
            </button>
          </a>
        </div>
        <h2>{slide.course.title}</h2>
        <h4>Topic: {slide.title}</h4>
        <div className="layer">
          <div className="slide-created-by">
            <p>Created by:</p>
            &nbsp;&nbsp;
            <img className="avatar-small" src={API_URL + (slide.course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : slide.course.author.avatar )} />
            <p>{slide.course.author.user.username}</p>
          </div>
          <div className="last-update-info">
            <i>Last updated {timeAgo(new Date(slide.course.modificationDate))}</i>
          </div>
        </div>
        <br />
        <div className="layer">
          {slide.image && slide.image.toLowerCase().endsWith('.mp4') ? (
            <video width={600} height={300} controls>
              <source src={API_URL + slide.image}/>
              Twoja przeglądarka nie wspiera odtwarzania wideo.
            </video>
          ) : (
            <img className="slide-image" src={!slide.image ? API_URL + "/course_images/course_images/no_photo.jpg" : API_URL + slide.image} />
          )}
        </div>
        <br /><br />
        <div className="slide-content">
          {slide.content}
        </div>
        <br /><br />
        <div className="back-next-buttons">
          {
            slide.slideNumber > 1 &&
            <a href={`/admin/course/${courseid}/slide/${slide.slideNumber-1}/view`}>
              <button>Back</button>
            </a>
          }
          {
            slide.slideNumber < slide.course.slidesCount &&
            <a href={`/admin/course/${courseid}/slide/${slide.slideNumber+1}/view`}>
              <button>Next</button>
            </a>
          }
          {
            slide.slideNumber === slide.course.slidesCount &&
            <a href={`/admin/course/${courseid}/view`}>
              <button>Finish</button>
            </a>
          }
        </div>
      </div>
    </>
  );
}