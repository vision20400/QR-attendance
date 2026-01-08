import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!date) {
        return NextResponse.json({ error: "날짜를 입력해주세요." }, { status: 400 });
    }

    // Check project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.userId }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    try {
        const students = await prisma.student.findMany({
            where: { projectId },
            include: {
                attendances: {
                    where: { date },
                },
            },
            orderBy: { name: "asc" },
        });

        const records = students.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            isPresent: s.attendances.length > 0,
            checkedAt: s.attendances[0]?.checkedAt || null,
            attendanceId: s.attendances[0]?.id || null,
        }));

        return NextResponse.json(records);
    } catch (error) {
        console.error("Fetch attendance error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
