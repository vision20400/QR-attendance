import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await params;
        const { sourceId, targetId } = await request.json();

        if (!sourceId || !targetId) {
            return NextResponse.json({ error: "원본 학생과 대상 학생을 모두 선택해주세요." }, { status: 400 });
        }

        if (sourceId === targetId) {
            return NextResponse.json({ error: "동일한 학생을 병합할 수 없습니다." }, { status: 400 });
        }

        // Check project ownership
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: session.userId }
        });
        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        // Fetch students to ensure they exist in this project
        const [sourceStudent, targetStudent] = await Promise.all([
            prisma.student.findFirst({ where: { id: sourceId, projectId } }),
            prisma.student.findFirst({ where: { id: targetId, projectId } }),
        ]);

        if (!sourceStudent || !targetStudent) {
            return NextResponse.json({ error: "학생 정보를 찾을 수 없습니다." }, { status: 404 });
        }

        // Perform merge in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. Get all attendances from source
            const sourceAttendances = await tx.attendance.findMany({
                where: { studentId: sourceId }
            });

            // 2. Identify and move attendances
            for (const attendance of sourceAttendances) {
                // Check if target already has attendance on this date
                const targetHasAttendance = await tx.attendance.findUnique({
                    where: {
                        studentId_date: {
                            studentId: targetId,
                            date: attendance.date
                        }
                    }
                });

                if (targetHasAttendance) {
                    // Conflict: keep target's record, delete source's (implicitly handled by deleting student later)
                    // Or we can explicitly delete it if we want to be safe, but since it's a unique constraint,
                    // we just don't move this one.
                } else {
                    // Move to target
                    await tx.attendance.update({
                        where: { id: attendance.id },
                        data: { studentId: targetId }
                    });
                }
            }

            // 3. Delete source student
            await tx.student.delete({
                where: { id: sourceId }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Student merge error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
