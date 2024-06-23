import React, { useEffect, useState } from "react";
import "../App.css";
import {getColorForSubject, timeAgo} from "../functions";
import "../types";

export default function FriendsPage() {
  const API_URL = "http://127.0.0.1:8000";
  const [user, setUser] = useState<User>();
  const [searchUsername, setSearchUsername] = useState<string>("");
  const [friends, setFriends] = useState<Account[]>([]);
  const [receivedFriends, setReceivedFriends] = useState<Account[]>([]);
  const [sentFriends, setSentFriends] = useState<Account[]>([]);

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

  const fetchReceivedFriendRequests = async () => {
    fetch("http://127.0.01:8000/api/friend/received", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setReceivedFriends(data);
    });
  };

  const fetchSentFriendRequests = async () => {
    fetch("http://127.0.01:8000/api/friend/request/sent", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setSentFriends(data);
    });
  };

  const acceptFriendRequest = async (friendId: number) => {
    const r = await fetch("http://127.0.0.1:8000/api/friend/request/accept", {
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
        fetchFriends();
        fetchReceivedFriendRequests();
        fetchSentFriendRequests();
      }
    });
  };

  const declineFriendRequest = async (friendId: number) => {
    const r = await fetch("http://127.0.0.1:8000/api/friend/request/decline", {
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
        fetchFriends();
        fetchReceivedFriendRequests();
      }
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
        fetchFriends();
        fetchReceivedFriendRequests();
        fetchSentFriendRequests();
      }
    });
  };

  const removeFriend = async (friendId: number) => {
    const r = await fetch("http://127.0.0.1:8000/api/friend/remove", {
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
        fetchFriends();
      }
    });
  };

  const filteredFriends = friends
    .filter((friend) => friend.user.username.includes(searchUsername));


  useEffect(() => {
    fetchUser();
    fetchFriends();
    fetchReceivedFriendRequests();
    fetchSentFriendRequests();
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
          <a href="/home">
            <button className="bg-black">Back</button>
          </a>
        </div>
        <div className="w-100 ta-right">
          <a href="/users">
            <button className="bg-black">
              Add friends
            </button>
          </a>
        </div>
        <h2>My friends</h2>
        <br />
        <div className="search-courses">
          <input
              type="text"
              className="search-courses-input"
              placeholder="Search friends"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 20 20"><path fill="currentColor" d="m17.545 15.467l-3.779-3.779a6.15 6.15 0 0 0 .898-3.21c0-3.417-2.961-6.377-6.378-6.377A6.185 6.185 0 0 0 2.1 8.287c0 3.416 2.961 6.377 6.377 6.377a6.15 6.15 0 0 0 3.115-.844l3.799 3.801a.953.953 0 0 0 1.346 0l.943-.943c.371-.371.236-.84-.135-1.211M4.004 8.287a4.282 4.282 0 0 1 4.282-4.283c2.366 0 4.474 2.107 4.474 4.474a4.284 4.284 0 0 1-4.283 4.283c-2.366-.001-4.473-2.109-4.473-4.474"/></svg>
        </div>
        <br />
        <div className="all-users">
          {
            !filteredFriends.length &&
            <i>You have no friends (and propably live in basement)</i>
          }
          {filteredFriends.map((friend) => (
            <div className="user">
              <img className="avatar-very-large" src={API_URL + (friend.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : friend.avatar)} />
              <h2>{friend.user.username}</h2>

              <div className="user-stats">
                <br />
                <i>Levels</i>
                <br />
                {/* Nice to Have - change to progress bar */}
                {friend.subjects?.length ? friend.subjects.map((subject) => (
                  <div className="user-stat">
                    <p>{subject.subject.name} : &nbsp;</p>
                    <div style={{backgroundColor: getColorForSubject(subject.id)}} className="user-stat-level">Lvl. {subject.level}</div>
                  </div>
                )) : 
                  <i>User has no subjects yet</i>
                }
              </div>
              <div className="w-100 ta-right">
                <button className="cancel-request" onClick={(e) => removeFriend(friend.user.id)}>Remove Friend</button>
              </div>
            </div>
          ))}
        </div>
        <br />
        <h2>Received friend requests</h2>
        {
          !receivedFriends.length &&
          <>
            <br />
            <i>You have no friends requests</i>
          </>
        }
        <div className="all-users">
        {receivedFriends.map((friend) => (
        <div className="user">
          <img className="avatar-very-large" src={API_URL + (friend.avatar === null ? "/course_images/course_images/default_avatar.jpeg" : friend.avatar)} />
          <h2>{friend.user.username}</h2>

          <div className="user-stats">
            <br />
            <i>Levels</i>
            <br />
            {/* Nice to Have - change to progress bar */}
            {friend.subjects?.length ? friend.subjects.map((subject) => (
              <div className="user-stat">
                <p>{subject.subject.name} : &nbsp;</p>
                <div style={{backgroundColor: getColorForSubject(subject.id)}} className="user-stat-level">Lvl. {subject.level}</div>
              </div>
            )) : 
              <i>User has no subjects yet</i>
            }
          </div>
          <div className="w-100 back-next-buttons">
            <button className="accept-request" onClick={(e) => acceptFriendRequest(friend.user.id)}>Accept</button>
            <button className="cancel-request" onClick={(e) => declineFriendRequest(friend.user.id)}>Decline</button>
          </div>
        </div>
        ))}
        </div>
    </>
  );
}