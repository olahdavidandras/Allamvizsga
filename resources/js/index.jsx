import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000/api";

const Index = () => {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        try {
            const response = await axios.get("/profile");
            setUser(response.data);
        } catch (error) {
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
            </Routes>
        </Router>
    );
};

export default Index;
