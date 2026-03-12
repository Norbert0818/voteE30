// app/api/my-car/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

// GET: Lekérjük a bejelentkezett felhasználó autóját
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return NextResponse.json({ error: "Nem vagy belépve" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });

  // Megkeressük az első autót, ami ehhez a userhez tartozik
  const car = await prisma.car.findFirst({ where: { exhibitorId: user.id } });
  
  return NextResponse.json({ car });
}

// PUT: Frissítjük az autó adatait
// app/api/my-car/route.ts (csak a PUT függvényt cseréld)

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return NextResponse.json({ error: "Nem vagy belépve" }, { status: 401 });

  try {
    const body = await req.json();
    
    // 1. KIÍRJUK A TERMINÁLBA, HOGY MIT KAPOTT A SZERVER (Hibakereséshez)
    console.log("Kapott adatok mentéskor:", body);

    const { carId, name, description, galleryImages, imageUrl } = body;

    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: { 
        name, 
        description, 
        imageUrl,
        // 2. A VARÁZSLAT: Határozottan rákényszerítjük az adatbázisra a listát!
        galleryImages: {
          set: galleryImages || [] 
        }
      }
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error("Mentési hiba a Prismában:", error);
    return NextResponse.json({ error: "Hiba a frissítés során" }, { status: 500 });
  }
}