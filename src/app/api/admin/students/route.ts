import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const students = await prisma.student.findMany({
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
        console.error("Fetch students error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
