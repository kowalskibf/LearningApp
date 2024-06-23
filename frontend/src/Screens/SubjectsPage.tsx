import React, { useEffect, useState } from "react";
import "../App.css";
import "../types";

export default function SubjectsPage() {
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectName, setSubjectName] = useState<string>("");
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
    .then((d) => {setAccount(d); if(d.isAdmin == false){window.location.replace("/home");}});
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
        console.log(data);
      });
  };

  const createNewSubject = async (event: { preventDefault: () => void}) => {
    event.preventDefault();
    const r = await fetch("http://127.0.0.1:8000/api/subject", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            name: subjectName,
        }),
    })
    .then((r) => {
        if(r.ok)
        {
            setSubjectName("");
            fetchSubjects();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  const deleteSubject = async (event: { preventDefault: () => void }, subjectId: number) => {
    event.preventDefault();
    const r = await fetch(`http://127.0.0.1:8000/api/subject/${subjectId}`, {
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
            fetchSubjects();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  useEffect(() => {
    fetchUser();
    fetchAccount();
    fetchSubjects();
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
      {deleteSuccessful ? (
          <>
            <span className="l">Deleted successfully!</span>
            <br/>
          </>
        ) : ""}
        <h2>Subjects</h2>
        <br />
        <div style={{display: "flex", justifyContent: "center"}}>
          <table>
              <tr>
                  <th>Id</th>
                  <th>Subject</th>
                  <th>Edit</th>
                  <th>Delete</th>
              </tr>
              {subjects.map((subject) => (
                  <tr>
                      <td>{subject.id}</td>
                      <td>{subject.name}</td>
                      <td><a href={"/subject/" + subject.id + "/edit"}>Edit</a></td>
                      <td><button onClick={(e) => {deleteSubject(e, subject.id)}}>Delete</button></td>
                  </tr>
              ))}
          </table>
        </div>
        <h3>Create new subject:</h3>
        <input
            type="text"
            id="subject_name"
            name="subject_name"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
        />
        <button
            type="button"
            onClick={createNewSubject}
        >
          Add
        </button>
    </>
  );
}