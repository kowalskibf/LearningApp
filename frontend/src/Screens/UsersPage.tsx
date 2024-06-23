import React, { useEffect, useState } from "react";
import "../App.css";
import {timeAgo, getColorForSubject} from "../functions";
import "../types";

export default function UsersPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [friends, setFriends] = useState<Account[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchUsername, setSearchUsername] = useState<string>("");

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

  const fetchMyFriendRequests = async () => {
    fetch("http://127.0.0.1:8000/api/all_friend_requests", {
      method: "GET",
      headers: {
        "Content-Type": "applicaion/json",
        Authorization: `Token ${localStorage.getItem("token")}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setFriendRequests(data);
      });
  };

  const fetchAccounts = async () => {
    fetch("http://127.0.0.1:8000/api/accounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAccounts(data);
        console.log(data);
      });
  };

  const fetchFriends = async () => {
    fetch("http://127.0.0.1:8000/api/friends", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFriends(data);
      });
  };

  const cancelFriendRequest = async (friendId: number) => {
    const r = await fetch("http://127.0.0.1:8000/api/friend/request/cancel", {
      method: "POST",
      headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        friend_id: friendId,
      }),
    })
    .then((r) => {
      if(r.ok)
      {
        console.log("udalo sie");
        fetchMyFriendRequests();
      }
    });
  };

  const addFriend = async (friendId: number) => {
    const r = await fetch("http://127.0.0.1:8000/api/friend/add", {
      method: "POST",
      headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        friend_id: friendId,
      }),
    })
    .then((r) => {
      if(r.ok)
      {
        fetchMyFriendRequests();
        console.log("udalo sie");
      }
    });
  };

  const filteredAccounts = accounts
    .filter((account) => account.user.username.includes(searchUsername));


  useEffect(() => {
    fetchUser();
    fetchFriends();
    fetchMyFriendRequests();
    fetchAccounts();
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
        <div className="w-100 ta-left">
          <a href="/friends">
            <button className="bg-black">Back</button>
          </a>
        </div>
        <h2>All users</h2>
        <br />
        <div className="search-courses">
          <input
              type="text"
              className="search-courses-input"
              placeholder="Search users"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20"><path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211M4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474"/></svg>
        </div>
        <br /><br />
        <div className="all-users">
          {filteredAccounts.filter((account) => account.id !== user.id).map((account) => (
            <div className="user">
              <img className="avatar-very-large" src={API_URL + (account.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : account.avatar)} />
              <h2>{account.user.username}</h2>

              <div className="user-stats">
                <br />
                <i>Levels</i>
                <br />
                {/* Nice to Have - change to progress bar */}
                {account.subjects?.length ? account.subjects.map((subject) => (
                  <div className="user-stat">
                    <p>{subject.subject.name} : &nbsp;</p>
                    <div style={{backgroundColor: getColorForSubject(subject.id)}} className="user-stat-level">Lvl. {subject.level}</div>
                  </div>
                )) : 
                  <i>User has no subjects yet</i>
                }
              </div>
              {
                friends.find((obj) => obj.user.id === account.user.id) ?
                <div className="w-100 ta-right">
                  <button className="bg-green pe-none">
                    Already a friend
                  </button>
                </div> :
                (
                  friendRequests.find((obj) => obj.sender.user.id === user.id && obj.receiver.user.id === account.user.id) ?
                  <div className="w-100 ta-right">
                    <button className="cancel-request" onClick={(e) => cancelFriendRequest(account.user.id)}>Cancel request</button>
                  </div> :
                  <div className="w-100 ta-right">
                    <button className="bg-black" onClick={(e) => addFriend(account.user.id)}>Add friend</button>
                  </div>
                )
              }
              
            </div>
          ))}
        </div>
    </>
  );
}