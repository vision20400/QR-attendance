import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { name, phone, school, year } = await request.json();
        const { id } = await params;

        // Check if phone is being updated and if it's already in use
        if (phone) {
            const existing = await prisma.student.findFirst({
                where: {
                    phone,
                    NOT: { id },
                },
            });

            if (existing) {
                return NextResponse.json({ error: "이미 사용 중인 연락처입니다." }, { status: 400 });
            }
        }

        const student = await prisma.student.update({
            where: { id },
            data: {
                name,
                phone: phone || null,
                school: school || null,
                year: year || null
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Delete related attendances first (or let DB handle cascade if configured)
        // With current schema, we should delete them explicitly or rely on referential integrity
        await prisma.attendance.deleteMany({
            where: { studentId: id },
        });

        await prisma.student.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete student error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
