import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const projects = await prisma.project.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });

        const project = await prisma.project.create({
            data: {
                name,
                userId: session.userId
            }
        });
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
