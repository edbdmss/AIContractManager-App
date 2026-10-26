import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 240;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const isContractsActive = () => {
    const p = location.pathname;
    return p === "/contracts" || (p.startsWith("/contracts/") && p !== "/contracts/register");
  };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          Contract AI<span style={{ color: "#c4dcd6" }}>.</span>
          <p style={styles.brandSub}>CONTRACT MANAGER</p>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/home"
            end
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
          >
            홈
          </NavLink>

          <NavLink
            to="/contracts"
            end
            style={() => ({ ...styles.navItem, ...(isContractsActive() ? styles.navItemActive : {}) })}
          >
            내 계약
          </NavLink>

          <NavLink
            to="/contracts/register"
            end
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
          >
            계약 등록
          </NavLink>

          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
          >
            대시보드
          </NavLink>

          <NavLink
            to="/chatbot"
            end
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
          >
            챗봇
          </NavLink>

          <NavLink
            to="/suggestions"
            end
            style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
          >
            등록 제안
          </NavLink>
        </nav>

        <div style={styles.asideNote}>
          복잡한 계약은 쉽게,<br />
          중요한 일정은 놓치지 않게.
        </div>

        <button type="button" style={styles.logoutBtn} onClick={onLogout}>
          로그아웃
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <span style={styles.eyebrow}>YOUR CONTRACTS, ALL TOGETHER.</span>
          <button style={styles.topRegisterBtn} onClick={() => navigate("/contracts/register")}>
            + 계약 등록
          </button>
        </header>

        <section style={styles.content}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    width: "100%",
    minHeight: "100vh",
    background: "#f3f6f8",
    overflow: "hidden",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: "100vh",
    background: "#fff",
    borderRight: "1px solid #e3eaee",
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    overflowY: "auto",
  },
  brand: {
    fontSize: 30,
    fontWeight: 900,
    letterSpacing: -1.5,
    color: "#087e7d",
    lineHeight: 1.1,
  },
  brandSub: {
    margin: "6px 0 0",
    fontSize: 11,
    color: "#71818d",
    letterSpacing: 1.5,
  },
  nav: {
    display: "grid",
    gap: 8,
    marginTop: 16,
  },
  navItem: {
    textDecoration: "none",
    color: "#617380",
    fontWeight: 650,
    borderRadius: 12,
    padding: "12px 14px",
  },
  navItemActive: {
    background: "#e8f5f2",
    color: "#087e7d",
  },
  asideNote: {
    fontSize: 12,
    color: "#71818d",
    lineHeight: 1.6,
    marginTop: 10,
  },
  logoutBtn: {
    marginTop: "auto",
    height: 40,
    borderRadius: 10,
    border: "1px solid #d7e3e8",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    color: "#334155",
  },

  main: {
    marginLeft: SIDEBAR_WIDTH,
    width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  topbar: {
    height: 64,
    borderBottom: "1px solid #e3eaee",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 11,
    color: "#087e7d",
    fontWeight: 800,
    letterSpacing: 1.5,
  },
  topRegisterBtn: {
    border: 0,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 650,
    background: "#edf4f4",
    color: "#087e7d",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    overflowY: "auto",
    minWidth: 0,
    padding: 20,
  },
};
