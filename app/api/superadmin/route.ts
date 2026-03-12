// app/api/superadmin/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth"; 
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Szigorú védelem: CSAK superadmin kérheti le a listát!
  if (!session || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Nu ai permisiunea!" }, { status: 403 });
  }

  // Lekérjük az összes usert (jelszavakat soha nem tárolunk/kérünk le a NextAuth miatt)
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, image: true },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Szigorú védelem módosításkor is!
  if (!session || (session.user as any)?.role !== "superadmin") {
    return NextResponse.json({ error: "Nu ai permisiunea!" }, { status: 403 });
  }

  const { userId, newRole } = await req.json();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Eroare la actualizarea rolului." }, { status: 500 });
  }
}