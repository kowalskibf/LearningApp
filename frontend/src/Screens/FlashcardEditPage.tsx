import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";

type Params = {
    id: string;
}

export default function FlashcardEditPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [flashcard, setFlashcard] = useState<Flashcard>();
  const { id } = useParams<Params>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

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
    .then((d) => setAccount(d));
  };
  
  const fetchFlashcard = async () => {
    fetch(`http://127.0.0.1:8000/api/flashcard/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => {
      setFlashcard(d)
      setAnswer(d.answer)
      setQuestion(d.question)});
  };

  const editFlashcard = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/flashcard/${id}`, {
      method: "PUT",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        answer: answer,
        question: question,
      }),
    })
    .then(() => {
      fetchFlashcard();
    });
  };

  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchFlashcard();
  }, []);

  if (user === undefined || flashcards === undefined) {
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
        (account?.isAdmin || flashcard?.flashcardSet.author.user.id === user.id) ?
        <>
          <div className="w-100 ta-left">
            <a href={`/flashcardset/${flashcard?.flashcardSet.id}/edit`}>
              <button className="bg-black" type="button">
                Back
              </button>
            </a>
          </div>
          <h2>{flashcard?.flashcardSet.title}</h2> <br/>
          <div className="new-course-data">
            <div className="form-data">
              <label>
                Question:
                &nbsp;&nbsp;&nbsp;&nbsp;
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
              </label>
            </div>
            <div className="form-data">
              <label>
                Answer:
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
              </label>
            </div>
          </div>
          <br />
          <button
            className="bg-black"
            type="button"
            onClick={editFlashcard}
          >Save</button>
        </> :
        <>
          <h2>You are not permitted to enter this page</h2>
        </>
      }
        
    </>
  );
}