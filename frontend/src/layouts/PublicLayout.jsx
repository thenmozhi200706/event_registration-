import React from "react";
import { Outlet } from "react-router-dom";
import "./PublicLayout.css";
const PublicLayout = () => {
  return (
    <div className="public-layout">
      <main className="public-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;