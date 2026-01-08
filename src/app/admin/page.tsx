"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProjectName, setNewProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const resp = await fetch("/api/admin/projects");
            if (resp.status === 401) {
                router.push("/admin/login");
                return;
            }
            const data = await resp.json();
            if (Array.isArray(data)) {
                setProjects(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        try {
            const resp = await fetch("/api/admin/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newProjectName }),
            });
            if (resp.ok) {
                setNewProjectName("");
                fetchProjects();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateProject = async (id: string) => {
        if (!editName.trim()) return;

        try {
            const resp = await fetch(`/api/admin/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName }),
            });
            if (resp.ok) {
                setEditingProjectId(null);
                fetchProjects();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/admin/login");
    };

    if (loading) return <div className="container" style={{ textAlign: "center", padding: "4rem" }}>로딩 중...</div>;

    return (
        <main className="container">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
                <div>
                    <h1 style={{ textAlign: "left", fontSize: "2.5rem", marginBottom: "0.5rem" }}>나의 출석부</h1>
                    <p style={{ textAlign: "left", margin: 0 }}>관리할 출석부를 선택하거나 새로 만듭니다.</p>
                </div>
                <button onClick={handleLogout} className="btn-error">로그아웃</button>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
                {projects.map(p => (
                    <div key={p.id} className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", transition: "transform 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            {editingProjectId === p.id ? (
                                <div style={{ flex: 1, display: "flex", gap: "0.5rem" }}>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={{ fontSize: "1.25rem", fontWeight: "700", padding: "0.4rem", width: "100%" }}
                                        autoFocus
                                    />
                                    <button className="btn-success" style={{ padding: "0.4rem 0.8rem" }} onClick={() => handleUpdateProject(p.id)}>저장</button>
                                    <button className="btn-secondary" style={{ padding: "0.4rem 0.8rem" }} onClick={() => setEditingProjectId(null)}>취소</button>
                                </div>
                            ) : (
                                <>
                                    <div onClick={() => router.push(`/admin/${p.id}/attendance`)} style={{ cursor: "pointer", flex: 1 }}>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "0.5rem" }}>{p.name}</div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>생성일: {new Date(p.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <button
                                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", padding: "0.2rem" }}
                                        onClick={() => { setEditingProjectId(p.id); setEditName(p.name); }}
                                        title="이름 수정"
                                    >
                                        ✏️
                                    </button>
                                </>
                            )}
                        </div>

                        <div style={{ background: "rgba(0,0,0,0.03)", padding: "1rem", borderRadius: "12px", fontSize: "0.85rem" }}>
                            <div style={{ fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.75rem", color: "var(--secondary)" }}>입장용 단축 링크</div>
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/attendance/${p.id}`} style={{ fontSize: "0.75rem", padding: "0.5rem" }} />
                                <button className="btn-secondary" style={{ padding: "0.5rem", fontSize: "0.7rem" }} onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/attendance/${p.id}`);
                                    alert("링크가 복사되었습니다.");
                                }}>복사</button>
                            </div>
                        </div>

                        <button className="btn-primary" style={{ marginTop: "auto" }} onClick={() => router.push(`/admin/${p.id}/attendance`)}>관리하기</button>
                    </div>
                ))}

                <div className="card" style={{ padding: "2rem", border: "2px dashed var(--border)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", background: "transparent" }}>
                    <form onSubmit={handleCreateProject} style={{ width: "100%" }}>
                        <div style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>새 출석부 만들기</div>
                        <input
                            type="text"
                            placeholder="출석부 이름 (예: 청소년부)"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            style={{ marginBottom: "1rem", textAlign: "center" }}
                        />
                        <button type="submit" className="btn-secondary" disabled={isCreating} style={{ width: "100%" }}>
                            {isCreating ? "생성 중..." : "+ 추가하기"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
