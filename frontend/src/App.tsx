import React, { useEffect } from "react";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "@fontsource/roboto";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/700.css";
import LandingPage from "./Screens/LandingPage";
import LoginPage from "./Screens/LoginPage";
import RegisterPage from "./Screens/RegisterPage";
import HomePage from "./Screens/HomePage";
import ProfilePage from "./Screens/ProfilePage";
import LogoutPage from "./Screens/LogoutPage";
import SubjectsPage from "./Screens/SubjectsPage";
import CoursesPage from "./Screens/CoursesPage";
import SubjectEditPage from "./Screens/SubjectEditPage";
import CourseEditPage from "./Screens/CourseEditPage";
import FriendsPage from "./Screens/FriendsPage";
import UsersPage from "./Screens/UsersPage";
import CreateNewCoursePage from "./Screens/CreateNewCoursePage";
import SlideEditPage from "./Screens/SlideEditPage";
import CourseViewPage from "./Screens/CourseViewPage";
import SlideViewPage from "./Screens/SlideViewPage";
import ChangePasswordPage from "./Screens/ChangePasswordView";
import ThreadsPage from "./Screens/ThreadsPage";
import CreateThreadPage from "./Screens/CreateThreadPage";
import ThreadPage from "./Screens/ThreadPage";
import FlashcardsPage from "./Screens/FlashcardsPage";
import CreateNewFlashcardSetPage from "./Screens/CreateNewFlashcardSetPage";
import FlashcardSetEditPage from "./Screens/FlashcardSetEditPage";
import FlashcardEditPage from "./Screens/FlashcardEditPage";
import FlashcardSetViewPage from "./Screens/FlashcardSetViewPage";
import FlashcardSetPracticeModePage from "./Screens/FlashcardSetPracticeModePage";
import FlashcardSetTestModePage from "./Screens/FlashcardSetTestModePage";
import NotificationsPage from "./Screens/NotificationsPage";
import RecentCoursesPage from "./Screens/RecentCoursesPage";
import MyCoursesPage from "./Screens/MyCoursesPage";
import MyFlashcardsPage from "./Screens/MyFlashcardsPage";
import Navbar from "./Components/Navbar";

import {trackActivity} from "./functions";
import CourseAcceptAdminPage from "./Screens/CourseAcceptAdminPage";
import CourseAdminViewPage from "./Screens/CourseAdminViewPage";
import SlideAdminViewPage from "./Screens/SlideAdminViewPage";

export default function App() {
  useEffect(() => {trackActivity();}, []);
  return (
    <div className="App">
      {
        window.localStorage.getItem("token") &&
        <Navbar />
      }
      <div className="content">
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/subject/:id/edit" element={<SubjectEditPage />} />
            <Route path="/course/:id/edit" element={<CourseEditPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/course/new" element={<CreateNewCoursePage />} />
            <Route path="/course/:courseid/slide/:slidenum/edit" element={<SlideEditPage />} />
            <Route path="/course/:id/view" element={<CourseViewPage />} />
            <Route path="/course/:courseid/slide/:slidenum/view" element={<SlideViewPage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
            <Route path="/threads" element={<ThreadsPage />} />
            <Route path="/thread/new" element={<CreateThreadPage/> }/>
            <Route path="/thread/:id" element={<ThreadPage/> }/>
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/flashcardset/new" element={<CreateNewFlashcardSetPage />} />
            <Route path="/flashcardset/:id/edit" element={<FlashcardSetEditPage />} />
            <Route path="/flashcardset/:id/view" element={<FlashcardSetViewPage />} />
            <Route path="/flashcard/:id/edit" element={<FlashcardEditPage />} />
            <Route path="/flashcardset/:id/practice" element={<FlashcardSetPracticeModePage />} />
            <Route path="/flashcardset/:id/test" element={<FlashcardSetTestModePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/courses/recent" element={<RecentCoursesPage />} />
            <Route path="/courses/my" element={<MyCoursesPage />} />
            <Route path="/flashcards/my" element={<MyFlashcardsPage />} />
            <Route path="/admin/courses" element={<CourseAcceptAdminPage />} />
            <Route path="/admin/course/:id/view" element={<CourseAdminViewPage />} />
            <Route path="/admin/course/:courseid/slide/:slidenum/view" element={<SlideAdminViewPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  )
}
