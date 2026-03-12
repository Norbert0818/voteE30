// app/api/admin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // ÚJ: superadmin engedélyezése
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
  }

  const cars = await prisma.car.findMany({ orderBy: { startNumber: 'asc' } });
  const categories = await prisma.category.findMany();
  const setting = await prisma.setting.findUnique({ where: { id: "global" } });

  return NextResponse.json({ cars, categories, isVotingOpen: setting ? setting.isVotingOpen : true });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // ÚJ: superadmin engedélyezése
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    return NextResponse.json({ error: "Jogosulatlan" }, { status: 403 });
  }

  const { action, payload } = await req.json();

  try {
    if (action === "ADD_CATEGORY") {
      const newCat = await prisma.category.create({ data: { name: payload.name, isActive: true } });
      return NextResponse.json(newCat);
    }
    if (action === "DELETE_CATEGORY") {
      await prisma.vote.deleteMany({ where: { categoryId: payload.id } }); // Töröljük a hozzá tartozó szavazatokat
      await prisma.category.delete({ where: { id: payload.id } }); // Majd magát a kategóriát
      return NextResponse.json({ success: true });
    }
    if (action === "DELETE_CAR") {
      await prisma.vote.deleteMany({ where: { carId: payload.id } });
      await prisma.car.delete({ where: { id: payload.id } });
      return NextResponse.json({ success: true });
    }
    if (action === "TOGGLE_VOTING") {
      const setting = await prisma.setting.upsert({
        where: { id: "global" },
        update: { isVotingOpen: payload.isOpen },
        create: { id: "global", isVotingOpen: payload.isOpen }
      });
      return NextResponse.json(setting);
    }
    return NextResponse.json({ error: "Ismeretlen művelet" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Szerver hiba" }, { status: 500 });
  }
}