import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "./axios";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Gallery from "./components/Gallery";
import UploadImage from "./components/UploadImage";
import PublicGallery from './components/PublicGallery';

import '../css/app.css';

const Index = () => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (err) {
      console.error("Hiba a felhasználó lekérésekor:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/gallery" element={<Gallery user={user} />} />
        <Route path="/upload" element={<UploadImage user={user}/>} />
        <Route path="/public-gallery" element={<PublicGallery  user={user} />} />
      </Routes>
    </Router>
  );
};

export default Index;
