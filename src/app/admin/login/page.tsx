"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
            const resp = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();

            if (resp.ok) {
                router.push("/admin");
            } else {
                setError(data.error || "인증 실패");
            }
        } catch (err) {
            console.error(err);
            setError("서버 연결 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass-card shadow-2xl" style={{ width: "100%", maxWidth: "440px", padding: "3rem", position: "relative", overflow: "hidden" }}>
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
                        {isLogin ? "🔐" : "📝"}
                    </div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{isLogin ? "관리자 로그인" : "관리자 가입"}</h1>
                    <p style={{ fontSize: "0.95rem", margin: 0 }}>{isLogin ? "이메일과 비밀번호를 입력하세요." : "새로운 관리자 계정을 생성합니다."}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>이메일</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem" }}>비밀번호</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary shadow-lg" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} disabled={loading}>
                        {loading ? "처리 중..." : (isLogin ? "로그인하기" : "가입하기")}
                    </button>

                    {error && (
                        <div className="message error" style={{ marginTop: "1.5rem", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "var(--secondary)" }}>
                        {isLogin ? "만약 계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                        <span
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            style={{ marginLeft: "0.5rem", color: "var(--primary)", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}
                        >
                            {isLogin ? "가입하기" : "로그인하기"}
                        </span>
                    </div>
                </form>
            </div>
        </main>
    );
}
