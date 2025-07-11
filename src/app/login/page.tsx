"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./loginStyle.module.scss";
import { login } from "@/services/loginService";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Email validation (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 4) {
      setError("Password must have at least 4 characters.");
      return;
    }

    const res = await login({
      email,
      password,
    });
    if (res?.error) {
      setError(res.error);
    } else {
      console.log(res);
      localStorage.setItem("token", res.token);
      router.push("/dashboard");
    }
  };

  return (
    <div className="container">
      <div className={`row ${styles.loginCol}`}>
        <h2>Signin</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-blue">
            Login
          </button>
        </form>
        <div className="container">
          <Link href="/signup">
            <button className="btn-none">signup</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
