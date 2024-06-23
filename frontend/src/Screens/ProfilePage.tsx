import React, { useEffect, useState } from "react";
import "../App.css";
import "../types";
import { getWindowDimensions } from "../functions";
import ProgressBar from "../Components/ProgressBar";

export default function ProfilePage() {
  const API_URL = "http://127.0.0.1:8000";
  const [account, setAccount] = useState<Account>();
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [subjectsToAccounts, setSubjectsToAccounts] = useState<SubjectsToAccountsWithNextLevelThreshold[]>([]);
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());
  const [levelBarWidth, setLevelBarWidth] = useState<number>(600);

  const backgroundColors: string[] = [
    "#7bcef1",
    "#dc5bfa",
    "#49afad",
    "#eac553"
  ];

  const fetchSubjectsToAccounts = async () => {
    fetch("http://127.0.0.1:8000/api/profile/subjectstoaccounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((r) => r.json())
    .then((d) => {
      setSubjectsToAccounts(d);
      console.log(d);
    })
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
    .then((d) => {
      setAccount(d);
      console.log(d);
    })
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files.length > 0)
    {
      setNewAvatar(e.target.files[0]);
      changeAvatar(e.target.files[0]);
    }
  }

  const changeAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const r = await fetch("http://127.0.0.1:8000/api/account", {
        method: "PUT",
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
            fetchAccount();
        }
        else
        {
            console.log("nie dziala");
        }
    });
  };

  useEffect(() => {
    fetchAccount();
    fetchSubjectsToAccounts();
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowDimensions.width > 750) {
      setLevelBarWidth(600);
    }
    else if (windowDimensions.width > 600) {
      setLevelBarWidth(450);
    }
    else if (windowDimensions.width > 500) {
      setLevelBarWidth(250);
    }
  }, [windowDimensions])

  if (account === undefined) {
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
    <div className="profile-page">
      <h2>Profile</h2>
      <div className="w-100 ta-left">
        <a href="/home">
          <button className="bg-black">Back</button>
        </a>
      </div>
      <br />
      <div className="profile-page-top-layer">
        <div className="avatar-edit">
          <img className="avatar-very-large" src={API_URL + (account.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : account.avatar)} />
          <label>
            <div className="edit-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div style={{textAlign: "left"}}>
          <h2>{account.user.username}</h2>
          <h3>E-mail: {account.user.email}</h3>
        </div>
      </div>
      <br /><br />
      <a href="/profile/change-password">
        <button className="bg-black">
          Change Password
        </button>
      </a>
      <br /><br /><br />
      <h2>Levels</h2>
      <div className="profile-levels">
      {subjectsToAccounts.map((sta, i) => (
        <div className="profile-level" key={sta.subject.id}>
          <h3>{sta.subject.name}</h3>
          <b>{sta.nextLevelThreshold - sta.xp} XP left</b>
          <div style={{display: "flex", justifyContent: "center"}}>
            <div className="profile-level-bar">
              <div style={{backgroundColor: backgroundColors[i % backgroundColors.length]}} className="profile-level-bar-circle">
                {sta.level}
              </div>
              <ProgressBar width={levelBarWidth} height={30} displayPercentage={false} progress={sta.xp / sta.nextLevelThreshold * levelBarWidth} />
              <div style={{backgroundColor: backgroundColors[i % backgroundColors.length]}} className="profile-level-bar-circle">
                {sta.level + 1}
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}