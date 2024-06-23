import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";


export default function ThreadsPage() {
    const API_URL = "http://127.0.0.1:8000";
    const [user, setUser] = useState<User>();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [threadFilter, setThreadFilter] = useState<string>("");
    const [threadFilterSubjects, setThreadFilterSubjects] = useState<string[]>([]);
    const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);

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
          console.log(subjects);
        });
    };

    const fetchThreads = async () => {
      fetch("http://127.0.0.1:8000/api/threads/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      })
      .then((r) => r.json())
      .then((d) => {setThreads(d); setFilteredThreads(d)});
    };

    const toggleThreadSubjects = (event: React.MouseEvent<HTMLDivElement>) => {
      const id = event.target.id;
      if (!threadFilterSubjects.includes(id)) {
        setThreadFilterSubjects([...threadFilterSubjects, id]);
        event.target.classList.add("clicked");
      }
      else {
        setThreadFilterSubjects(threadFilterSubjects.filter((subject) => {
          return subject != id;
        }));
        event.target.classList.remove("clicked");
      }
  
    };
    

    

    const filterThreads = () => {
      setFilteredThreads(threads.filter((thread) => {
        return thread.title.toLowerCase().includes(threadFilter.toLowerCase()) && (
          !threadFilterSubjects.length || threadFilterSubjects.includes(thread.subject.id.toString())
        );
      }))
    };
  
    const submitThreadsSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        filterThreads();
      }
    };
  
  
    useEffect(() => {
      fetchUser();
      fetchSubjects();
      fetchThreads();
    }, []);

    useEffect(() => {
      filterThreads();
    }, [threadFilterSubjects, threadFilter]);
  
    if (user === undefined || threads === undefined) {
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
        <div className="threads-page">
          <h2>Threads</h2>
          <br />
          <div className="search-courses">
            <input
              className="search-courses-input" 
              placeholder="Search threads" 
              value={threadFilter}
              onChange={(e) => setThreadFilter(e.target.value)}
              onKeyDown={(e) => submitThreadsSearch(e)}
            />
            <svg onClick={(e) => filterThreads()} xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20"><path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211M4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474"/></svg>
          </div>
          <br /><br />
          <div className="layer">
            <div className="course-subjects">
              Subjects:
              {subjects.map((subject) => (
                <div className="subject" id={subject.id.toString()} onClick={(event) => {toggleThreadSubjects(event)}}>
                  {subject.name}
                </div>
              ))}
            </div>
            <div className="add-course">
              <a href="/thread/new">
                <button className="add-course-button" style={{marginTop: "20px"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <p>Create new thread</p>
                </button>
              </a>
            </div>
          </div>
          <br />
          <div className="threads">
            {filteredThreads.map((thread) => (
              <a href={`/thread/${thread.id}`}>
                <div className="thread">
                  <div className="thread-avatar">
                    <img className="avatar-medium" src={API_URL + (thread.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : thread.author.avatar)} />
                    <i>{thread.author.user.username}</i>
                  </div>
                  <div className="thread-text">
                    <b>{thread.title}</b>
                    <br />
                    {
                      thread.lastCommentDate ?
                      <div>
                        <i>Last comment {timeAgo(new Date(thread.lastCommentDate))}</i>
                        &nbsp;&nbsp;&nbsp;
                        <i>{thread.commentsCount} {thread.commentsCount != 1 ? "comments" : "comment"}</i>
                      </div> :
                      <i>No comments yet</i>
                    }
                  </div>
                  {
                    thread.likesCount - thread.dislikesCount >= 0 ?
                    <div className="thread-likes">
                      {/* <svg fill="#00cc00" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" stroke="#00cc00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> */}
                      <svg fill="#00cc00" height="25px" width="25px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,304.021c0-12.821-5.099-24.768-13.867-33.6c9.963-10.901,15.019-25.536,13.632-40.725 c-2.475-27.115-26.923-48.363-55.616-48.363H324.395c6.485-19.819,16.939-56.149,16.939-85.333c0-46.272-39.317-85.333-64-85.333 c-22.165,0-38.016,12.459-38.677,12.992c-2.539,2.048-3.989,5.099-3.989,8.341v72.32l-61.44,133.141l-2.56,1.28v-4.075 c0-5.888-4.779-10.667-10.667-10.667H53.333C23.936,224,0,247.936,0,277.333V448c0,29.397,23.936,53.333,53.333,53.333h64 c23.083,0,42.773-14.72,50.219-35.243c17.749,9.131,41.643,13.931,56.469,13.931H419.84c23.232,0,43.541-15.68,48.32-37.269 c2.453-11.115,1.024-22.315-3.84-32.043c15.744-7.936,26.347-24.171,26.347-42.688c0-7.552-1.728-14.784-5.013-21.333 C501.397,338.752,512,322.517,512,304.021z M149.333,448c0,17.643-14.379,32-32,32h-64c-17.664,0-32-14.357-32-32V277.333 c0-17.643,14.357-32,32-32v0.107h95.957v10.667c0,0.064,0.043,0.107,0.043,0.171V448z M466.987,330.368 c-4.117,0.469-7.595,3.264-8.896,7.211c-1.301,3.925-0.235,8.277,2.795,11.115c5.44,5.141,8.427,12.011,8.427,19.349 c0,13.44-10.155,24.768-23.637,26.304c-4.117,0.469-7.595,3.264-8.896,7.211c-1.301,3.925-0.235,8.277,2.795,11.115 c7.04,6.635,9.856,15.936,7.744,25.472c-2.624,11.883-14.187,20.523-27.499,20.523H224c-15.851,0-41.365-6.848-53.333-15.744 V262.656l15.381-7.68c2.155-1.088,3.883-2.88,4.907-5.077l64-138.667c0.64-1.387,0.981-2.923,0.981-4.459V37.909 c4.437-2.453,12.139-5.803,21.333-5.803c11.691,0,42.667,29.077,42.667,64c0,37.525-20.416,91.669-20.629,92.203 c-1.237,3.264-0.811,6.955,1.195,9.835c2.005,2.88,5.269,4.608,8.789,4.608h146.795c17.792,0,32.896,12.715,34.389,28.971 c1.131,12.16-4.672,23.723-15.168,30.187c-3.285,2.005-5.205,5.653-5.056,9.493c0.128,3.84,2.347,7.296,5.781,9.067 c9.003,4.608,14.592,13.653,14.592,23.595C490.603,317.504,480.448,328.832,466.987,330.368z"></path> </g> </g> </g></svg>
                      &nbsp;
                      <p className="c-green">{thread.likesCount - thread.dislikesCount}</p>
                    </div> :
                    <div className="thread-likes">
                      <svg fill="#cc0000" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 486.805 486.805" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M485.9,241.402l-26.8-167c-5.2-41.9-34.5-66-80.4-66H243.6h-6.8h-65.9c-19.2,0-36.9,8.3-49.4,21.6 c-4.5-5.5-11.4-8.9-19-8.9H24.7c-13.6,0-24.7,11.1-24.7,24.7v228.4c0,13.6,11.1,24.7,24.7,24.7h77.9c9,0,17-4.9,21.3-12.2l2.9,0.7 c4.4,1.3,80.8,25,80.8,90.7v84.9c0,5.2,3.4,9.9,8.4,11.4c0.9,0.3,12.9,4,28.3,4c13.3,0,29.1-2.7,42.5-12.6 c18.4-13.5,27.7-36.5,27.7-68.4v-75.8h32.4h56.9h15.8c15.6,0,31-5.8,43.3-16.2C480.9,290.002,489.8,265.402,485.9,241.402z M103.2,274.302c0,0.4-0.3,0.7-0.7,0.7H24.7c-0.4,0-0.7-0.3-0.7-0.7v-228.4c0-0.4,0.3-0.7,0.7-0.7h77.9c0.4,0,0.7,0.3,0.7,0.7 v228.4H103.2z M447.3,287.202c-7.9,6.8-17.8,10.5-27.7,10.5h-15.8h-56.9h-44.5c-6.6,0-12,5.4-12,12v87.8c0,23.8-6,40.3-17.8,49 c-13,9.6-30.8,8.6-41.1,7v-75.3c0-35.6-17.3-66.7-49.9-89.9c-23.9-16.9-47.6-23.7-48.6-24c-0.2,0-0.3-0.1-0.5-0.1l-5.2-1.2v-191.5 c0.2-0.7,0.4-1.4,0.5-2.1c3.3-21,21.8-36.9,43.1-36.9h65.9h6.8h135.1c33.9,0,52.9,15.2,56.6,45.1c0,0.2,0,0.3,0.1,0.4l26.9,167.1 C464.8,261.002,459,277.102,447.3,287.202z"></path> </g> </g></svg>
                      &nbsp;
                      <p className="c-red">{thread.dislikesCount - thread.likesCount}</p>
                    </div>
                  }
                </div>
              </a>
            ))}
          </div>
        </div>
      </>
    );
  }