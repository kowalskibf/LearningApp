// import React from "react";
import React, { useEffect, useState } from "react";
import { Axis, BarSeries, LineSeries, Plot } from 'react-plot';
import "../App.css";
import ProgressBar from "../Components/ProgressBar";
import { timeAgo } from "../functions";
import {daysInMonth, formatDateWithoutTime, sendUserBackToLoginPageIfNotLoggedIn, trackActivity, getWindowDimensions} from "../functions";
import "../types";

type SubjectStats = {
  id: number;
  name: string;
  stats: Array<SubjectsToAccounts>;
}

export default function HomePage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [friendsStats, setFriendsStats] = useState<SubjectStats[]>([]);
  const [filteredFriendsStats, setFilteredFriendsStats] = useState<SubjectsToAccounts[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [dateFilterSelect, setDateFilterSelect] = useState<string>("month");
  const [dateFilterMonth, setDateFilterMonth] = useState<number>(new Date().getMonth());
  const [dateFilterYear, setDateFilterYear] = useState<number>(new Date().getFullYear());
  const [dateFilterWeek, setDateFilterWeek] = useState<string>("");
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const [plotData, setPlotData] = useState<{x: number, y: number}[]>([]);
  const [chosenSubjectForRanking, setChosenSubjectForRanking] = useState<string>("");
  const [recentCourses, setRecentCourses] = useState<AccountsToCourses[]>([]);
  const [account, setAccount] = useState<Account>();
  const [weekSelectOptions, setWeekSelectOptions] = useState<{name: string, value: string[]}[]>([]);
  const MAX_RECENT_COURSES_SHOWING = 4;
  const MAX_RECORDS_IN_RANKING = 3;

  const monthSelectOptions: {name: string, value: string}[] = [
    {name: "June 2024", value: "2024-5"},
    {name: "May 2024", value: "2024-4"},
    {name: "April 2024", value: "2024-3"},
    {name: "March 2024", value: "2024-2"},
    {name: "February 2024", value: "2024-1"},
    {name: "January 2024", value: "2024-0"},
    {name: "December 2023", value: "2023-11"},
    {name: "November 2023", value: "2023-10"},
    {name: "October 2023", value: "2023-9"},
    {name: "September 2023", value: "2023-8"},
    {name: "August 2023", value: "2023-7"},
    {name: "July 2024", value: "2023-6"},
    {name: "June 2023", value: "2023-5"},
  ];
  
  const fetchUser = async () => {
    fetch("http://127.0.0.1:8000/api/auth/users/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setUser(d));
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

  const fetchRecentCourses = async () => {
    fetch("http://127.0.0.1:8000/api/accountstocourses/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setRecentCourses(d));
  };

  const fetchUserActivities = async () => {
    fetch("http://127.0.0.1:8000/api/activity/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUserActivities(data);
        handlePlotData(data);
      }).then(() => console.log(userActivities));
  };

  const fetchFriendsStats = async () => {
    fetch("http://127.0.0.1:8000/api/friends/my/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFriendsStats(data);
        setChosenSubjectForRanking(data[0].name);
      }).then(() => console.log(friendsStats));
  };

  const getNewPlotSize = () => {
    let newPlotWidth, newPlotHeight;
    if (windowDimensions.width > 800) {
      newPlotWidth = 600;
    }
    else if (windowDimensions.width > 600) {
      newPlotWidth = 400;
    }
    else {
      newPlotWidth = 300;
    }
    newPlotHeight = newPlotWidth / 1.6;
    return {width: newPlotWidth, height: newPlotHeight};
  };

  const handleDateFilterSelect = (name: string) => {
    if (dateFilterSelect === "month") {
      setDateFilterYear(parseInt(name.split('-')[0]));
      setDateFilterMonth(parseInt(name.split('-')[1]));
    }
    else {
      setDateFilterWeek(name);
    }
  };

  const handlePlotData = (data: UserActivity[]) => {
    let newPlotData: {x: number, y:number}[] = [];
    if (dateFilterSelect === "month") {
      for (let i=1; i<=daysInMonth(dateFilterMonth, dateFilterYear); i++ ) {
        let y: UserActivity|undefined = data.find((obj) => 
          new Date(obj.activityDate).getMonth() === dateFilterMonth && 
          new Date(obj.activityDate).getFullYear() === dateFilterYear &&
          new Date(obj.activityDate).getDate() === i
        );
        newPlotData = [...newPlotData, {x: i, y: y ? y.secondsActive / 3600 : 0}];
      }
    }
    else {
      console.log(dateFilterWeek);
      const days = dateFilterWeek.split(",");
      for (let i=0; i<7; i++) {
        let y: UserActivity|undefined = data.find((obj) => 
          new Date(obj.activityDate).toDateString() === days[i]
        );
        newPlotData = [...newPlotData, {x: 7-i, y: y ? y.secondsActive / 3600 : 0}];
      } 
    }
    setPlotData(newPlotData);
  };

  const getWeekSelectOptions = () => {
    let newWeekSelectOptions = [];
    let dateBuffer = new Date();
    let newDateBuffer = new Date();
    for (let i=0; i<53; i++) {
      let newWeekOptionValue = [];
      for (let j=1; j<=7; j++) {
        newWeekOptionValue.push(newDateBuffer.toDateString());
        newDateBuffer = new Date(dateBuffer.getTime() - j * 24 * 60 * 60 * 1000);
      }
      newWeekSelectOptions.push({name: `${newDateBuffer.getDate()} ${newDateBuffer.toLocaleString('en-US', { month: 'short' })} ${newDateBuffer.getFullYear()} - ${dateBuffer.getDate()} ${dateBuffer.toLocaleString('en-US', { month: 'short' })} ${dateBuffer.getFullYear()}`, value: newWeekOptionValue});
      dateBuffer = newDateBuffer;
    }
    setWeekSelectOptions(newWeekSelectOptions);
    console.log(newWeekSelectOptions);
  }

  const [plotSize, setPlotSize] = useState<{width: number, height: number}>(getNewPlotSize());
  
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRankingVisibility = async () => {
    const r = await fetch(`http://127.0.0.1:8000/api/account/rankingshown/toggle`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${localStorage.getItem("token")}`,
    },
    })
    .then(() => fetchAccount());
  };

  useEffect(() => {
    sendUserBackToLoginPageIfNotLoggedIn();
    fetchUser();
    fetchAccount();
    fetchRecentCourses();
    fetchFriendsStats();
    fetchUserActivities();
    getNewPlotSize();
    getWeekSelectOptions();
  }, []);

  useEffect(() => {
    setPlotSize(getNewPlotSize());
  }, [windowDimensions]);

  useEffect(() => {
    handlePlotData(userActivities);
  }, [dateFilterMonth, dateFilterYear, dateFilterWeek]);

  useEffect(() => {
    if (dateFilterSelect === "month") {
      handleDateFilterSelect(monthSelectOptions[0].value);
    }
    else {
      handleDateFilterSelect(weekSelectOptions[0].value.join(","));
    }
    handlePlotData(userActivities);
  }, [dateFilterSelect]);

  useEffect(() => {
    const arr = friendsStats.find((fs) => fs.name === chosenSubjectForRanking) ? friendsStats.find((fs) => fs.name === chosenSubjectForRanking).stats.sort((a, b) => b.level - a.level) : [];
    setFilteredFriendsStats(arr);
  }, [chosenSubjectForRanking, friendsStats]);

  if (user === undefined || account === undefined) {
    return (
      <div>
        <div className="skeleton"></div>
      </div>
    );
  }

  return (
    <>
      <h1>Hello {user.username}</h1>
      <div className="home-page-top-layer">
        <div className="logging-statistics">
          <div style={{display: "flex", alignItems: "center", flexWrap: "wrap"}}>
            <h3>Study statistics</h3>
            <select onChange={(e) => {handleDateFilterSelect(e.target.value)}}>
              {dateFilterSelect === "month" ?
                monthSelectOptions.map((opt) => (
                  <option value={opt.value}>{opt.name}</option>
                )) :
                weekSelectOptions.map((opt) => (
                  <option value={opt.value}>{opt.name}</option>
                ))
              }
            </select>
            <div className="statistics-range-choice">
              <button className={dateFilterSelect === "month" ? "clicked" : ""} onClick={(e) => setDateFilterSelect("month")}>month</button>
              <button className={dateFilterSelect === "week" ? "clicked" : ""} onClick={(e) => setDateFilterSelect("week")}>week</button>
            </div>
          </div>
          <Plot width={plotSize.width} height={plotSize.height}>
            {
              dateFilterSelect === "month" ?
              <LineSeries
                data={plotData}
                xAxis="x"
                yAxis="y"
              /> :
              <BarSeries
                data={plotData}
                xAxis="x"
                yAxis="y"
              />
            }
            {
              dateFilterSelect === "month" ?
                <Axis
                  id="x"
                  position="bottom"
                  label="Day of month"
                  displayPrimaryGridLines
                />
               :
                <Axis
                  id="x"
                  min={0}
                  max={8}
                  position="bottom"
                  label="Day of week"
                  tickLabelStyle={{fontSize: "12px"}}
                  tickLabelFormat={(x: number) => dateFilterWeek.split(",")[7-x] ? (dateFilterWeek.split(",")[7-x]?.split(" ")[2] + " " + dateFilterWeek.split(",")[7-x]?.split(" ")[1]) : ""}
                  displayPrimaryGridLines
                />
              

            }
            
            <Axis
              id="y"
              min={0}
              position="left"
              label="Hours learning"
              displayPrimaryGridLines
            />
          </Plot>
        </div>
        <div style={{minWidth: 300, marginTop: -50}}>
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <h3>Ranking</h3>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {
              account.rankingShown ?
                <svg onClick={toggleRankingVisibility} width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="eyeCrossedIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="eyeCrossedIconTitle">Hidden (crossed eye)</title> <path d="M22 12C22 12 19 18 12 18C5 18 2 12 2 12C2 12 5 6 12 6C19 6 22 12 22 12Z"></path> <circle cx="12" cy="12" r="3"></circle> <path d="M3 21L20 4"></path> </g></svg>
              :
                <svg onClick={toggleRankingVisibility} width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-labelledby="eyeCrossedIconTitle" stroke="#000000" stroke-width="1" stroke-linecap="square" stroke-linejoin="miter" fill="none" color="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title id="eyeCrossedIconTitle">Hidden (crossed eye)</title> <path d="M22 12C22 12 19 18 12 18C5 18 2 12 2 12C2 12 5 6 12 6C19 6 22 12 22 12Z"></path> <circle cx="12" cy="12" r="3"></circle> </g></svg>
            }
            
          </div>
          {/* <h3>Ranking</h3> */}
          {account.rankingShown &&
            <div className="ranking">
              <label>
                Select subject:&nbsp;
                <select value={chosenSubjectForRanking} onChange={(e) => setChosenSubjectForRanking(e.target.value)}>
                  {friendsStats.map((fs, i) => (
                    <option>{fs.name}</option>
                  ))}
                </select>
              </label>
              <br /><br />
              <div className="ranking-table">
                <table>
                  <tr>
                    <th>Rank</th>
                    <th>User</th>
                    <th>Username</th>
                    <th>Level</th>
                  </tr>

                  {
                    (filteredFriendsStats.length > MAX_RECORDS_IN_RANKING + 2) ? 
                    (filteredFriendsStats.map((f, i) => (
                      (i < MAX_RECORDS_IN_RANKING - 1) ?
                      <tr style={f.account.user.username == user.username ? {fontWeight: "bold"} : {}}>
                        <td>{i+1}</td>
                        <td>
                          <img className="avatar-small-no-margin" src={API_URL + (f.account.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.account.avatar)} />
                        </td>
                        <td>{f.account.user.username}</td>
                        <td>{f.level}</td>
                      </tr> :
                      ((f.account.user.id === user.id) ?
                      <>
                      <tr>
                        <td>...</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr style={{fontWeight: "bold"}}>
                        <td>{i+1}</td>
                        <td>
                          <img className="avatar-small-no-margin" src={API_URL + (f.account.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.account.avatar)} />
                        </td>
                        <td>{f.account.user.username}</td>
                        <td>{f.level}</td>
                      </tr>
                      </> :
                      <></>)
                    ))) :
                    filteredFriendsStats.map((f, i) => (
                      <tr style={f.account.user.username == user.username ? {fontWeight: "bold"} : {}}>
                        <td>{i+1}</td>
                        <td>
                          <img className="avatar-small-no-margin" src={API_URL + (f.account.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : f.account.avatar)} />
                        </td>
                        <td>{f.account.user.username}</td>
                        <td>{f.level}</td>
                      </tr>
                    ))
                  }
                </table>
              </div>
            </div> 
          }
        </div>
      </div>
      <br />
      <div className="widget-recent-courses">
        <h2>Recent viewed course</h2>
        <div className="w-100 ta-right">
          <a href="/courses/recent">
            <button className="bg-black">
              View more
            </button>
          </a>
        </div>
        <div className="recent-courses">
          {!recentCourses.length &&
            <i>You have no recent courses</i>
          }
          {recentCourses.map((atc, i) => (
            <div key={i}>
              {i < MAX_RECENT_COURSES_SHOWING ? (
                <a href={`/course/${atc.course.id}/view`}>
                  <div className="course">
                    <img className="robocza-klasa-zdj-courses" src={API_URL + (atc.course.image ? atc.course.image : "/course_images/course_images/no_photo.jpg")} /><br/>
                    <b>{atc.course.title}</b>
                    <br /><br />
                    <ProgressBar width={200} height={20} progress={atc.progress / atc.course.slidesCount * 200} displayPercentage={false} />
                    <p style={{fontSize: "12px"}}>{atc.progress} / {atc.course.slidesCount} slides completed</p>
                    <div className="w-100 ta-right">
                      <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25px" height="25px" viewBox="0 0 442.04 442.04" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M221.02,341.304c-49.708,0-103.206-19.44-154.71-56.22C27.808,257.59,4.044,230.351,3.051,229.203 c-4.068-4.697-4.068-11.669,0-16.367c0.993-1.146,24.756-28.387,63.259-55.881c51.505-36.777,105.003-56.219,154.71-56.219 c49.708,0,103.207,19.441,154.71,56.219c38.502,27.494,62.266,54.734,63.259,55.881c4.068,4.697,4.068,11.669,0,16.367 c-0.993,1.146-24.756,28.387-63.259,55.881C324.227,321.863,270.729,341.304,221.02,341.304z M29.638,221.021 c9.61,9.799,27.747,27.03,51.694,44.071c32.83,23.361,83.714,51.212,139.688,51.212s106.859-27.851,139.688-51.212 c23.944-17.038,42.082-34.271,51.694-44.071c-9.609-9.799-27.747-27.03-51.694-44.071 c-32.829-23.362-83.714-51.212-139.688-51.212s-106.858,27.85-139.688,51.212C57.388,193.988,39.25,211.219,29.638,221.021z"></path> </g> <g> <path d="M221.02,298.521c-42.734,0-77.5-34.767-77.5-77.5c0-42.733,34.766-77.5,77.5-77.5c18.794,0,36.924,6.814,51.048,19.188 c5.193,4.549,5.715,12.446,1.166,17.639c-4.549,5.193-12.447,5.714-17.639,1.166c-9.564-8.379-21.844-12.993-34.576-12.993 c-28.949,0-52.5,23.552-52.5,52.5s23.551,52.5,52.5,52.5c28.95,0,52.5-23.552,52.5-52.5c0-6.903,5.597-12.5,12.5-12.5 s12.5,5.597,12.5,12.5C298.521,263.754,263.754,298.521,221.02,298.521z"></path> </g> <g> <path d="M221.02,246.021c-13.785,0-25-11.215-25-25s11.215-25,25-25c13.786,0,25,11.215,25,25S234.806,246.021,221.02,246.021z"></path> </g> </g> </g></svg>
                        <p style={{fontSize: "14px"}}>{timeAgo(new Date(atc.lastTimeViewed))}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ) : ""}
            </div>
          ))}
        </div>
      </div>
      <br /><br />
      {/* <div style={{width: "100%", display: "flex", flexDirection: "column"}}>
        Witaj, {user.username}!<br/>
        <a href="/profile">Profil</a><br/>
        <a href="/users">Users</a><br/>
        <a href="/friends">Friends</a><br/>
        {account.isAdmin == true ? (
          <>
          <a href="/subjects">Admin - subjects</a><br/>
          <a href="/admin/courses">Admin - accept courses</a><br/>
          </>) : (<></>)}
        <a href="/courses">Courses</a><br/>
        <a href="/courses/my">My courses</a><br/>
        <a href="/threads">Threads</a><br/>
        <a href="/flashcards">Flashcards</a><br/>
        <a href="/flashcards/my">My flashcards</a><br/>
        <a href="/notifications">Notifications</a><br/>
        <a href="/courses/recent">Recent courses</a><br/>
        <a href="/profile/change-password">Change Password</a><br/>
        <a href="/logout">Wyloguj się</a>
      </div> */}
    </>
  );
};