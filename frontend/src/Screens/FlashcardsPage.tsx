import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";

export default function FlashcardsPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchFlashcards, setSearchFlashcards] = useState<string>("");
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [deleteSuccessful, setDeleteSuccessful] = useState<boolean>(false);

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
      });
  };

  const fetchFlashcardSets = async () => {
    fetch("http://127.0.0.1:8000/api/flashcardsets/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFlashcardSets(data);
      });
  };

  const editFlashcard =  (id: String) => {
    window.location.replace(`flashcardset/${id}/edit`);
  };

  const exportCSV = async (id: number) => {
    const response = await fetch(`http://127.0.0.1:8000/api/flashcardset/${id}/export`, {
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
        a.download = `flashcards_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        console.log("Export failed");
    }
  };

  const deleteFlashcardSet = async (flashcardSetId: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/flashcardset/${flashcardSetId}`, {
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
            setDeleteSuccessful(true);
            fetchFlashcardSets();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  useEffect(() => {
    fetchUser();
    fetchSubjects();
    fetchFlashcardSets();
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
        <h2>Flashcards</h2>
        <div className="w-100 ta-right">
          <a href="/flashcardset/new">
            <button className="bg-black">
              Create new flashcard set
            </button>
          </a>
        </div>
        <br />
        <div className="search-courses">
          <input
              type="text"
              className="search-courses-input"
              placeholder="Search flashcards"
              value={searchFlashcards}
              onChange={(e) => setSearchFlashcards(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20"><path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211M4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474"/></svg>
        </div>
        <br />
        {
          !flashcardSets.length ? (
            <i>No flashcards yet</i>
          ) : ""
        }
        <div className="courses">
          {flashcardSets.filter(f => {return !searchFlashcards.length || f.title.toLowerCase().includes(searchFlashcards.toLowerCase())}).map((f) => (
            <a href={`/flashcardset/${f.id}/view`}>
              <div className="course">
                <img className="robocza-klasa-zdj-courses" src={API_URL + (f.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.author.avatar)} />
                <p className="ff-roboto">{f.title ? f.title : "Bez tytułu"}</p>
                <br />
                <div className="course-author">
                  <img className="avatar-small" src={API_URL + (f.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.author.avatar)} />
                  <p className="fs-12">{f.author.user.username ? f.author.user.username : "brak"}</p>
                </div>
                <div className="course-length-info">
                  <div className="course-pages-quantity">
                    <p className="fs-12">{f.flashcardsCount} questions</p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
        <br /><br />
        <h2>My flashcards</h2>
        <br />
        {
          !flashcardSets.filter((f) => {return f.author.user.id === user.id}).length &&
          <i>You have no flashcards yet</i>
        }
        <div className="courses">
          {flashcardSets.filter((f) => {return f.author.user.id === user.id}).map((f) => (
            <div className="course">
              <a href={`/flashcardset/${f.id}/view`}>
                <img className="robocza-klasa-zdj-courses" src={API_URL + (f.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.author.avatar)} />
                <p className="ff-roboto">{f.title ? f.title : "Bez tytułu"}</p>
                <br />
                <div className="course-author">
                  <img className="avatar-small" src={API_URL + (f.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.author.avatar)} />
                  <p className="fs-12">{f.author.user.username ? f.author.user.username : "brak"}</p>
                </div>
                <div className="course-length-info">
                  <div className="course-pages-quantity">
                    <p className="fs-12">{f.flashcardsCount} questions</p>
                  </div>
                </div>
              </a>
              <div className="course-action-buttons">
                <div onClick={(e) => editFlashcard(f.id)} className="course-action-button edit-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                  Edit
                </div>
                <div onClick={(e) => deleteFlashcardSet(f.id)} className="course-action-button delete-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  Delete
                </div>
                <div onClick={(e) => exportCSV(f.id)} className="course-action-button import-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17l5-5-5-5M19.8 12H9M10 3H4v18h6"/></svg>
                  Import as .csv
                </div>
              </div>
            </div>
          ))}
        </div>
    </>
  );
}