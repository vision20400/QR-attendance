import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;

    // Check project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.userId }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    try {
        const students = await prisma.student.findMany({
            where: { projectId },
            include: {
                _count: {
                    select: { attendances: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return NextResponse.json(students);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
