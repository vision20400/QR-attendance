import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { name, phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: "연락처는 필수입니다." }, { status: 400 });
        }

        const existing = await prisma.student.findUnique({
            where: { phone },
        });

        if (existing) {
            return NextResponse.json({ error: "이미 등록된 연락처입니다." }, { status: 400 });
        }

        const student = await prisma.student.create({
            data: { name, phone },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error("Add student error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
