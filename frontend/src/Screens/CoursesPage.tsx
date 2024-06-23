import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo} from "../functions";
import "../types";

export default function CoursesPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [account, setAccount] = useState<Account>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newCourseSubjectId, setNewCourseSubjectId] = useState<string>("");
  const [newCourseTitle, setNewCourseTitle] = useState<string>("");
  const [newCourseDescription, setNewCourseDescription] = useState<string>("");
  const [newCourseFile, setNewCourseFile] = useState<File | null>(null);
  const [deleteSuccessful, setDeleteSuccessful] = useState<boolean>(false);
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [courseFilterSubjects, setCourseFilterSubjects] = useState<number[]>([]);

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

  const fetchCourses = async () => {
    fetch("http://127.0.0.1:8000/api/courses/accepted", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        setFilteredCourses(data);
        console.log(courses);
      });
  };

  const filterCourses = () => {
    console.log(courseFilterSubjects);
    setFilteredCourses(courses.filter((course) => {
      return course.title.toLowerCase().includes(courseFilter.toLowerCase()) && (!courseFilterSubjects.length || courseFilterSubjects.includes(course.subject.id.toString()));
    }))
  };

  const submitCoursesSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      filterCourses();
    }
  };

  const toggleCourseSubjects = (event: React.MouseEvent<HTMLDivElement>) => {
    const id = event.target.id;
    if (!courseFilterSubjects.includes(id)) {
      setCourseFilterSubjects([...courseFilterSubjects, id]);
      event.target.classList.add("clicked");
    }
    else {
      setCourseFilterSubjects(courseFilterSubjects.filter((subject) => {
        return subject != id;
      }));
      event.target.classList.remove("clicked");
    }

  };

  const createNewCourse = async (event: { preventDefault: () => void}) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", newCourseTitle);
    formData.append("subject_id", newCourseSubjectId);
    formData.append("description", newCourseDescription);
    if(newCourseFile)
    formData.append("image", newCourseFile);
    const r = await fetch("http://127.0.0.1:8000/api/course", {
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
            fetchCourses();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      setNewCourseFile(e.target.files[0]);
      console.log(newCourseFile);
    }
  }

  const deleteCourse = async (event: { preventDefault: () => void }, courseId: number) => {
    event.preventDefault();
    const r = await fetch(`http://127.0.0.1:8000/api/course/${courseId}`, {
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
            fetchCourses();
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
    fetchAccount();
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courseFilterSubjects, courseFilter])

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
    <div className="courses-page">
      <h2>Course catalog</h2>
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <a href="/courses/my">
          <button className="bg-black">My courses</button>
        </a>
        {
          account?.isAdmin &&
          <a href="/admin/courses">
            <button className="bg-black">Courses (admin)</button>
          </a>
        }
      </div>
      <br />
      <div className="search-courses">
        <input
          className="search-courses-input" 
          placeholder="Search courses" 
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          onKeyDown={(e) => submitCoursesSearch(e)}
        />
        <svg onClick={(e) => filterCourses()} xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20"><path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211M4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474"/></svg>
      </div>
      <br /><br />
      <div className="layer">
        <div className="course-subjects">
          Subjects:
          {subjects.map((subject) => (
            <div className="subject" id={subject.id.toString()} onClick={(event) => {toggleCourseSubjects(event)}}>
              {subject.name}
            </div>
          ))}
        </div>
        <div className="add-course">
        <a href="/course/new">
          <button className="add-course-button" style={{marginTop: "20px"}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <p>Add new course</p>
          </button>
        </a>
        </div>
      </div>
      <div className="courses">
        {filteredCourses.map((course) => (
          <a href={`/course/${course.id}/view`}>
            <div className="course">
              <img className="robocza-klasa-zdj-courses" src={API_URL + (course.image ? course.image : "/course_images/course_images/no_photo.jpg")} />
              <p className="ff-roboto">{course.title ? course.title : "Bez tytułu"}</p>
              <br />
              <div className="course-author">
                <img className="avatar-small" src={API_URL + (course.author.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : course.author.avatar)} />
                <p className="fs-12">{course.author.user.username ? course.author.user.username : "brak"}</p>
              </div>
              <div className="course-length-info">
                <div className="course-pages-quantity">
                  <p className="fs-12">{course.slidesCount} pages</p>
                </div>
                <div className="course-time">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.6 18.6L12 12V2.5"/><circle cx="12" cy="12" r="10"/></svg>
                  {/* @TODO Add time to course */}
                  <p className="fs-12">1-2h</p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
    </>
  );
}