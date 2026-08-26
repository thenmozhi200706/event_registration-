import React from "react";
import { Outlet } from "react-router-dom";
import "./OrganizerLayout.css";
const OrganizerLayout = () => {
  return (
    <div className="organizer-layout">
      <main className="organizer-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default OrganizerLayout;