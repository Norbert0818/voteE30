// components/PrintButton.tsx
"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-900 transition shadow-lg flex items-center gap-3 mx-auto"
    >
      🖨️ Printare Carduri
    </button>
  );
}