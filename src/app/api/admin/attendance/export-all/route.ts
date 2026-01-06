import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            select: {
                name: true,
                phone: true,
                school: true,
                year: true,
                attendances: {
                    select: {
                        date: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        // Flatten attendances to array of strings for easier processing
        const formattedData = students.map((s: any) => ({
            ...s,
            attendances: s.attendances.map((a: any) => a.date)
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Export all error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
