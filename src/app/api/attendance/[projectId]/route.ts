import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true }
        });

        if (!project) {
            return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const { name, phone } = await request.json();
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get("date");

        if (!name) {
            return NextResponse.json({ error: "이름을 입력해주세요." }, { status: 400 });
        }

        const today = new Date().toISOString().split("T")[0];
        const date = dateParam || today;

        // Find or create student in this project
        let student;
        if (phone) {
            student = await prisma.student.findUnique({
                where: { projectId_phone: { projectId, phone } },
            });

            if (!student) {
                // Create new student with name and phone
                student = await prisma.student.create({
                    data: {
                        projectId,
                        name,
                        phone
                    }
                });
            }
        } else {
            // If only name is provided, find the unique student with that name in this project
            const students = await prisma.student.findMany({
                where: { projectId, name },
            });

            if (students.length === 0) {
                // Create new student with just name
                student = await prisma.student.create({
                    data: {
                        projectId,
                        name
                    }
                });
            } else if (students.length > 1) {
                return NextResponse.json({ error: "동명이인이 있습니다. 휴대폰 번호를 함께 입력해주세요." }, { status: 400 });
            } else {
                student = students[0];
            }
        }

        // Check if already checked in
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: date,
                },
            },
        });

        if (existingAttendance) {
            return NextResponse.json({ success: true, name: student.name, alreadyCheckedIn: true });
        }

        // Mark attendance
        await prisma.attendance.create({
            data: {
                studentId: student.id,
                date: date,
            },
        });

        return NextResponse.json({ success: true, name: student.name });
    } catch (error) {
        console.error("Attendance check error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
