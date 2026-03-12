// app/vote/[startNumber]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function VotePage() {
  const { data: session, status } = useSession();
  const params = useParams(); // Kiolvassuk az URL-ből a kocsi számát
  const startNumber = params.startNumber;

  const [car, setCar] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Adatok betöltése, amikor megnyílik az oldal
  useEffect(() => {
    if (status === "loading") return; // Várunk, amíg a session betölt

    const fetchData = async () => {
      const emailQuery = session?.user?.email ? `&userEmail=${session.user.email}` : "";
      const res = await fetch(`/api/vote?startNumber=${startNumber}${emailQuery}`);
      
      if (res.ok) {
        const data = await res.json();
        setCar(data.car);
        setCategories(data.categories);
        setUserVotes(data.userVotes);
        setIsVotingOpen(data.isVotingOpen);
      } else {
        toast.error("Mașina nu a fost găsită!");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [startNumber, session, status]);

  const handleVote = async (categoryId: string, isRemoving: boolean) => {
    if (!session || !isVotingOpen) return;

    // Ha törlünk, DELETE kérést küldünk, ha szavazunk, akkor POST-ot
    const method = isRemoving ? "DELETE" : "POST";

    const res = await fetch("/api/vote", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId: car.id,
        categoryId,
        userEmail: session.user?.email
      })
    });

    if (res.ok) {
      // Ha sikeres volt, azonnal frissítjük a gombokat a képernyőn
      if (isRemoving) {
        // Törlés esetén kivesszük a listából
        setUserVotes((prev) => prev.filter((v) => v.categoryId !== categoryId));
        toast.success("Vot anulat!");
      } else {
        // Szavazás esetén betesszük a listába az autó azonosítójával együtt
        setUserVotes((prev) => [...prev, { categoryId, carId: car.id }]);
        toast.success("Vot înregistrat cu succes! 🏆");
      }
    } else {
      const data = await res.json();
      toast.error(data.error || "A apărut o eroare!");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;
  if (!car) return <div className="p-8 text-center text-xl text-red-500 font-bold">Nu există nicio mașină cu acest număr!</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Autó képe a Cloudinary-ből */}
        {(() => {
          // Összefűzzük a főképet és a galéria képeit egyetlen listába (kiszűrve az üreseket)
          const allImages = [car.imageUrl, ...(car.galleryImages || [])].filter(Boolean);

          if (allImages.length === 0) {
            return (
              <div className="w-full h-64 md:h-80 bg-slate-300 flex items-center justify-center text-slate-500 font-bold">
                Nicio imagine încărcată
              </div>
            );
          }

          return (
            <div className="relative w-full h-72 md:h-80 bg-slate-900 group">
              <img 
                src={allImages[currentImgIndex]} 
                alt={`${car.name} - imaginea ${currentImgIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              {/* Lapozó gombok (csak ha több mint 1 kép van) */}
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-lg text-xl pb-1"
                  >
                    &#8592;
                  </button>
                  <button 
                    onClick={() => setCurrentImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition shadow-lg text-xl pb-1"
                  >
                    &#8594;
                  </button>
                  
                  {/* Pöttyök a kép alján */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {allImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`transition-all duration-300 rounded-full ${
                          idx === currentImgIndex 
                            ? 'w-3 h-3 bg-white scale-110 shadow-sm' 
                            : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80 cursor-pointer'
                        }`}
                        onClick={() => setCurrentImgIndex(idx)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Autó adatai */}
        <div className="p-6 text-center">
          <div className="inline-block bg-slate-800 text-white text-3xl font-black px-6 py-2 rounded-xl mb-4 shadow-lg transform -translate-y-12 border-4 border-white">
            #{car.startNumber}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 -mt-6 mb-2">{car.name}</h1>
          <p className="text-slate-500 mb-8">{car.description}</p>

          <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Evaluare</h3>

          {/* Szavazó gombok */}
          {!isVotingOpen && (
            <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold mb-6">
              🛑 Votarea s-a încheiat oficial! Rezultatele vor fi anunțate în curând.
            </div>
          )}
          
          <div className="space-y-4">
            {categories.map((category) => {
              // 1. Megnézzük, szavazott-e EGYÁLTALÁN ebbe a kategóriába
              const existingVote = userVotes.find((v) => v.categoryId === category.id);
              
              const hasVotedAtAll = !!existingVote; // Igaz, ha létezik szavazat
              // 2. Megnézzük, hogy PONTOSAN ERRE az autóra szavazott-e
              const hasVotedForThisCar = existingVote?.carId === car.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleVote(category.id, hasVotedForThisCar)}
                  disabled={(!hasVotedForThisCar && hasVotedAtAll) || !session || !isVotingOpen}
                  
                  // ÚJ: text-sm mobilon, text-lg asztalin. Flex gap hozzáadva.
                  className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-2xl font-bold text-sm md:text-lg transition-all flex justify-between items-center gap-2 shadow-md active:scale-95 ...`}
                >
                  {/* ÚJ: Szöveg igazítás, hogy balra dőljön a kategória, jobbra az ikon/szöveg */}
                  <span className="text-left leading-tight">{category.name}</span>
                  <span className="text-right whitespace-nowrap shrink-0">
                    {hasVotedForThisCar 
                      ? "Șterge ❌" // Ezt is picit rövidítettem, hogy mobilon biztos kiférjen
                      : hasVotedAtAll 
                      ? "Votat 🔒" 
                      : (!session || !isVotingOpen) 
                      ? "🔒" 
                      : "Votez +1"}
                  </span>
                </button>
              );
            })}
          </div>

          {!session && (
            <p className="mt-6 text-red-500 font-semibold text-sm">Pentru a vota, autentifică-te pe pagina principală!</p>
          )}

        </div>
      </div>
    </div>
  );
}