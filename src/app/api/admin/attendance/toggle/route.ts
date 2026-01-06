import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { studentId, date, isPresent } = await request.json();

        if (!studentId || !date) {
            return NextResponse.json({ error: "필수 데이터가 누락되었습니다." }, { status: 400 });
        }

        if (isPresent) {
            // Mark as present: Create record if not exists
            await prisma.attendance.upsert({
                where: {
                    studentId_date: { studentId, date }
                },
                update: {}, // Do nothing if already exists
                create: {
                    studentId,
                    date,
                }
            });
        } else {
            // Mark as absent: Delete record if exists
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
