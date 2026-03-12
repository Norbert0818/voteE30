// app/api/vote/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// --- GET: Adatok lekérése a szavazólaphoz ---
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startNumber = searchParams.get("startNumber");
  const userEmail = searchParams.get("userEmail"); 

  if (!startNumber) return NextResponse.json({ error: "Hiányzó rajtszám" }, { status: 400 });

  try {
    const car = await prisma.car.findUnique({
      where: { startNumber: parseInt(startNumber) }
    });

    if (!car) return NextResponse.json({ error: "Autó nem található" }, { status: 404 });

    const categories = await prisma.category.findMany({
      where: { isActive: true }
    });

    let userVotes: any[] = [];
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (user) {
        // VÁLTOZÁS: Most már lekérjük a carId-t is a kategória mellé!
        userVotes = await prisma.vote.findMany({
          where: { userId: user.id }, 
          select: { categoryId: true, carId: true } 
        });
      }
    }

    const setting = await prisma.setting.findUnique({ where: { id: "global" } });
    const isVotingOpen = setting?.isVotingOpen ?? true;

    return NextResponse.json({ car, categories, userVotes, isVotingOpen });
  } catch (error) {
    return NextResponse.json({ error: "Hiba az adatok lekérésekor" }, { status: 500 });
  }
}

// --- POST: Szavazat leadása ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { carId, categoryId, userEmail } = body;

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "Nem vagy bejelentkezve!" }, { status: 401 });

    const setting = await prisma.setting.findUnique({ where: { id: "global" } });
    if (setting && !setting.isVotingOpen) {
      return NextResponse.json({ error: "A szavazás lezárult, már nem lehet pontot leadni!" }, { status: 403 });
    }
    
    const existingVote = await prisma.vote.findFirst({
      where: { userId: user.id, categoryId: categoryId }
    });

    if (existingVote) {
      return NextResponse.json({ error: "Ebben a kategóriában már szavaztál!" }, { status: 400 });
    }

    const newVote = await prisma.vote.create({
      data: { userId: user.id, carId: carId, categoryId: categoryId }
    });

    return NextResponse.json(newVote, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Hiba történt a szavazás során." }, { status: 500 });
  }
}

// --- DELETE: Szavazat visszavonása (ÚJ FÜGGVÉNY) ---
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { carId, categoryId, userEmail } = body;

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "Nem vagy bejelentkezve!" }, { status: 401 });

    const setting = await prisma.setting.findUnique({ where: { id: "global" } });
    if (setting && !setting.isVotingOpen) {
      return NextResponse.json({ error: "A szavazás lezárult, már nem lehet visszavonni a szavazatot!" }, { status: 403 });
    }

    // Töröljük a konkrét szavazatot az adatbázisból
    await prisma.vote.deleteMany({
      where: { userId: user.id, carId: carId, categoryId: categoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Hiba történt a törlés során." }, { status: 500 });
  }
}