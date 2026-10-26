import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", padding: 16 }}>
      <Outlet />
    </div>
  );
}
