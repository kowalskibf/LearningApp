import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";
import { shuffle } from "../functions";

type Params = {
    id: string;
}

export default function FlashcardSetPracticeModePage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>();
  const { id } = useParams<Params>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [flashcardNumber, setFlashcardNumber] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

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
    .then((f) => shuffle(f))
    .then((d) => setFlashcards(d));
  };




  useEffect(() => {
    fetchUser();
    fetchFlashcardSet();
    fetchFlashcards();
    console.log(flashcards);
  }, []);

  if (user === undefined || flashcardSet === undefined || flashcards === undefined) {
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
        <a href={`/flashcardset/${flashcardSet.id}/view`}>
          <button className="bg-black">Back to flashcards</button>
        </a>
      </div>
      <div className="flashcards-practice-mode-page">
        <h2>{flashcardSet.title}</h2>
        <br />
        {flashcards.length > 0 && flashcardNumber < flashcards.length ? (
          <> 
            { !flipped &&
              <div className="flashcard-question-content">
                {flashcards[flashcardNumber].question}
              </div>
            }
            { flipped &&
              <div className="flashcard-answer-content">
                {flashcards[flashcardNumber].answer}
              </div>
            }
            <br />
            <button className="bg-ee" type="button" onClick={() => setFlipped(!flipped)}>
              Flip
            </button>
            <br />
            <div className="back-next-buttons">
              {flashcardNumber > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardNumber(flashcardNumber - 1);
                    setFlipped(false);
                  }}
                >
                  Prev
                </button>
              ) : (
                <button type="button" onClick={() => window.location.replace(`/flashcardset/${flashcardSet.id}/view`)}>
                  Back
                </button>
              )}
              {flashcardNumber < flashcards.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setFlashcardNumber(flashcardNumber + 1);
                    setFlipped(false);
                  }}
                >
                  Next
                </button>
              ) : (
                <button type="button" onClick={() => window.location.replace(`/flashcardset/${flashcardSet.id}/view`)}>
                  Back
                </button>
              )}
            </div>
            <br />
            <div className="flashcards-page-info">
              {flashcardNumber+1} / {flashcardSet.flashcardsCount}
            </div>
          </>
        ) : (
          <p>No flashcards available.</p>
        )}
      </div>
    </>
  );
}