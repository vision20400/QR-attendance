import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { name } = await request.json();

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "프로젝트 이름을 입력해주세요." }, { status: 400 });
        }

        // Verify ownership
        const project = await prisma.project.findFirst({
            where: { id, userId: session.userId }
        });

        if (!project) {
            return NextResponse.json({ error: "프로젝트를 찾을 수 없거나 권한이 없습니다." }, { status: 404 });
        }

        const updated = await prisma.project.update({
            where: { id },
            data: { name: name.trim() }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Project update error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
