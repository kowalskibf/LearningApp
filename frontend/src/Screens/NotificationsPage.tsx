// import React from "react";
import React, { useEffect, useState } from "react";
import "../App.css";
import {sendUserBackToLoginPageIfNotLoggedIn, timeAgo} from "../functions";
import "../types";

export default function NotificationsPage() {

  const [user, setUser] = useState<User>();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);

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

  const fetchNotifications = async () => {
    fetch("http://127.0.0.1:8000/api/notifications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${localStorage.getItem("token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => setNotifications(d));
  };

  const goTo = async (id: number, url: string) => {
    const r = await fetch(`http://127.0.0.1:8000/api/notification/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
    })
    .then(() => window.location.replace(url));
  }

  const readNotification = async (id: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/notification/${id}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
    })
    .then(() => fetchNotifications());
  }

  const removeNotification = async (id: number) => {
    const r = await fetch(`http://127.0.0.1:8000/api/notification/${id}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
        },
    })
    .then(() => fetchNotifications());
  }

  useEffect(() => {
    sendUserBackToLoginPageIfNotLoggedIn();
    fetchUser();
    fetchNotifications();
  }, []);

  if (user === undefined) {
    return (
      <div>
        <div className="skeleton"></div>
      </div>
    );
  }

  return (
    <div>
        <a href="/home">Back</a>
        <br/><br/>
        {notifications.some(n => !n.read) ? "NIEODCZYTANE ISTNIEJE" : ""}
        <br/><br/>
        {notifications.map((n) => (
            <div key={n.id}>
                <span className="c-red">{n.read ? "" : "czerwona kropka oznaczajaca ze nowe/nieodczytane"}<br/></span>
                {timeAgo(new Date(n.date))}<br/>
                {n.message}<br/>
                <button type="button" onClick={() => goTo(n.id, n.url)}>Go</button><br/>
                <button type="button" onClick={() => readNotification(n.id)}>Read</button><br/>
                <button type="button" onClick={() => removeNotification(n.id)}>Remove</button><br/>
            </div>
        ))}
    </div>
  );
};