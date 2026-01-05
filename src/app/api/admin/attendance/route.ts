import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
        return NextResponse.json({ error: "날짜가 필요합니다." }, { status: 400 });
    }

    try {
        // Fetch all students and join with attendance for this specific date
        const students = await prisma.student.findMany({
            include: {
                attendances: {
                    where: { date },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const records = students.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            isPresent: s.attendances.length > 0,
            checkedAt: s.attendances[0]?.checkedAt || null,
            attendanceId: s.attendances[0]?.id || null,
        }));

        return NextResponse.json(records);
    } catch (error) {
        console.error("Admin attendance fetch error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
