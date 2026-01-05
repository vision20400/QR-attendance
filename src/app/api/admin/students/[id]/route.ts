import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { name } = await request.json();
        const { id } = await params;

        const student = await prisma.student.update({
            where: { id },
            data: { name },
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
