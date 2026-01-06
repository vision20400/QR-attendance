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
            if (Array.isArray(data)) {
                setRecords(data);
            } else {
                setRecords([]);
            }
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

    const toggleAttendance = async (studentId: string, isPresent: boolean) => {
        try {
            const resp = await fetch("/api/admin/attendance/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, date, isPresent: !isPresent }),
            });
            if (resp.ok) {
                fetchData();
            } else {
                alert("출석 상태 변경에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const downloadExcel = () => {
        if (records.length === 0) return;

        const escapeCsv = (val: any) => {
            const str = String(val ?? "");
            if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const headers = ["이름", "연락처", "출석여부", "출석시간"];
        const rows = records.map(rec => [
            rec.name || "-",
            rec.phone || "-",
            rec.isPresent ? "출석" : "미출석",
            rec.checkedAt ? new Date(rec.checkedAt).toLocaleString() : "-"
        ]);

        const csvContent = [
            "\uFEFF" + headers.map(escapeCsv).join(","), // Add BOM for Excel UTF-8 support
            ...rows.map(row => row.map(escapeCsv).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${date}_출석현황.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadFullExcel = async () => {
        try {
            const resp = await fetch("/api/admin/attendance/export-all");
            const data = await resp.json();

            if (!Array.isArray(data)) {
                alert("데이터를 불러오지 못했습니다.");
                return;
            }

            const escapeCsv = (val: any) => {
                const str = String(val ?? "");
                if (str.includes(",") || str.includes("\n") || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // 1. Get all unique dates
            const allDates = Array.from(new Set(data.flatMap((s: any) => s.attendances))).sort();

            // 2. Prepare headers
            const baseHeaders = ["이름", "학교", "학년", "연락처"];
            const headers = [...baseHeaders, ...allDates, "총 출석"];

            // 3. Prepare rows
            const rows = data.map((s: any) => {
                const attendanceState = allDates.map(d => s.attendances.includes(d) ? "O" : "X");
                return [
                    s.name || "-",
                    s.school || "-",
                    s.year || "-",
                    s.phone || "-",
                    ...attendanceState,
                    s.attendances.length
                ];
            });

            // 4. Create CSV
            const csvContent = [
                "\uFEFF" + headers.map(escapeCsv).join(","),
                ...rows.map(row => row.map(escapeCsv).join(","))
            ].join("\n");

            // 5. Download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `전체출석부_${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("다운로드 중 오류가 발생했습니다.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_auth");
        router.push("/admin/login");
    };

    return (
        <main className="container">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ textAlign: "left", fontSize: "2.5rem", marginBottom: "0.5rem" }}>출석 현황</h1>
                    <p style={{ textAlign: "left", margin: 0 }}>일자별 출석 기록을 확인하고 관리합니다.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button onClick={downloadFullExcel} className="btn-secondary" style={{ background: "var(--primary)", color: "white", border: "none" }}>
                        📑 전체 출석부 받기
                    </button>
                    <button onClick={downloadExcel} className="btn-secondary" style={{ background: "var(--success)", color: "white", border: "none" }}>
                        📥 선택일 엑셀 받기
                    </button>
                    <button onClick={() => router.push("/admin/students")} className="btn-secondary">
                        👥 학생 관리
                    </button>
                    <button onClick={handleLogout} className="btn-error" style={{ height: "100%" }}>
                        로그아웃
                    </button>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
                    <div style={{ fontSize: "0.9rem", color: "var(--secondary)", fontWeight: "600" }}>총 학생 수</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.5rem" }}>{stats.total}명</div>
                </div>
                <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--success)" }}>
                    <div style={{ fontSize: "0.9rem", color: "var(--secondary)", fontWeight: "600" }}>오늘 출석</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.5rem", color: "var(--success)" }}>{stats.present}명</div>
                </div>
                <div className="card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--primary)" }}>
                    <div style={{ fontSize: "0.9rem", color: "var(--secondary)", fontWeight: "600" }}>출석률</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", marginTop: "0.5rem" }}>{stats.ratio}%</div>
                </div>
            </div>

            <div className="glass-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ width: "auto" }}
                        />
                    </div>
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", padding: "0.3rem", borderRadius: "12px", gap: "0.3rem" }}>
                        <button
                            onClick={() => setFilter("all")}
                            className={filter === "all" ? "" : "btn-secondary"}
                            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: filter === "all" ? "var(--primary)" : "transparent", color: filter === "all" ? "white" : "var(--foreground)", border: "none" }}
                        >전체</button>
                        <button
                            onClick={() => setFilter("present")}
                            className={filter === "present" ? "" : "btn-secondary"}
                            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: filter === "present" ? "var(--success)" : "transparent", color: filter === "present" ? "white" : "var(--foreground)", border: "none" }}
                        >출석</button>
                        <button
                            onClick={() => setFilter("absent")}
                            className={filter === "absent" ? "" : "btn-secondary"}
                            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: filter === "absent" ? "var(--error)" : "transparent", color: filter === "absent" ? "white" : "var(--foreground)", border: "none" }}
                        >미출석</button>
                    </div>
                </div>
            </div>

            <div className="table-container shadow-lg">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>연락처</th>
                            <th>상태 (클릭하여 변경)</th>
                            <th>출석 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ textAlign: "center", padding: "4rem" }}>로딩 중...</td></tr>
                        ) : filteredRecords.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: "center", padding: "4rem" }}>기록이 없습니다.</td></tr>
                        ) : (
                            filteredRecords.map((rec) => (
                                <tr key={rec.id} style={{ opacity: rec.isPresent ? 1 : 0.6 }}>
                                    <td style={{ fontWeight: "700" }}>{rec.name || "-"}</td>
                                    <td style={{ color: "var(--secondary)", fontFamily: "monospace" }}>{rec.phone}</td>
                                    <td>
                                        <span
                                            onClick={() => toggleAttendance(rec.id, rec.isPresent)}
                                            className="badge"
                                            style={{
                                                background: rec.isPresent ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                                color: rec.isPresent ? "var(--success)" : "var(--error)",
                                                cursor: "pointer",
                                                userSelect: "none"
                                            }}
                                        >
                                            {rec.isPresent ? "● 출석 완료" : "○ 미출석"}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--secondary)", fontSize: "0.85rem" }}>
                                        {rec.checkedAt ? new Date(rec.checkedAt).toLocaleTimeString() : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
