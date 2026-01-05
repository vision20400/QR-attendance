import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const totalStudents = await prisma.student.count();
        return NextResponse.json({ totalStudents });
    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
