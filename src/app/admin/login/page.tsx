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
        if (password === "admin1234") {
            localStorage.setItem("admin_auth", "true");
            router.push("/admin/attendance");
        } else {
            setError("비밀번호가 올바르지 않습니다.");
        }
    };

    return (
        <main className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass-card" style={{ maxWidth: "420px", width: "100%", padding: "3rem" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        background: "var(--primary)",
                        borderRadius: "16px",
                        margin: "0 auto 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        color: "white",
                        boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)"
                    }}>
                        🔒
                    </div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>관리자 로그인</h1>
                    <p style={{ fontSize: "0.95rem", margin: 0 }}>관리자 비밀번호를 입력하세요.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" style={{ width: "100%", padding: "1rem" }}>
                        로그인하여 입장하기
                    </button>
                </form>

                {error && (
                    <div className="message error" style={{ fontSize: "0.9rem" }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <button
                        onClick={() => router.push("/")}
                        className="btn-secondary"
                        style={{ border: "none", background: "none", fontSize: "0.85rem", color: "var(--secondary)" }}
                    >
                        ← 메인 페이지로 돌아가기
                    </button>
                </div>
            </div>
        </main>
    );
}
