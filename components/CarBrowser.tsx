// components/CarBrowser.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function CarBrowser({ cars }: { cars: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Azonnali szűrés (Név vagy Rajtszám alapján)
  const filteredCars = cars.filter((car) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      car.name.toLowerCase().includes(searchLower) ||
      String(car.startNumber).includes(searchTerm)
    );
  });

  return (
    <div>
      {/* 1. Keresőmező */}
      <div className="max-w-xl mx-auto mb-8 md:mb-10">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl">🔍</span>
          <input
            type="text"
            placeholder="Keresés rajtszám vagy név alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // ÚJ: Mobilon kicsit vékonyabb a mező (py-3), asztalin marad a vastagabb (md:py-4)
            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border-4 border-slate-200 focus:border-blue-500 outline-none text-base md:text-lg font-bold text-slate-700 shadow-sm transition"
          />
        </div>
      </div>

      {/* 2. Autók listája */}
      {filteredCars.length === 0 ? (
        // ÚJ: Mobilon kisebb padding a hibaüzenetnek
        <div className="text-center text-slate-500 text-lg md:text-xl font-bold bg-white p-6 md:p-8 rounded-3xl shadow-sm">
          Nu există nicio mașină care să corespundă căutării. 😢
        </div>
      ) : (
        // ÚJ: Mobilon kisebb rés a kártyák között (gap-4)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredCars.map(car => (
            <Link 
              href={`/vote/${car.startNumber}`} 
              key={car.id} 
              className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group active:scale-[0.98] cursor-pointer"
            >
              {/* Kép */}
              {/* ÚJ: Mobilon picit alacsonyabb kép (h-56), hogy több kártya is kiférjen görgetésnél */}
              <div className="h-56 md:h-64 relative bg-slate-200">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">Nincs kép</div>
                )}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-slate-900 text-white font-black px-3 py-1 md:px-4 md:py-2 rounded-xl text-lg md:text-xl shadow-lg border-2 border-white">
                  #{car.startNumber}
                </div>
              </div>

              {/* Autó adatai és Gomb */}
              {/* ÚJ: Mobilon kisebb belső padding (p-4), asztalin marad (p-6) */}
              <div className="p-4 md:p-6 flex-grow flex flex-col">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{car.name}</h2>
                <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 flex-grow line-clamp-3">{car.description}</p>
                
                <div className="block w-full text-center bg-blue-600 text-white font-bold py-3 md:py-4 rounded-xl group-hover:bg-blue-700 transition shadow-md">
                  Votez! 🏆
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}