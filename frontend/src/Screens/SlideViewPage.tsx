import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";
import { timeAgo, getWindowDimensions, getColorForSubject } from "../functions";

type Params = {
    courseid: string;
    slidenum: string;
}

export default function SlideViewPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [course, setCourse] = useState<Course>();
  const [courseSlides, setCourseSlides] = useState<Slide[]>([]);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const { courseid, slidenum } = useParams<Params>();
  const [slide, setSlide] = useState<Slide>();
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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

  const fetchChatMessages = async () => {
    fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/${slidenum}/chat`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setChatMessages(d));
  };

  const fetchCourseSlides = async () => {
    fetch(`http://127.0.0.1:8000/api/course/${courseid}/slides`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setCourseSlides(d));
  }

  const sendChatMessage = async () => {
    if (chatMessage) {
      const r = await fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/${slidenum}/chat`, {
        method: "POST",
        headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: chatMessage,
        }),
      })
      .then((r) => {
        if(r.ok)
        {
          fetchChatMessages();
        }
      });
    }
  };

  const fetchProgressInfo = async () => {
    fetch(`http://127.0.0.1:8000/api/accountstocourses/${courseid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setProgressInfo(d));
  }

  const handleKeyDownPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendChatMessage();
      setChatMessage("");
    }
  };

  const putInfo = async () => {
    fetch(`http://127.0.0.1:8000/api/accountstocourses/${courseid}/${slidenum}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    });
  };

  const getNewVideoSize = () => {
    let newVideoWidth, newVideoHeight;
    if (windowDimensions.width > 800) {
      newVideoWidth = 600;
    }
    else if (windowDimensions.width > 600) {
      newVideoWidth = 400;
    }
    else {
      newVideoWidth = 300;
    }
    newVideoHeight = newVideoWidth / 2;
    return {width: newVideoWidth, height: newVideoHeight};
  };

  const [videoSize, setVideoSize] = useState<{width: number, height: number}>(getNewVideoSize());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setVideoSize(getNewVideoSize());
  }, [windowDimensions]);

  useEffect(() => {
    fetchUser();
    fetchSlide();
    fetchCourseSlides();
    fetchProgressInfo();
    fetchChatMessages();
    putInfo();
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
            <div>
              <img className="avatar-medium" src={API_URL + (slide.course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : slide.course.author.avatar )} />
              <div className="avatar-user-level">
                <p style={{backgroundColor: getColorForSubject(slide.course.author_subject_info.subject.id), color: "white"}}>{slide.course.author_subject_info.subject.name}</p>
                <p style={{backgroundColor: getColorForSubject(slide.course.author_subject_info.subject.id), color: "white"}}>Lvl. {slide.course.author_subject_info.level}</p>
              </div>
            </div>
            &nbsp;&nbsp;
            <p>{slide.course.author.user.username}</p>
          </div>
          <div className="last-update-info">
            <i>Last updated {timeAgo(new Date(slide.course.modificationDate))}</i>
          </div>
        </div>
        <br />
        <div className="layer">
          {slide.image && slide.image.toLowerCase().endsWith('.mp4') ? (
            <video width={videoSize.width} height={videoSize.height} controls>
              <source src={API_URL + slide.image}/>
              Twoja przeglądarka nie wspiera odtwarzania wideo.
            </video>
          ) : (
            <img className="slide-image" src={!slide.image ? API_URL + "/course_images/course_images/no_photo.jpg" : API_URL + slide.image} />
          )}
          <div className="slide-messages-container">
            <div className="slide-messages">
              {chatMessages.map((msg) => (
                <>
                <div className="slide-message">
                  <div className="slide-message-avatar">
                    <img className="avatar-small-no-margin" src={API_URL + (msg.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : msg.author.avatar)} />
                    <i>{msg.author.user.username}</i>
                    <div className="avatar-user-level">
                      <p style={{backgroundColor: getColorForSubject(slide.course.author_subject_info.subject.id), color: "white"}}>{slide.course.author_subject_info.subject.name}</p>
                      <p style={{backgroundColor: getColorForSubject(slide.course.author_subject_info.subject.id), color: "white"}}>Lvl. {slide.course.author_subject_info.level}</p>
                    </div>
                  </div>
                  <div className="slide-message-content">
                    <p>{msg.content}</p>
                    <div className="w-100 ta-right fs-8">
                      <i>{timeAgo(new Date(msg.date))}</i>
                    </div>
                  </div>
                </div>
                <div style={{height: "5px"}}></div>
                </>
              ))}
            </div>
            <div className="slide-leaving-comment">
              <input 
                placeholder="Leave a comment"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDownPressed}
              />
              <svg onClick={sendChatMessage} fill="#000000" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 495.003 495.003" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="XMLID_51_"> <path id="XMLID_53_" d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616 l-67.6-32.22V456.687z"></path> <path id="XMLID_52_" d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422 c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414 l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956 L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"></path> </g> </g></svg>
            </div>
          </div>
        </div>
        <br /><br />
        <div className="slide-content">
          {slide.content}
        </div>
        <br />
        <div className="back-next-buttons">
          {
            slide.slideNumber > 1 &&
            <a href={`/course/${courseid}/slide/${slide.slideNumber-1}/view`}>
              <button>Back</button>
            </a>
          }
          {
            slide.slideNumber < slide.course.slidesCount &&
            <a href={`/course/${courseid}/slide/${slide.slideNumber+1}/view`}>
              <button>Next</button>
            </a>
          }
          {/* @TODO Implement finishing course */}
          {
            slide.slideNumber === slide.course.slidesCount &&
            <a href={`/course/${courseid}/view`}>
              <button>Finish</button>
            </a>
          }
        </div>
        <div className="course-nav">
          {
            courseSlides.map((courseSlide) => (
              <a className={(!progressInfo?.completed && courseSlide.slideNumber > progressInfo?.progress) ? "disabled" : ""} 
                  href={`/course/${courseid}/slide/${courseSlide.slideNumber}/view`}
              >
                <div className="course-nav-slide">
                  <p>#{courseSlide.slideNumber} - {courseSlide.title}</p>
                </div>
              </a>
            ))
          }
        </div>
      </div>
    </>
  );
}