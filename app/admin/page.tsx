// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [cars, setCars] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminSearch, setAdminSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    const userRole = (session?.user as any)?.role;
    
    if (!session || (userRole !== "admin" && userRole !== "superadmin")) {
      router.push("/"); 
      return; 
    }
    
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    const res = await fetch("/api/admin");
    if (res.ok) {
      const data = await res.json();
      setCars(data.cars);
      setCategories(data.categories);
      setIsVotingOpen(data.isVotingOpen);
    }
    setIsLoading(false);
  };

  const adminAction = async (action: string, payload: any) => {
    if (!confirm("Sigur dorești să execuți această acțiune?")) return;

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload })
    });

    if (res.ok) {
      fetchData(); // Újratöltjük a képernyőt
      if (action === "ADD_CATEGORY") setNewCategoryName("");
    } else {
      toast.error("A apărut o eroare în timpul operațiunii!");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;

  return (
    // ÚJ: paddingok optimalizálása mobilon (p-4)
    <div className="max-w-6xl mx-auto p-4 md:p-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center md:text-left">
        🛠️ Panou de Control
      </h1>

      {/* ÚJ: Kisebb gap mobilon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        
        {/* 1. Mesterkapcsoló */}
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border-4 border-slate-100 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Stare Votare</h2>
          <p className="text-slate-500 mb-6 text-sm md:text-base">Dacă o închizi, butoanele de vot vor dispărea pentru toată lumea.</p>
          
          <button 
            onClick={() => adminAction("TOGGLE_VOTING", { isOpen: !isVotingOpen })}
            // ÚJ: text-xl mobilon, hogy kiférjen
            className={`text-xl md:text-2xl font-black px-6 py-5 md:py-6 rounded-2xl text-white transition-all shadow-xl active:scale-95 w-full ${
              isVotingOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isVotingOpen ? "🛑 ÎNCHIDE" : "✅ DESCHIDE"}
          </button>
        </div>

        {/* 2. Kategóriák */}
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border-4 border-slate-100 flex flex-col">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Gestionare Categorii</h2>
          
          {/* ================= JAVÍTOTT RÉSZ ================= */}
          {/* ÚJ: flex-col mobilon (egymás alatt), sm:flex-row (egymás mellett) */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full">
            <input 
              type="text" 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nume categorie nouă..." 
              // ÚJ: w-full és min-w-0, hogy okosan vegye fel a szélességet
              className="w-full min-w-0 border-2 border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500"
            />
            <button 
              onClick={() => adminAction("ADD_CATEGORY", { name: newCategoryName })}
              // ÚJ: shrink-0 (ne nyomódjon össze), w-full mobilon, w-auto asztalin
              className="w-full sm:w-auto bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 shrink-0 shadow-sm"
            >
              Adăugare
            </button>
          </div>
          {/* =================================================== */}

          <div className="space-y-3 max-h-48 overflow-y-auto pr-2 flex-grow">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
                {/* ÚJ: break-words, ha nagyon hosszú a kategória neve */}
                <span className="font-bold text-slate-700 break-words min-w-0 leading-tight">{cat.name}</span>
                <button 
                  onClick={() => adminAction("DELETE_CATEGORY", { id: cat.id })}
                  className="text-red-500 bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 text-sm font-bold shrink-0"
                >
                  Ștergere
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Autók Moderálása */}
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border-4 border-slate-100 md:col-span-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold">Moderare Mașini</h2>
            
            {/* Admin Keresőmező */}
            <input 
              type="text" 
              placeholder="🔍 Căutare..." 
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              // ÚJ: w-full mobilon
              className="border-2 border-slate-200 rounded-xl p-3 px-4 outline-none focus:border-blue-500 w-full md:w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cars.filter(car => 
              car.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
              String(car.startNumber).includes(adminSearch)
            ).map(car => (
              <div key={car.id} className="flex items-center gap-3 bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-200 min-w-0">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={car.name} className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-200 rounded-lg shrink-0"></div>
                )}
                <div className="min-w-0">
                  <div className="font-black text-slate-800">#{car.startNumber}</div>
                  <div className="font-bold text-slate-600 line-clamp-1 text-sm md:text-base">{car.name}</div>
                  <button 
                    onClick={() => adminAction("DELETE_CAR", { id: car.id })}
                    className="mt-1 text-red-500 text-xs md:text-sm font-bold hover:underline"
                  >
                    🗑️ Ștergere
                  </button>
                </div>
              </div>
            ))}
            
            {cars.length > 0 && cars.filter(car => 
              car.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
              String(car.startNumber).includes(adminSearch)
            ).length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-4 font-bold">
                Niciun rezultat pentru această căutare.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}