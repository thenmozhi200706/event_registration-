import React from "react";
import { Outlet } from "react-router-dom";
import "./ParticipantLayout.css";
const ParticipantLayout = () => {
  return (
    <div className="participant-layout">
      <main className="participant-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ParticipantLayout;