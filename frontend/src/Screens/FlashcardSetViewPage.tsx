import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import { timeAgo, getColorForSubject } from "../functions";
import "../types";

type Params = {
    id: string;
}

export default function FlashcardSetViewPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>();
  const { id } = useParams<Params>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

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

  const fetchFlashcardSet = async () => {
    fetch(`http://127.0.0.1:8000/api/flashcardset/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {setFlashcardSet(data)});
  };
  
  const fetchFlashcards = async () => {
    fetch(`http://127.0.0.1:8000/api/flashcardset/${id}/flashcards`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => setFlashcards(d));
  };

  const exportCSV = async () => {
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


  useEffect(() => {
    fetchUser();
    fetchFlashcardSet();
    fetchFlashcards();
  }, []);

  if (user === undefined || flashcardSet === undefined) {
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
        <a href="/flashcards">
          <button className="bg-black">Back</button>
        </a>
      </div>
      <h2>{flashcardSet.title}</h2>
      <div className="layer">
        <div className="slide-created-by">
          <p>Created by:</p>
          &nbsp;&nbsp;
          <div>
            <img className="avatar-medium" src={API_URL + (flashcardSet.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : flashcardSet.author.avatar )} />
            <div className="avatar-user-level">
              <p style={{backgroundColor: getColorForSubject(flashcardSet.author_subject_info.subject.id), color: "white"}}>{flashcardSet.author_subject_info.subject.name}</p>
              <p style={{backgroundColor: getColorForSubject(flashcardSet.author_subject_info.subject.id), color: "white"}}>Lvl. {flashcardSet.author_subject_info.level}</p>
            </div>
          </div>
          &nbsp;&nbsp;
          <p>{flashcardSet.author.user.username}</p>
        </div>
        <div className="last-update-info">
          <i>Last updated {timeAgo(new Date(flashcardSet.modificationDate))}</i>
        </div>
      </div>
      <div className="flashcardset-length-info">
        <p>{flashcardSet.flashcardsCount} {flashcardSet.flashcardsCount === 1 ? "flashcard" : "flashcards"}</p>
      </div>
      <div className="w-100">
        <button className="export-csv-button" onClick={exportCSV}>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 17l5-5-5-5M19.8 12H9M10 3H4v18h6"/></svg>
          Export CSV
        </button>
      </div>
      <br /><br /><br />
      <div className="slide-content">
        {flashcardSet.description}
      </div>
      <div className="back-next-buttons">
        <a href={`/flashcardset/${flashcardSet.id}/practice`}><button>Study mode</button></a>
        <a href={`/flashcardset/${flashcardSet.id}/test`}><button>Test mode</button></a>
      </div>
    </>
  );
}