import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string, id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, id } = await params;

    // Check project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.userId }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    try {
        const { name, phone, school, year } = await request.json();

        if (phone) {
            const existing = await prisma.student.findUnique({
                where: { projectId_phone: { projectId, phone } },
            });

            if (existing && existing.id !== id) {
                return NextResponse.json({ error: "이미 등록된 연락처입니다." }, { status: 400 });
            }
        }

        const student = await prisma.student.update({
            where: { id, projectId }, // Scope by both
            data: {
                name,
                phone: phone || null,
                school: school || null,
                year: year || null
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error("Update student error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ projectId: string, id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, id } = await params;

    // Check project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.userId }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    try {
        await prisma.student.delete({
            where: { id, projectId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete student error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
