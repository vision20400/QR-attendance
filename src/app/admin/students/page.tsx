"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatPhoneNumber } from "@/lib/format";

interface Student {
    id: string;
    name: string | null;
    phone: string | null;
    school: string | null;
    year: string | null;
    createdAt: string;
    _count: {
        attendances: number;
    };
}

export default function AdminStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        school: "",
        year: ""
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");

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
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
                console.error("Invalid data format:", data);
                setStudents([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s =>
            (s.name || "").includes(search) ||
            (s.phone || "").includes(search) ||
            (s.school || "").includes(search)
        );
    }, [students, search]);

    const openCreateModal = () => {
        setEditingStudent(null);
        setFormData({ name: "", phone: "", school: "", year: "" });
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name || "",
            phone: student.phone || "",
            school: student.school || "",
            year: student.year || ""
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        const url = editingStudent
            ? `/api/admin/students/${editingStudent.id}`
            : "/api/admin/students/add";
        const method = editingStudent ? "PATCH" : "POST";

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await resp.json();
            if (resp.ok) {
                setIsModalOpen(false);
                fetchStudents();
            } else {
                setFormError(data.error || "처리 실패");
            }
        } catch (err) {
            setFormError("서버 오류");
        } finally {
            setFormLoading(false);
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

    return (
        <main className="container">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ textAlign: "left", fontSize: "2.5rem", marginBottom: "0.5rem" }}>학생 관리</h1>
                    <p style={{ textAlign: "left", margin: 0 }}>전체 학생 정보를 관리하고 출석 현황을 확인하세요.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={() => router.push("/admin/attendance")} className="btn-secondary">
                        📊 출석 현황
                    </button>
                    <button onClick={openCreateModal}>
                        ➕ 학생 추가
                    </button>
                </div>
            </header>

            <div className="glass-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            placeholder="이름, 연락처, 학교로 검색..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: "1.25rem" }}
                        />
                    </div>
                    <div className="badge" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                        총 {filteredStudents.length}명
                    </div>
                </div>
            </div>

            <div className="table-container shadow-lg">
                <table>
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>학교 / 학년</th>
                            <th>연락처</th>
                            <th>가입일</th>
                            <th>출석 횟수</th>
                            <th style={{ textAlign: "right" }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem" }}>로딩 중...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: "center", padding: "4rem" }}>학생 데이터가 없습니다.</td></tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td style={{ fontWeight: "700" }}>{student.name || "-"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <span className="badge" style={{ background: "rgba(0,0,0,0.05)", color: "var(--secondary)" }}>
                                                {student.school || "미지정"}
                                            </span>
                                            <span style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
                                                {student.year ? `${student.year}학년` : ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: "var(--secondary)", fontFamily: "monospace" }}>
                                        {student.phone ? formatPhoneNumber(student.phone) : "-"}
                                    </td>
                                    <td style={{ color: "var(--secondary)", fontSize: "0.85rem" }}>
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: "800", color: "var(--primary)" }}>
                                            {student._count.attendances}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "var(--secondary)", marginLeft: "0.2rem" }}>회</span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                                            <button onClick={() => openEditModal(student)} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>수정</button>
                                            <button onClick={() => handleDelete(student.id)} className="btn-error" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>삭제</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: "1.5rem" }}>{editingStudent ? "학생 정보 수정" : "새 학생 등록"}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: "grid", gap: "1.25rem" }}>
                                <div>
                                    <label>이름 *</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="이름 입력"
                                    />
                                </div>
                                <div>
                                    <label>연락처</label>
                                    <input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                                        placeholder="010-0000-0000"
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label>학교</label>
                                        <input
                                            value={formData.school}
                                            onChange={e => setFormData({ ...formData, school: e.target.value })}
                                            placeholder="학교명"
                                        />
                                    </div>
                                    <div>
                                        <label>학년</label>
                                        <input
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            placeholder="학년"
                                        />
                                    </div>
                                </div>
                                {formError && <div className="message error">{formError}</div>}
                                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>취소</button>
                                    <button type="submit" disabled={formLoading} style={{ flex: 2 }}>
                                        {formLoading ? "저장 중..." : (editingStudent ? "정보 수정" : "학생 등록")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
