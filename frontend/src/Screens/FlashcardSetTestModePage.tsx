import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";
import { shuffle } from "../functions";
import ProgressBar from "../Components/ProgressBar";

type Params = {
    id: string;
}

export default function FlashcardSetTestModePage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>();
  const { id } = useParams<Params>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const [flashcardNumber, setFlashcardNumber] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [answer, setAnswer] = useState<string>("");
  const [correct, setCorrect] = useState<boolean>(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [yourAnswers, setYourAnswers] = useState<string[]>([]);

  const [listOfCorrectAnswers, setListOfCorrectAnswers] = useState<Flashcard[]>([]);
  const [listOfWrongAnswers, setListOfWrongAnswers] = useState<Flashcard[]>([]);

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
    .then((d) => {
      setFlashcards(d);
      setAnswers(Array(d.length).fill(0));
    });
  };


const handleAnswer = () => {
    setFlipped(true);
    setYourAnswers((p) => [
      ...p,
      answer
    ]);

    if(answer == flashcards[flashcardNumber].answer)
    {
        setCorrectAnswers(correctAnswers+1);
        setCorrect(true);
        setListOfCorrectAnswers((p) => [
            ...p,
            flashcards[flashcardNumber]
        ]);
        setAnswers((p) => p.map((ans, idx) => (idx === flashcardNumber ? 1 : ans)));
    }
    else
    {
        setCorrect(false);
        setListOfWrongAnswers((p) => [
            ...p,
            flashcards[flashcardNumber]
        ]);
        setAnswers((p) => p.map((ans, idx) => (idx === flashcardNumber ? -1 : ans)));
    }
};

const handleNext = () => {
    setCorrect(false);
    setFlipped(false);
    setAnswer("");
    setFlashcardNumber(flashcardNumber+1);
};

const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if(e.key === 'Enter')
  {
    if(flipped)
    {
      handleNext();
    }
    else
    {
      handleAnswer();
    }
  }
};

const handleTryAgain = () => {
  window.location.reload();
}


  useEffect(() => {
    fetchUser();
    fetchFlashcardSet();
    fetchFlashcards();
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
      {/* <a href={`/flashcardset/${flashcardSet.id}/view`}>Back</a>
      <br />
      <br />
      {flashcards.length > 0 && flashcardNumber < flashcards.length ? (
        <>
            {answers.map((a, index) => (
                <div key={index} className={"roboczy-test-kolko " + (
                  a == 1 ? "roboczy-test-kolko-zielone" : (
                    a == -1 ? "roboczy-test-kolko-czerwone" : (
                      index == flashcardNumber ? "roboczy-test-kolko-niebieskie" : "roboczy-test-kolko-szare"
                    )
                  )
                )}
                >
                </div>
            ))}
            <br/><br/>
            {flipped ? "Correct answer is: "+flashcards[flashcardNumber].answer : "Question: "+flashcards[flashcardNumber].question}
            <br />
            Your answer:<br/>
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={handleEnter} />
            <br/>
            {flipped ? (
              correct ? "Correct!" : "Wrong!"
            ) : ""}
            <br/>
            {flipped ? (
                flashcardNumber < flashcards.length - 1 ? 
                <button type="button" onClick={handleNext}>Next</button> : <button type="button" onClick={handleNext}>Results</button>
            ) : (
                <button type="button" onClick={handleAnswer}>Check</button>
            )}


        </>
      ) : (
        <>
          <p>Results</p>
          Your score: {correctAnswers} / {flashcards.length} ({Math.round(correctAnswers/flashcards.length *100)}%)
          <br/>
          {answers.map((a,idx) => (
            <div key={idx}>
              <br/>
              Question: {flashcards[idx].question} Correct answer: {flashcards[idx].answer}
              <br/>
              <span className={a == 1 ? "c-green" : "c-red"}> 
              Your answer: {yourAnswers[idx]} </span>
              <br/>
            </div>
          ))}
        </>
      )} */}
      {
        flashcards.length > 0 && flashcardNumber < flashcards.length ?
        <>
          <div className="w-100 ta-left">
            <a href="/flashcards">
              <button className="bg-black">
                Back
              </button>
            </a>
          </div>
          <div className="flashcards-test-mode-page">
            <h2>{flashcardSet.title}</h2>
            <br />
            <div className={"flashcard-question-content " + (flipped ? (correct ? "flashcard-correct-answer" : "flashcard-wrong-answer") : "")}>
              {flipped ? (correct ? "Correct!" : <> Wrong! Correct answer is: <i>{flashcards[flashcardNumber].answer}</i></>) : flashcards[flashcardNumber].question}
            </div>
          </div>
          <br />
          {flipped ? (
              flashcardNumber < flashcards.length - 1 ? 
              <button type="button" className="bg-black" onClick={handleNext}>Next</button> : <button type="button" className="bg-black" onClick={handleNext}>Results</button>
          ) : (
            <div className="flashcard-test-answer">
              <label>
                <b>Your answer:</b>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={handleEnter} />
              </label>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={handleAnswer} className="bg-black">Confirm</button>
            </div> 
          )}
          <br /><br />
          <div className="answer-circles">
            {answers.map((a, index) => (
              <div key={index} className={"roboczy-test-kolko " + (
                a == 1 ? "roboczy-test-kolko-zielone" : (
                  a == -1 ? "roboczy-test-kolko-czerwone" : (
                    index == flashcardNumber ? "roboczy-test-kolko-niebieskie" : "roboczy-test-kolko-szare"
                  )
                )
              )}
              >
              </div>
            ))}
          </div>
        </> :
        <>
          <h2>Results</h2>
          <h4>Your score: {correctAnswers} / {flashcards.length} ({Math.round(correctAnswers/flashcards.length *100)}%)</h4>
          <br />
          <ProgressBar width={400} progress={correctAnswers/flashcards.length *400} displayPercentage={true} />
          <br/>
          <div className="back-next-buttons">
            <a href="/flashcards"><button className="bg-black">Back to flashcards</button></a>
            <a><button onClick={handleTryAgain} className="bg-black">Try again</button></a>
          </div>
          <br />
          <h2>Summary</h2>
          <br />
          <div className="summary">
            <div className="summary-flashcards">
              {answers.map((a,idx) => (
                <div className="summary-flashcard" key={idx}>
                  <div className="flashcard-question-content">{flashcards[idx].question}</div>
                  &nbsp;&nbsp;&nbsp;
                  <div className={"summary-flashcard-answer " + (a == 1 ? "flashcard-correct-answer" : "flashcard-wrong-answer")}>{yourAnswers[idx]}</div>
                  &nbsp;&nbsp;&nbsp;
                  {
                    a != 1 && 
                    <div className="summary-flashcard-answer flashcard-correct-answer">{flashcards[idx].answer}</div> 
                  }
                  <br/>
                </div>
              ))}
            </div>
          </div>
        </>
      }
    </>
  );
}