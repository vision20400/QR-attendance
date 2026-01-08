import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const { name, phone } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
        }

        const today = new Date().toISOString().split("T")[0];

        // Find student in this project
        let student;
        if (phone) {
            student = await prisma.student.findUnique({
                where: { projectId_phone: { projectId, phone } },
            });
        } else {
            // If only name is provided, find the unique student with that name in this project
            const students = await prisma.student.findMany({
                where: { projectId, name },
            });

            if (students.length === 0) {
                return NextResponse.json({ error: "등록되지 않은 학생입니다. 휴대폰 번호와 함께 입력해주세요." }, { status: 404 });
            }

            if (students.length > 1) {
                return NextResponse.json({ error: "동명이인이 있습니다. 휴대폰 번호를 함께 입력해주세요." }, { status: 400 });
            }

            student = students[0];
        }

        if (!student) {
            return NextResponse.json({ error: "등록되지 않은 정보입니다." }, { status: 404 });
        }

        // Mark attendance
        await prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: today,
                },
            },
            update: {}, // Already checked in
            create: {
                studentId: student.id,
                date: today,
            },
        });

        return NextResponse.json({ success: true, name: student.name });
    } catch (error) {
        console.error("Attendance check error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
