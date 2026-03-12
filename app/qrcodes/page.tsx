// app/qrcodes/page.tsx
import { prisma } from "../../lib/prisma";
import PrintButton from "../../components/PrintButton";
import QRCard from "../../components/QRCard";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";

export const dynamic = "force-dynamic";

function chunkArray<T>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export default async function QRCodesPage() {
  const session = await getServerSession(authOptions);

  // ÚJ: superadmin engedélyezése
  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
    redirect("/"); 
  }

  const cars = await prisma.car.findMany({
    orderBy: { startNumber: 'asc' }
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const carChunks = chunkArray(cars, 4);

  return (
    <div className="max-w-6xl mx-auto p-6 py-12 print:p-0 print:m-0">
      <div className="text-center mb-16 print:hidden">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4">
          Carduri pentru Parbriz 🚗
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Printează-le pe toate deodată sau descarcă-le individual ca imagini!
        </p>
        <PrintButton />
      </div>

      {carChunks.map((chunk, pageIndex) => (
        <div 
          key={pageIndex} 
          className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 print:w-[210mm] print:h-[297mm] print:break-after-page print:p-4 mb-16 print:mb-0"
        >
          {chunk.map((car: any) => { 
            const voteUrl = `${baseUrl}/vote/${car.startNumber}`;
            return (
              <QRCard key={car.id} car={car} voteUrl={voteUrl} />
            );
          })}
        </div>
      ))}

      {cars.length === 0 && (
        <div className="text-center text-slate-500 text-xl print:hidden">
          Nu există încă mașini în baza de date.
        </div>
      )}
    </div>
  );
}