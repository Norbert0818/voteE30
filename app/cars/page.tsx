// app/cars/page.tsx
import { prisma } from "@/lib/prisma";
import CarBrowser from "@/components/CarBrowser";

export const dynamic = "force-dynamic";

export default async function CarsPage() {
  // Lekérjük az összes autót a PostgreSQL-ből
  const cars = await prisma.car.findMany({
    orderBy: { startNumber: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto p-6 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-8 text-center">
        Mașini Expuse
      </h1>

      {cars.length === 0 ? (
        <div className="text-center text-slate-500 text-xl">
          Nu au fost încă încărcate mașini. Fii tu primul!
        </div>
      ) : (
        /* Itt hívjuk be az ÚJ Keresős komponenst, és átadjuk neki az autókat! */
        <CarBrowser cars={cars} />
      )}
    </div>
  );
}