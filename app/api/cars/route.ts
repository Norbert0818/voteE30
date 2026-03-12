import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { startNumber, name, description, imageUrl, userEmail } = body;

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user) {
      return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });
    }

    const newCar = await prisma.car.create({
      data: {
        startNumber: parseInt(startNumber),
        name: name,
        description: description,
        imageUrl: imageUrl,
        exhibitorId: user.id,
      }
    });

    return NextResponse.json(newCar, { status: 201 });

  } catch (error) {
    console.error("Hiba az autó mentésekor:", error);
    return NextResponse.json({ error: "Nem sikerült elmenteni az autót. Lehet, hogy ez a rajtszám már foglalt!" }, { status: 500 });
  }
}