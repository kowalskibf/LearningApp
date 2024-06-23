import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";

type Params = {
    courseid: string;
    slidenum: string;
}

export default function SlideEditPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [course, setCourse] = useState<Course>();
  const { courseid, slidenum } = useParams<Params>();
  const [slide, setSlide] = useState<Slide>();
  const [slideTitle, setSlideTitle] = useState<string>("");
  const [slideContent, setSlideContent] = useState<string>("");
  const [slideImage, setSlideImage] = useState<File | null>(null);
  const [slideVideo, setSlideVideo] = useState<File | null>(null);

  const [slideImageChanged, setSlideImageChanged] = useState<boolean>(false);
  const [editSuccessful, setEditSuccessful] = useState<boolean>(false);
  const [imageEditSuccessful, setImageEditSuccessful] = useState<boolean>(false);

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
        setSlideTitle(d.title);
        setSlideContent(d.content);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      if (!e.target.files[0].name.endsWith('.mp4')) {
        setSlideImageChanged(true);
        setSlideImage(e.target.files[0]);
        let fr = new FileReader();
        fr.onload = function () {
          document.getElementById("uploaded-image").src = fr.result;
        }
        fr.readAsDataURL(e.target.files[0]);
      }
      else {
        setSlideImageChanged(true);
        setSlideVideo(e.target.files[0]);
        let fr = new FileReader();
        fr.onload = function () {
          document.getElementById("uploaded-video").src = fr.result;
        }
        fr.readAsDataURL(e.target.files[0]);
      }
      
    }
  }

  const createNewSlide = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/new`, {
      method: "POST",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      }
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/course/${courseid}/slide/${d.slideNumber}/edit`))
  };

  const editSlide = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/${slidenum}`, {
      method: "PUT",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: slideTitle,
        content: slideContent,
      }),
    })
    .then(() => {
      if (slideImageChanged)
        editSlideImage();
      fetchSlide();
      setEditSuccessful(true);
    });
  };
  
  const editSlideImage = async () => {
    const formData = new FormData();
    if(slideImage)
    formData.append("image", slideImage);
    if(slideVideo)
    formData.append("image", slideVideo);
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseid}/slide/${slidenum}/image`, {
      method: "PUT",
      headers: {
          Accept: "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
    .then(() => {
      fetchSlide();
    });
  };

  useEffect(() => {
    fetchUser();
    fetchAccount();
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
    {
      (account?.isAdmin || slide.course.author.user.id === user.id) ?
      <>
        {editSuccessful ? (
          <>
            <span className="l">Edit successful!</span>
            <br/>
          </>
        ) : ""}
        {imageEditSuccessful ? (
          <>
            <span className="l">Image edit successful!</span>
            <br/>
          </>
        ) : ""}
        <div className="w-100 ta-left">
          <a href={"/courses"}>
            <button className="bg-black" type="button">
              Back to courses
            </button>
          </a>
        </div>
        Slide {slide.slideNumber}/{slide.course.slidesCount}<br/>
        <div className="new-course-data">
          <div className="form-data">
            Slide title:
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
              type="text"
              id="name"
              name="name"
              value={slideTitle}
              onChange={(e) => setSlideTitle(e.target.value)}
            />
          </div>
          <div className="form-data">
            Slide content:
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <textarea
              id="name"
              name="name"
              value={slideContent}
              onChange={(e) => setSlideContent(e.target.value)}
            />
          </div>
          <div className="form-data">
            Slide photo or video: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {slide.image && slide.image.toLowerCase().endsWith('.mp4') ? (
            <video width={300} height={150} controls>
              <source src={API_URL + slide.image}/>
              Twoja przeglądarka nie wspiera odtwarzania wideo.
            </video>
            ) : (
              <img className="slide-image" src={!slide.image ? API_URL + "/course_images/course_images/no_photo.jpg" : API_URL + slide.image} />
            )}
          </div>
          <br />
          <div className="w-100 ta-right">
            <label className="input-type-file">
              Upload new image or video
              <input
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
              />
            </label>
          </div>
          <br />
          {
            slideImage &&
            <div className="form-data">
              <label>Uploaded image:</label>&nbsp;&nbsp;&nbsp;&nbsp;
              <img id="uploaded-image"></img>
              
            </div> 
          }
          {
            slideVideo &&
            <div className="form-data">
              <label>Uploaded video:</label>
              <video id="uploaded-video" width={300} height={150} controls>
                <source src={API_URL + slide.image}/>
                Twoja przeglądarka nie wspiera odtwarzania wideo.
              </video>
            </div>
          }
        </div>
        <br/>
        <button disabled={!slideTitle || !slideContent} className="bg-black" type="button" onClick={editSlide}>Save</button>
        <br />
        <div className="back-next-buttons">
          {slide.slideNumber > 1 && (
              <a href={`/course/${courseid}/slide/${slide.slideNumber-1}/edit`}>
                <button>Previous slide</button>
              </a>
          )}
          {slide.slideNumber == slide.course.slidesCount ? (
              <button type="button" onClick={createNewSlide}>Create New Slide</button>
          ) : (
              <a href={`/course/${courseid}/slide/${slide.slideNumber+1}/edit`}>
                <button>Next slide</button>
              </a>
          )}
        </div>
        
      </> :
      <>
        <h2>You are not permitted to enter this page</h2>
      </>
    }
    </>
  );
}