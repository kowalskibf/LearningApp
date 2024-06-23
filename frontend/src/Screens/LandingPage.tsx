// import React from "react";
import React, { useEffect, useState } from "react";
import "../App.css";

export default function LandingPage() {

  return (
    <div className="landing-page-main">
      <div className="landing-page-half">
        <div className="landing-page-left-container">
        <span className="span-secondary-color">Learn</span>.<br/>
          Everything.<br/>
          Everywhere.<br/>
          Everytime.
        </div>
      </div>
      <div className="landing-page-half">
        <div className="landing-page-right-container">
          <div className="landing-page-right-elem">
            <div className="landing-page-right-item-label">
              Already have an account?
            </div>
            <div className="landing-page-right-item-label">
              <a href="/login">
                <button className="landing-page-button">
                  Login here
                </button>
              </a>
            </div>
          </div>
          <div className="landing-page-right-elem">
            <div className="landing-page-right-item-label">
              Don't have an account?
            </div>
            <div className="landing-page-right-item-label">
              <a href="/register">
                <button className="landing-page-button">
                  Register here
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};