import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;

    // Check project ownership
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.userId }
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    try {
        const { studentId, date, isPresent } = await request.json();

        if (!studentId || !date) {
            return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
        }

        // Ensure student belongs to this project
        const student = await prisma.student.findFirst({
            where: { id: studentId, projectId }
        });
        if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

        if (isPresent) {
            await prisma.attendance.upsert({
                where: {
                    studentId_date: { studentId, date }
                },
                update: {},
                create: {
                    studentId,
                    date,
                }
            });
        } else {
            try {
                await prisma.attendance.delete({
                    where: {
                        studentId_date: { studentId, date }
                    }
                });
            } catch (e) {
                // Ignore if record doesn't exist
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Toggle attendance error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
