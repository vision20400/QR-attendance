import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: session.userId },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
