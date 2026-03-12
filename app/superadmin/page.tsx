// app/superadmin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    
    // Biztonsági ellenőrzés: ha nem superadmin, azonnal kidobja a főoldalra
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== "superadmin") {
      router.push("/");
      return;
    }
    
    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    const res = await fetch("/api/superadmin");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    } else {
      toast.error("Nu s-au putut încărca utilizatorii.");
    }
    setIsLoading(false);
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Ești sigur că vrei să acorzi rolul de '${newRole.toUpperCase()}' acestui utilizator?`)) return;

    // Toast betöltés jelző
    const loadingToast = toast.loading("Se actualizează...");

    const res = await fetch("/api/superadmin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole })
    });

    if (res.ok) {
      toast.success("Rolul a fost actualizat cu succes!", { id: loadingToast });
      // Helyben frissítjük a state-et, hogy ne kelljen újra lekérni a szervertől az egészet
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      toast.error("Eroare la actualizare!", { id: loadingToast });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;

  // Keresés (név vagy email alapján)
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center md:text-left">
        👑 Gestionare Utilizatori
      </h1>

      <div className="bg-white p-5 md:p-8 rounded-3xl shadow-lg border-4 border-slate-100">
        
        {/* Fejléc és Keresőmező */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Toți Utilizatorii ({users.length})</h2>
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Căutare nume sau email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-purple-500 font-medium"
            />
          </div>
        </div>

        {/* Felhasználók listája */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredUsers.map(user => {
            // Ellenőrizzük, hogy ez a belépett (saját) profil-e
            const isMe = (session?.user as any)?.email === user.email;

            return (
              <div key={user.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4 transition hover:border-purple-200 hover:shadow-sm">
                
                {/* User Infó */}
                <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
                  <img 
                    src={user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full border border-slate-300 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-grow">
                    <div className="font-bold text-slate-800 text-lg truncate flex items-center gap-2">
                      {user.name || "Fără nume"}
                      {isMe && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Tu</span>}
                    </div>
                    <div className="text-slate-500 text-sm truncate">{user.email}</div>
                  </div>
                </div>

                {/* Jogosultság kezelő */}
                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
                  
                  {/* Jelenlegi jelvény */}
                  <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shrink-0 ${
                    user.role === 'superadmin' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' :
                    user.role === 'admin' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {user.role || 'user'}
                  </span>

                  {/* Legördülő menü a módosításhoz */}
                  <select 
                    value={user.role || "user"}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    disabled={isMe} // Magát nem fokozhatja le
                    title={isMe ? "Nu îți poți schimba propriul rol." : "Schimbă rolul"}
                    className={`bg-white border-2 border-slate-200 rounded-xl p-2.5 text-sm font-bold outline-none cursor-pointer hover:border-slate-300 transition shrink-0 ${isMe ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN </option>
                    <option value="superadmin">SUPERADMIN</option>
                  </select>

                </div>

              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="text-center text-slate-500 py-10 font-bold bg-slate-50 rounded-xl border border-slate-200">
              Niciun utilizator găsit cu acest nume sau email.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}