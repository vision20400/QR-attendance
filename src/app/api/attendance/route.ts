import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { phone, name, date } = await request.json();

        if (!phone || !date) {
            return NextResponse.json({ error: "연락처와 날짜는 필수입니다." }, { status: 400 });
        }

        // Find or create student
        let student = await prisma.student.findUnique({
            where: { phone },
        });

        if (!student) {
            student = await prisma.student.create({
                data: {
                    phone,
                    name: name || null,
                },
            });
        } else if (name && !student.name) {
            // Update name if it was previously empty
            student = await prisma.student.update({
                where: { id: student.id },
                data: { name },
            });
        }

        // Check if already checked in for today
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date,
                },
            },
        });

        if (existingAttendance) {
            return NextResponse.json({ error: "이미 오늘 출석하셨습니다." }, { status: 400 });
        }

        // Create attendance record
        await prisma.attendance.create({
            data: {
                studentId: student.id,
                date,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Attendance error:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
