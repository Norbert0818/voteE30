// app/leaderboard/page.tsx
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      votes: {
        include: { car: true }
      }
    }
  });

  const rankings = categories.map((category: any) => {
    const carVoteCounts: Record<number, any> = {};

    category.votes.forEach((vote: any) => {
      const carId = vote.car.id;
      if (!carVoteCounts[carId]) {
        carVoteCounts[carId] = { ...vote.car, voteCount: 0 };
      }
      carVoteCounts[carId].voteCount++;
    });

    const sortedCars = Object.values(carVoteCounts).sort((a: any, b: any) => b.voteCount - a.voteCount);

    return {
      id: category.id,
      name: category.name,
      cars: sortedCars,
    };
  });

 return (
    <div className="max-w-5xl mx-auto p-6 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 text-center">
        🏆 Rezultate Live
      </h1>
      <p className="text-center text-slate-500 mb-12 text-lg">Vezi cine conduce în diferitele categorii!</p>

      <div className="space-y-12">
        {rankings.map((category: any) => (
          <div key={category.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            <div className="bg-slate-800 text-white p-6">
              <h2 className="text-2xl font-bold">{category.name}</h2>
            </div>

            <div className="p-6">
              {category.cars.length === 0 ? (
                <p className="text-slate-500 italic">Încă nu s-au înregistrat voturi în această categorie.</p>
              ) : (
                <div className="space-y-4">
                  {category.cars.map((car: any, index: number) => {
                    let medal = <span className="text-slate-400 font-bold w-8 text-center">{index + 1}.</span>;
                    if (index === 0) medal = <span className="text-3xl" title="Locul 1">🥇</span>;
                    if (index === 1) medal = <span className="text-3xl" title="Locul 2">🥈</span>;
                    if (index === 2) medal = <span className="text-3xl" title="Locul 3">🥉</span>;

                    return (
                      <div key={car.id} className={`flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all gap-2 ${index === 0 ? 'bg-amber-50 border-2 border-amber-200 scale-[1.02] shadow-md' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2 md:gap-4 min-w-0">
                          <div className="w-8 md:w-10 text-center flex justify-center shrink-0">{medal}</div>
                          {car.imageUrl ? (
                            <img src={car.imageUrl} alt={car.name} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-sm shrink-0" />
                          ) : (
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] md:text-xs text-slate-400 shrink-0 text-center">Fără poză</div>
                          )}
                          <div className="min-w-0 break-words">
                            <div className="font-bold text-slate-800 text-sm md:text-lg">
                              {car.name} 
                              <span className="text-slate-400 text-xs md:text-sm ml-1 md:ml-2">#{car.startNumber}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span className="text-2xl md:text-3xl font-black text-blue-600">{car.voteCount}</span>
                          <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">Voturi</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}