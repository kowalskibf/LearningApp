import React, { useEffect, useState } from "react";
import "../App.css";
import { useParams } from "react-router-dom";
import "../types";

type Params = {
    id: string;
}

export default function FlashcardSetEditPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>();
  const { id } = useParams<Params>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newSubjectId, setNewSubjectId] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [editSuccessful, setEditSuccessful] = useState<boolean>(false);

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
      .then((data) => {
        setFlashcardSet(data);
        setNewTitle(data.title);
        setNewDescription(data.description);
        setNewSubjectId(data.subject.id);
      });
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
        setNewSubjectId(data[0].id);
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

  const editFlashcardSet = async () => {
      const r = await fetch(`http://127.0.0.1:8000/api/flashcardset/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          subjectId: newSubjectId,
        }),
      })
      .then(() => {
        fetchFlashcardSet();
        setEditSuccessful(true);
      });
  };

  const deleteFlashcard = async (flashcardId: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/flashcard/${flashcardId}`, {
      method: "DELETE",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then(() => fetchFlashcards());
  };

  const createNewFlashcard = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/flashcard`, {
      method: "POST",
      headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        set_id: id,
      }),
    })
    .then((r) => r.json())
    .then((d) => window.location.replace(`/flashcard/${d.flashcardId}/edit`))
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      if (e.target.files[0].name.toLowerCase().endsWith('.csv')) {
        setNewFile(e.target.files[0]);
        importCSV(e.target.files[0]);
      }
      else {
        alert("File must be .csv type");
      }
    }
  }

  const importCSV = async (file: File | null) => {
    const formData = new FormData();
    if(file)
    formData.append("file", file);
    const r = await fetch(`http://127.0.0.1:8000/api/flashcardset/${id}/import`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: formData,
    })
    .then((r) => {
        if(r.ok)
        {
            console.log("ok");
            fetchFlashcards();
            fetchFlashcardSet();
        }
        else
        {
            alert("Error reading a file");
        }
    });
  };
  

  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchFlashcardSet();
    fetchFlashcards();
    fetchSubjects();
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
    {
      (account?.isAdmin || flashcardSet.author.user.id === user.id) ?
      <>
        <div className="w-100 ta-left">
          <a href="/flashcards">
            <button className="bg-black">
              Back
            </button>
          </a>  
        </div>
          <h3>Edit flashcard set</h3>
          <br />
          <div className="new-course-data">
            <div className="form-data">
              <label>
                Title:
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </label>
            </div>
            <div className="form-data">
              Description:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <textarea
                id="subject_name"
                name="subject_name"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                />
            </div>
          </div>
          <br />
          <br/>
          <br />
          <h3>Flashcards</h3>
          <div className="slides-list-edit">
            <div className="w-100 ta-left">
              <button
                className="bg-black"
                type="button"
                onClick={createNewFlashcard}
              >
                Create New Flashcard
              </button>
              <br /><br />
              <label className="input-type-file-gray">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
                Import from .csv
                <input
                    type="file"
                    accept="text/csv"
                    onChange={handleFileChange}
                />
              </label>
            </div>
            {
              !flashcards.length &&
              <i>The set has no flashcards yet</i>
            }
            {flashcards.map((fc) => (
              <div className="slide-edit" key={fc.id}>
                <svg onClick={(e) => deleteFlashcard(fc.id)} xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                <a href={`/flashcard/${fc.id}/edit`}>
                  <button>
                    {fc.question}
                  </button>
                </a>
              </div>
            ))}
          </div>
          <br /><br />
          <button className="bg-black">Save</button>
      </> :
      <>
        <h2>You are not permitted to enter this page</h2>
      </>
    }
    </>
  );
}