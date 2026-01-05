"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple password check for MVP
        // In a real app, use NextAuth or a proper session
        if (password === "admin1234") {
            localStorage.setItem("admin_auth", "true");
            router.push("/admin/attendance");
        } else {
            setError("비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <main className="container">
            <div className="card">
                <h1>관리자 로그인</h1>
                <p>서비스 관리를 위해 로그인해주세요.</p>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full">로그인</button>
                </form>

                {error && (
                    <div className="message error">
                        {error}
                    </div>
                )}
            </div>
        </main>
    );
}
