import { useDispatch } from "react-redux";
import { changeRoute } from "../store/route/routeSlice";

import "../css/navbar.css";

export const Navbar = () => {
  const dispatch = useDispatch();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light header">
        <div className="container-fluid">
          <span className="navbar-brand font-weight-bold">
            <img
              src="https://bus.unab.edu.co/static/src/logo-busu.png"
              alt="UNAB logo"
              style={{ height: "2em" }}
            />
          </span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  id="navbarDropdownMenuLink"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Rutas
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        dispatch(changeRoute(1));
                        localStorage.setItem("route", 1);
                      }}
                    >
                      Ruta 1
                    </div>
                  </li>
                  <li>
                    <div
                      className="dropdown-item"
                      onClick={() => {
                        dispatch(changeRoute(2));
                        localStorage.setItem("route", 2);
                      }}
                    >
                      Ruta 2
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
