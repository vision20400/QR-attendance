"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPhoneNumber } from "@/lib/format";

function AttendanceForm() {
    const searchParams = useSearchParams();
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name, date }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: "출석이 성공적으로 완료되었습니다!", type: "success" });
                setPhone("");
                setName("");
            } else {
                setMessage({ text: data.error || "출석 처리 중 오류가 발생했습니다.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "서버와 통신 중 오류가 발생했습니다.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "3rem" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <div style={{
                    fontSize: "4rem",
                    marginBottom: "1rem",
                    filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))"
                }}>

                </div>
                <h1 style={{ fontSize: "2.25rem", marginBottom: "0.75rem", background: "linear-gradient(135deg, var(--primary), #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    출석 체크
                </h1>
                <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>{date.replace(/-/g, ". ")} 예배</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "700", fontSize: "0.95rem" }}>이름</label>
                    <input
                        type="text"
                        placeholder="이름을 입력해주세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        required
                        style={{ padding: "1.1rem" }}
                    />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "700", fontSize: "0.95rem" }}>연락처 <span style={{ fontWeight: "400", color: "var(--secondary)", fontSize: "0.8rem" }}>(선택)</span></label>
                    <input
                        type="tel"
                        placeholder="010-0000-0000"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        disabled={loading}
                        style={{ padding: "1.1rem" }}
                    />
                </div>

                <button type="submit" disabled={loading} style={{ width: "100%", padding: "1.2rem", fontSize: "1.1rem", borderRadius: "20px" }}>
                    {loading ? "기록 중..." : "출석 확인하기"}
                </button>
            </form>

            {message && (
                <div className={`message ${message.type}`} style={{ animation: "modalEnter 0.4s ease-out" }}>
                    {message.type === "success" ? "✅ " : "❌ "}
                    {message.text}
                </div>
            )}

            <div style={{ marginTop: "3rem", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--secondary)", margin: 0 }}>
                    번영로 청소년부 (BYR Youth)
                </p>
            </div>
        </div>
    );
}

export default function AttendancePage() {
    return (
        <main className="container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)" }}>
            <Suspense fallback={<div>로딩 중...</div>}>
                <AttendanceForm />
            </Suspense>
        </main>
    );
}
