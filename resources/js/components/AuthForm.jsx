import { useState } from "react";

export default function AuthForm({ isLogin }) {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isLogin ? "/api/login" : "/api/register";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            setMessage(data.message || "Siker!");

            if (isLogin && response.ok) {
                localStorage.setItem("user_id", data.user_id);
            }
        } catch (error) {
            setMessage("Hiba történt!");
        }
    };

    return (
        <div>
            <h2>{isLogin ? "Bejelentkezés" : "Regisztráció"}</h2>
            <form onSubmit={handleSubmit}>
                {!isLogin && <input type="text" name="name" placeholder="Név" onChange={handleChange} required />} 
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Jelszó" onChange={handleChange} required />
                <button type="submit">{isLogin ? "Bejelentkezés" : "Regisztráció"}</button>
            </form>
            <p>{message}</p>
        </div>
    );
}
