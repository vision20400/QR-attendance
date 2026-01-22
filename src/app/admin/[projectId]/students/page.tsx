"use client";

import { useEffect, useState, useMemo, use } from "react";
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

export default function AdminStudentsPage({ params }: { params: Promise<{ projectId: string }> }) {
    const router = useRouter();
    const { projectId } = use(params);
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

    // Merge state
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [sourceStudent, setSourceStudent] = useState<Student | null>(null);
    const [targetStudent, setTargetStudent] = useState<Student | null>(null);
    const [mergeLoading, setMergeLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [projectId]);

    const handleMerge = async () => {
        if (!sourceStudent || !targetStudent) return;
        if (!confirm(`${sourceStudent.name}님의 모든 출석 기록을 ${targetStudent.name}님에게 옮기고 ${sourceStudent.name}님을 삭제하시겠습니까?`)) return;

        setMergeLoading(true);
        try {
            const resp = await fetch(`/api/admin/${projectId}/students/merge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceId: sourceStudent.id, targetId: targetStudent.id }),
            });
            if (resp.ok) {
                alert("병합이 완료되었습니다.");
                setIsMergeMode(false);
                setSourceStudent(null);
                setTargetStudent(null);
                fetchStudents();
            } else {
                const data = await resp.json();
                alert(data.error || "병합 실패");
            }
        } catch (err) {
            alert("서버 오류");
        } finally {
            setMergeLoading(false);
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`/api/admin/${projectId}/students`);
            if (resp.status === 401) {
                router.push("/admin/login");
                return;
            }
            const data = await resp.json();
            if (Array.isArray(data)) {
                setStudents(data);
            } else {
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

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        const url = editingStudent
            ? `/api/admin/${projectId}/students/${editingStudent.id}`
            : `/api/admin/${projectId}/students/add`;
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
        if (!confirm("정말 이 학생을 삭제하시겠습니까? (관련 출석 데이터 포함)")) return;
        try {
            const resp = await fetch(`/api/admin/${projectId}/students/${id}`, {
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
                    <p style={{ textAlign: "left", margin: 0 }}>전체 학생 정보를 관리합니다.</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={() => { setIsMergeMode(!isMergeMode); setSourceStudent(null); setTargetStudent(null); }} className={`btn-${isMergeMode ? 'primary' : 'secondary'}`}>
                        {isMergeMode ? '⚡ 병합 취소' : '⚡ 학생 병합'}
                    </button>
                    <button onClick={() => router.push(`/admin/${projectId}/attendance`)} className="btn-secondary">📊 출석 현황</button>
                    <button onClick={() => router.push("/admin")} className="btn-secondary">📂 프로젝트 전환</button>
                    <button onClick={() => { setEditingStudent(null); setFormData({ name: "", phone: "", school: "", year: "" }); setIsModalOpen(true); }}>➕ 학생 추가</button>
                </div>
            </header>

            {isMergeMode && (
                <div className="glass-card shadow-lg" style={{ marginBottom: "2rem", padding: "1.5rem", border: "2px solid var(--primary)", background: "rgba(var(--primary-rgb), 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.85rem", color: "var(--secondary)", display: "block", marginBottom: "0.25rem" }}>원본 학생 (삭제됨)</span>
                                <div style={{ fontWeight: "800", fontSize: "1.1rem" }}>{sourceStudent ? sourceStudent.name : <span style={{ color: "var(--border)" }}>선택해주세요</span>}</div>
                            </div>
                            <div style={{ fontSize: "1.5rem" }}>➔</div>
                            <div>
                                <span style={{ fontSize: "0.85rem", color: "var(--secondary)", display: "block", marginBottom: "0.25rem" }}>대상 학생 (유지됨)</span>
                                <div style={{ fontWeight: "800", fontSize: "1.1rem" }}>{targetStudent ? targetStudent.name : <span style={{ color: "var(--border)" }}>선택해주세요</span>}</div>
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            disabled={!sourceStudent || !targetStudent || mergeLoading}
                            onClick={handleMerge}
                        >
                            {mergeLoading ? '처리 중...' : '병합 실행하기'}
                        </button>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--secondary)", marginTop: "1rem" }}>
                        * 원본 학생의 모든 출석 기록이 대상 학생에게 병합됩니다. 병합 후 원본 학생은 <strong>영구적으로 삭제</strong>됩니다.
                    </p>
                </div>
            )}

            <div className="glass-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
                <input placeholder="이름, 연락처, 학교 검색..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="table-container shadow-lg">
                <table>
                    <thead>
                        <tr>
                            {isMergeMode && <th style={{ width: "160px" }}>병합 선택</th>}
                            <th>이름</th>
                            <th>학교 / 학년</th>
                            <th>연락처</th>
                            <th>출석 횟수</th>
                            <th style={{ textAlign: "right" }}>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: "center", padding: "4rem" }}>로딩 중...</td></tr>
                        ) : filteredStudents.map((student) => (
                            <tr key={student.id} style={{
                                background: sourceStudent?.id === student.id ? 'rgba(var(--error-rgb), 0.05)' :
                                    targetStudent?.id === student.id ? 'rgba(var(--success-rgb), 0.05)' : ''
                            }}>
                                {isMergeMode && (
                                    <td style={{ width: "160px" }}>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                className={`btn-${sourceStudent?.id === student.id ? 'error' : 'secondary'}`}
                                                style={{ fontSize: "0.7rem", padding: "0.3rem 0.5rem", flex: 1 }}
                                                onClick={() => {
                                                    if (targetStudent?.id === student.id) setTargetStudent(null);
                                                    setSourceStudent(sourceStudent?.id === student.id ? null : student);
                                                }}
                                            >
                                                원본
                                            </button>
                                            <button
                                                className={`btn-${targetStudent?.id === student.id ? 'success' : 'secondary'}`}
                                                style={{ fontSize: "0.7rem", padding: "0.3rem 0.5rem", flex: 1 }}
                                                onClick={() => {
                                                    if (sourceStudent?.id === student.id) setSourceStudent(null);
                                                    setTargetStudent(targetStudent?.id === student.id ? null : student);
                                                }}
                                            >
                                                대상
                                            </button>
                                        </div>
                                    </td>
                                )}
                                <td style={{ fontWeight: "700" }}>{student.name}</td>
                                <td>{student.school || "-"} {student.year ? `${student.year}학년` : ""}</td>
                                <td style={{ fontFamily: "monospace" }}>{student.phone ? formatPhoneNumber(student.phone) : "-"}</td>
                                <td>{student._count.attendances}회</td>
                                <td style={{ textAlign: "right" }}>
                                    {!isMergeMode && (
                                        <>
                                            <button onClick={() => { setEditingStudent(student); setFormData({ name: student.name || "", phone: student.phone || "", school: student.school || "", year: student.year || "" }); setIsModalOpen(true); }} className="btn-secondary" style={{ marginRight: "0.5rem" }}>수정</button>
                                            <button onClick={() => handleDelete(student.id)} className="btn-error">삭제</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: "1.5rem" }}>{editingStudent ? "학생 정보 수정" : "새 학생 등록"}</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div style={{ display: "grid", gap: "1.25rem" }}>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="이름 *" />
                                <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })} placeholder="연락처" />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <input value={formData.school} onChange={e => setFormData({ ...formData, school: e.target.value })} placeholder="학교" />
                                    <input value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="학년" />
                                </div>
                                {formError && <div className="message error">{formError}</div>}
                                <button type="submit" disabled={formLoading}>{formLoading ? "저장 중..." : "저장하기"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
