"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneNumber } from "@/lib/format";

interface Student {
    id: string;
    name: string | null;
    phone: string;
    createdAt: string;
    _count: {
        attendances: number;
    };
}

export default function AdminStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState("");

    useEffect(() => {
        const auth = localStorage.getItem("admin_auth");
        if (auth !== "true") {
            router.push("/admin/login");
            return;
        }
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/admin/students");
            const data = await resp.json();
            setStudents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (student: Student) => {
        setEditingId(student.id);
        setEditName(student.name || "");
    };

    const saveEdit = async (id: string) => {
        try {
            const resp = await fetch(`/api/admin/students/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName }),
            });
            if (resp.ok) {
                setEditingId(null);
                fetchStudents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 이 학생을 삭제하시겠습니까? 관련 출석 데이터도 모두 삭제됩니다.")) return;
        try {
            const resp = await fetch(`/api/admin/students/${id}`, {
                method: "DELETE",
            });
            if (resp.ok) {
                fetchStudents();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError("");
        try {
            const resp = await fetch("/api/admin/students/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, phone: newPhone }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setNewName("");
                setNewPhone("");
                fetchStudents();
            } else {
                setAddError(data.error || "추가 실패");
            }
        } catch (err) {
            setAddError("서버 오류");
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <main className="container" style={{ justifyContent: "flex-start", paddingTop: "4rem" }}>
            <div className="card" style={{ maxWidth: "800px", marginBottom: "2rem", padding: "2rem" }}>
                <h2 style={{ marginBottom: "1.5rem", textAlign: "left" }}>학생 추가</h2>
                <form onSubmit={handleAddStudent} style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ flex: "1 1 200px" }}>
                        <input
                            placeholder="이름"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ flex: "1 1 200px" }}>
                        <input
                            placeholder="연락처 (010-0000-0000)"
                            value={newPhone}
                            onChange={(e) => setNewPhone(formatPhoneNumber(e.target.value))}
                            required
                        />
                    </div>
                    <button type="submit" disabled={addLoading} style={{ flex: "0 0 auto", minWidth: "120px" }}>
                        {addLoading ? "추가 중..." : "학생 추가"}
                    </button>
                </form>
                {addError && <div className="message error" style={{ marginTop: "1rem" }}>{addError}</div>}
            </div>

            <div className="card" style={{ maxWidth: "800px", padding: "2rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                    <h1 style={{ textAlign: "left", margin: 0 }}>번영로 청소년부 학생 관리</h1>
                    <button onClick={() => router.push("/admin/attendance")} className="btn-secondary">출석 현황으로</button>
                </div>

                <div className="table-container" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                                <th style={{ padding: "1rem" }}>이름</th>
                                <th style={{ padding: "1rem" }}>연락처</th>
                                <th style={{ padding: "1rem" }}>가입일</th>
                                <th style={{ padding: "1rem" }}>총 출석</th>
                                <th style={{ padding: "1rem" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>로딩 중...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>학생 데이터가 없습니다.</td></tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            {editingId === student.id ? (
                                                <input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    style={{ padding: "0.4rem", width: "120px" }}
                                                />
                                            ) : (
                                                student.name || "-"
                                            )}
                                        </td>
                                        <td style={{ padding: "0.75rem 1rem" }}>{student.phone}</td>
                                        <td style={{ padding: "0.75rem 1rem", color: "var(--secondary)", fontSize: "0.875rem" }}>
                                            {new Date(student.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{student._count.attendances}회</td>
                                        <td style={{ padding: "0.75rem 1rem" }}>
                                            {editingId === student.id ? (
                                                <button onClick={() => saveEdit(student.id)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem" }}>저장</button>
                                            ) : (
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => startEdit(student)} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem" }}>수정</button>
                                                    <button onClick={() => handleDelete(student.id)} className="btn-error" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem" }}>삭제</button>
                                                </div>
                                            )}
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
