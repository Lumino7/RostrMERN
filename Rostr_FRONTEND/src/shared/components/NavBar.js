import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RostrContext } from "../context/rostr-context";

const NavBar = () => {
  const { activeUser, setActiveUser, setToken } = useContext(RostrContext);
  const navigate = useNavigate();

  const handleLogoutClick = (event) => {
    localStorage.removeItem("userData");
    setActiveUser({});
    setToken(null);
    navigate("/auth");
    alert("Logged out successfully.");
  };

  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" style={{ maxHeight: "90%" }} href="/">
          <img
            src="/rostr-logo-text.svg"
            width="150"
            className="img-fluid"
            alt="logo"
          />
        </a>
        <ul className="navbar-nav d-flex align-items-center">
          <li className="nav-item">
            <div
              className="navbar-text"
              style={{ fontSize: "0.7em" }}
              id="logged-user-text"
            ></div>
          </li>
          <li className="nav-item">
            <div className="navbar-text" style={{ fontSize: "0.8rem" }}>
              Welcome, {activeUser.userFirstName}
            </div>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/logout" onClick={handleLogoutClick}>
              Logout
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
