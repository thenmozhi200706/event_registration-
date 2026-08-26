import React from "react";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";
const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <main className="admin-layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;