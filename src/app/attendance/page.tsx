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
                setMessage({ text: "출석이 완료되었습니다!", type: "success" });
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
        <div className="card">
            <h1>번영로 청소년부 출석체크</h1>
            <p>{date} 예배 출석</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="phone">연락처</label>
                    <input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">이름 (선택)</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading} className="w-full" style={{ marginTop: "1.5rem" }}>
                    {loading ? "처리 중..." : "출석하기"}
                </button>
            </form>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default function AttendancePage() {
    return (
        <main className="container">
            <Suspense fallback={<div>로딩 중...</div>}>
                <AttendanceForm />
            </Suspense>
        </main>
    );
}
