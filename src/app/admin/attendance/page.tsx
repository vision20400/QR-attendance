"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
    id: string; // studentId
    name: string | null;
    phone: string;
    isPresent: boolean;
    checkedAt: string | null;
    attendanceId: string | null;
}

export default function AdminAttendancePage() {
    const router = useRouter();
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "present" | "absent">("all");

    useEffect(() => {
        const auth = localStorage.getItem("admin_auth");
        if (auth !== "true") {
            router.push("/admin/login");
            return;
        }
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`/api/admin/attendance?date=${date}`);
            const data = await resp.json();
            setRecords(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        const total = records.length;
        const present = records.filter(r => r.isPresent).length;
        return {
            total,
            present,
            ratio: total > 0 ? ((present / total) * 100).toFixed(1) : "0",
        };
    }, [records]);

    const filteredRecords = useMemo(() => {
        if (filter === "present") return records.filter(r => r.isPresent);
        if (filter === "absent") return records.filter(r => !r.isPresent);
        return records;
    }, [records, filter]);

    const handleLogout = () => {
        localStorage.removeItem("admin_auth");
        router.push("/admin/login");
    };

    return (
        <main className="container" style={{ justifyContent: "flex-start", paddingTop: "4rem" }}>
            <div className="card" style={{ maxWidth: "1000px", padding: "2rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <h1 style={{ textAlign: "left", margin: 0 }}>번영로 청소년부 출석 관리</h1>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                        <button onClick={() => router.push("/admin/students")} className="btn-secondary">학생 관리</button>
                        <button onClick={handleLogout} className="btn-secondary">로그아웃</button>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
                    <div style={{ padding: "1.25rem", borderRadius: "var(--radius)", textAlign: "center", background: "rgba(37, 99, 235, 0.05)", border: "1px solid rgba(37, 99, 235, 0.1)" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--secondary)", marginBottom: "0.25rem" }}>총원</div>
                        <div style={{ fontSize: "1.375rem", fontWeight: "bold" }}>{stats.total}명</div>
                    </div>
                    <div style={{ padding: "1.25rem", borderRadius: "var(--radius)", textAlign: "center", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--secondary)", marginBottom: "0.25rem" }}>출석</div>
                        <div style={{ fontSize: "1.375rem", fontWeight: "bold", color: "var(--primary)" }}>{stats.present}명</div>
                    </div>
                    <div style={{ padding: "1.25rem", borderRadius: "var(--radius)", textAlign: "center", background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.15)" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--secondary)", marginBottom: "0.25rem" }}>출석률</div>
                        <div style={{ fontSize: "1.375rem", fontWeight: "bold" }}>{stats.ratio}%</div>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: "auto" }}
                        />
                        <div className="tabs">
                            <button
                                onClick={() => setFilter("all")}
                                className={filter === "all" ? "active" : ""}
                            >전체</button>
                            <button
                                onClick={() => setFilter("present")}
                                className={filter === "present" ? "active" : ""}
                            >출석</button>
                            <button
                                onClick={() => setFilter("absent")}
                                className={filter === "absent" ? "active" : ""}
                            >미출석</button>
                        </div>
                    </div>
                </div>

                <div className="table-container" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                                <th style={{ padding: "1rem" }}>이름</th>
                                <th style={{ padding: "1rem" }}>연락처</th>
                                <th style={{ padding: "1rem" }}>상태</th>
                                <th style={{ padding: "1rem" }}>출석 시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem" }}>데이터를 불러오는 중...</td></tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: "center", padding: "3rem" }}>표시할 데이터가 없습니다.</td></tr>
                            ) : (
                                filteredRecords.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: "1px solid var(--border)", opacity: rec.isPresent ? 1 : 0.6 }}>
                                        <td style={{ padding: "0.75rem 1rem" }}>{rec.name || "-"}</td>
                                        <td style={{ padding: "0.75rem 1rem" }}>{rec.phone}</td>
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            <span style={{
                                                padding: "0.25rem 0.6rem",
                                                borderRadius: "1rem",
                                                fontSize: "0.75rem",
                                                fontWeight: "bold",
                                                background: rec.isPresent ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.05)",
                                                color: rec.isPresent ? "var(--success)" : "var(--error)"
                                            }}>
                                                {rec.isPresent ? "출석 완료" : "미출석"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            {rec.checkedAt ? new Date(rec.checkedAt).toLocaleTimeString() : "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
