"use client";

import { useState, useEffect, use } from "react";
import { formatPhoneNumber } from "@/lib/format";

export default function AttendancePage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetch(`/api/attendance/${projectId}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setProjectName(data.name);
            })
            .catch(err => console.error("Error fetching project info:", err));
    }, [projectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const resp = await fetch(`/api/attendance/${projectId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone }),
            });

            const data = await resp.json();

            if (resp.ok) {
                setMessage({ type: "success", text: `${data.name}님, 출석이 완료되었습니다! ✨` });
                setName("");
                setPhone("");
            } else {
                setMessage({ type: "error", text: data.error || "출석 체크 실패" });
            }
        } catch (err) {
            setMessage({ type: "error", text: "서버 연결에 실패했습니다." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="glass-card shadow-2xl" style={{ maxWidth: "480px", width: "100%", padding: "3.5rem 2.5rem", textAlign: "center" }}>
                <header style={{ marginBottom: "3rem" }}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📅</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
                        {projectName && (
                            <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "20px", background: "rgba(0,0,0,0.05)", fontSize: "0.85rem", fontWeight: "600", color: "var(--secondary)" }}>
                                {projectName}
                            </div>
                        )}
                        <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--primary)" }}>
                            {new Date().toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                        </div>
                    </div>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>출석 체크</h1>
                    <p style={{ color: "var(--secondary)", fontSize: "1.05rem" }}>이름과 연락처를 입력해주세요</p>
                </header>

                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                    <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                        <label style={{ fontWeight: "600", color: "var(--foreground)" }}>이름</label>
                        <input
                            type="text"
                            placeholder="이름을 입력해주세요"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: "2.5rem" }}>
                        <label style={{ fontWeight: "600", color: "var(--foreground)" }}>연락처 (선택)</label>
                        <input
                            type="tel"
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        />
                    </div>

                    <button type="submit" className="btn-primary shadow-lg" style={{ width: "100%", padding: "1.25rem", fontSize: "1.2rem" }} disabled={loading}>
                        {loading ? "처리 중..." : "출석 완료하기"}
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.type}`} style={{ marginTop: "2rem", padding: "1.25rem", borderRadius: "16px", fontWeight: "600" }}>
                        {message.text}
                    </div>
                )}
            </div>
        </main>
    );
}
