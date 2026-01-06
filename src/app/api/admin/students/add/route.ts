import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { name, phone, school, year } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });
        }

        if (phone) {
            const existing = await prisma.student.findUnique({
                where: { phone },
            });

            if (existing) {
                return NextResponse.json({ error: "이미 등록된 연락처입니다." }, { status: 400 });
            }
        }

        const student = await prisma.student.create({
            data: {
                name,
                phone: phone || null,
                school: school || null,
                year: year || null
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error("Add student error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
