import React from "react";
import AuroraHero from "./AuroraHero";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const onNavigate = (view) => {
    switch (String(view).toLowerCase()) {
      case "login":
        navigate("/login");
        break;
      case "signup":
      case "register":
        navigate("/signup");
        break;
      case "home":
        navigate("/");
        break;
      default:
        break;
    }
  };
  return <AuroraHero onNavigate={onNavigate} />;
}
