// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = (session?.user as any)?.role;
  // JAVÍTVA: Az isAdmin most már true, ha admin VAGY superadmin
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  // ÚJ: Külön változó a superadminnak
  const isSuperAdmin = userRole === "superadmin";

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg print:hidden" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="text-2xl font-black tracking-tighter text-blue-500 flex items-center gap-2">
            <span className="text-3xl">🏁</span> E30
          </Link>

          {/* ========================================== */}
          {/* ASZTALI NÉZET (Csak nagyobb képernyőn) */}
          {/* ========================================== */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* 1. Publikus gombok (MINDENKINEK látszik) */}
            <Link href="/cars" className="font-bold text-slate-300 hover:text-white transition">Mașini</Link>
            <Link href="/exhibitor" className="font-bold text-slate-300 hover:text-white transition">Înscriere</Link>

            {/* 2. Felhasználói gombok (CSAK BELÉPVE) */}
            {session && (
              <Link href="/my-car" className="font-bold text-emerald-400 hover:text-emerald-300 transition border-l border-slate-700 pl-6">
                Mașina Mea 🚘
              </Link>
            )}

            {/* SuperAdmin gomb asztali nézetben */}
            {isSuperAdmin && (
               <div className="flex items-center border-l border-slate-700 pl-6">
                 <Link href="/superadmin" className="font-bold text-purple-400 hover:text-purple-300 transition bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-500/30 shadow-sm">
                   👑 SuperAdmin
                 </Link>
               </div>
            )}

            {/* 3. Admin gombok (CSAK ADMINNAK) */}
            {isAdmin && (
              <div className="flex items-center space-x-4 border-l border-slate-700 pl-6">
                <Link href="/leaderboard" className="font-bold text-amber-400 hover:text-amber-300 transition">Rezultate</Link>
                <Link href="/qrcodes" className="font-bold text-amber-400 hover:text-amber-300 transition">Coduri QR</Link>
                <Link href="/admin" className="font-bold text-red-400 hover:text-red-300 transition">Panou Control</Link>
              </div>
            )}

            {/* 4. Profil & Belépés */}
            {session ? (
              <div className="flex items-center gap-3 pl-6 border-l border-slate-700 ml-2">
                <img src={session.user?.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-blue-500" />
                <button 
                  onClick={() => signOut()} 
                  className="bg-red-500/10 text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition text-sm font-bold"
                >
                  Ieșire
                </button>
              </div>
            ) : (
              <div className="pl-6 border-l border-slate-700 ml-2">
                <button 
                  onClick={() => signIn("google")} 
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition shadow-lg shadow-blue-600/20"
                >
                  Autentificare
                </button>
              </div>
            )}
          </div>

          {/* ========================================== */}
          {/* HAMBURGER GOMB (Csak mobilon látszik)      */}
          {/* ========================================== */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBIL MENÜ LENYÍLÓ RÉSZE                     */}
      {/* ========================================== */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 shadow-xl absolute w-full">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
            
            {/* Publikus gombok */}
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-lg font-bold text-slate-200 hover:bg-slate-700">Acasă (Mașini)</Link>
            <Link href="/exhibitor" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-lg font-bold text-slate-200 hover:bg-slate-700">Înscrie o Mașină</Link>

            {/* Felhasználói gombok */}
            {session && (
              <div className="border-t border-slate-700 mt-2 pt-2">
                <Link href="/my-car" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-lg font-bold text-emerald-400 hover:bg-slate-700 bg-slate-900/30 mt-2">
                  Mașina Mea 🚘
                </Link>
              </div>
            )}

            {/* SuperAdmin gomb a mobil menüben is */}
            {isSuperAdmin && (
              <div className="border-t border-slate-700 mt-2 pt-4 flex flex-col space-y-2">
                <Link href="/superadmin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-purple-400 hover:bg-slate-700 bg-purple-900/20 border border-purple-500/20">
                  👑 Gestionare Utilizatori
                </Link>
              </div>
            )}

            {/* Admin gombok mobilon */}
            {isAdmin && (
              <div className="border-t border-slate-700 mt-2 pt-4 flex flex-col space-y-2">
                <div className="px-3 text-xs font-black text-slate-400 uppercase tracking-wider mb-2">🛡️ Meniu Admin</div>
                <Link href="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-amber-400 hover:bg-slate-700 bg-slate-900/50">🏆 Rezultate</Link>
                <Link href="/qrcodes" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-amber-400 hover:bg-slate-700 bg-slate-900/50">📱 Coduri QR</Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-red-400 hover:bg-slate-700 bg-slate-900/50">🛠️ Panou Control</Link>
              </div>
            )}

            {/* Profil & Belépés mobilon */}
            <div className="border-t border-slate-700 mt-4 pt-6">
              {session ? (
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center gap-3">
                    <img src={session.user?.image || ""} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg" />
                    <span className="font-bold text-lg text-white">{session.user?.name}</span>
                  </div>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); signOut(); }} 
                    className="bg-red-500/10 text-red-500 border border-red-500 px-4 py-2 rounded-xl font-bold"
                  >
                    Ieșire
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); signIn("google"); }} 
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-bold text-center text-lg shadow-lg"
                >
                  Autentificare cu Google
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}