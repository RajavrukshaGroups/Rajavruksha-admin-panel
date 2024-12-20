import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";  // Import Close icon
import logo from "../../assets/RRPL_Horizontal.png";
import "./header.css";

const MainHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Toggling the state
  };

  return (
    <header className="header">
      <a href="/">
        <img src={logo} alt="Logo" />
      </a>
      <div
        className="hamburger-btn"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        aria-controls="dropdown-menu"
      >
        <MenuIcon fontSize="large" />
      </div>
      <nav
        className={`dropdown-menu ${isMenuOpen ? "visible" : ""}`}
        id="dropdown-menu"
      >
        <div className="close-btn" onClick={toggleMenu}>
          <CloseIcon fontSize="large" style={{color:"white"}}/>
        </div>
        <ul>
          <li>
            <a href="/careers" className="menu-item">
              Careers
            </a>
          </li>
          {/* <li>
            <a href="/careers" className="menu-item">
              Careers
            </a>
          </li> <li>
            <a href="/careers" className="menu-item">
              Careers
            </a>
          </li> */}
        </ul>
      </nav>
    </header>
  );
};

export default MainHeader;
