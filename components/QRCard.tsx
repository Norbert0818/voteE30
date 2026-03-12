"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import toast from "react-hot-toast";

interface QRCardProps {
  car: {
    id: number;
    startNumber: number;
    name: string;
  };
  voteUrl: string;
}

export default function QRCard({ car, voteUrl }: QRCardProps) {
  // Most már két referenciánk lesz
  const visibleCardRef = useRef<HTMLDivElement>(null); // A képernyőn látható (kerekített)
  const downloadCardRef = useRef<HTMLDivElement>(null); // A rejtett (téglalap alakú)

  const downloadImage = async () => {
    if (!downloadCardRef.current) return;
    
    try {
      // 1. ELŐSZÖR: A letöltendő fantom kártyát átmenetileg láthatóvá tesszük a kódnak, de rejtve a usernek
      // (Erre azért van szükség, mert a html-to-image nem szereti, ha a target display: none)
      downloadCardRef.current.style.display = 'flex';

      // 2. LEFOTÓZZUK a fantomot (téglalap alakú)
      const dataUrl = await htmlToImage.toPng(downloadCardRef.current, { 
        quality: 1.0, 
        pixelRatio: 3, // Emeljük a felbontást, hogy nyomtatásnál tűéles legyen
        backgroundColor: '#ffffff' // Biztosra megyünk a fehér háttérrel
      });

      // 3. UTÁNA: Azonnal visszarejtjük a fantom kártyát
      downloadCardRef.current.style.display = 'none';
      
      // 4. Létrehozunk egy láthatatlan linket és "rákattintunk", hogy letöltődjön
      const link = document.createElement('a');
      link.download = `auto-${car.startNumber}-qr-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Hiba a kép generálásakor!", error);
      toast.error("Eroare la generarea imaginii!");
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      
      {/* ========================================================== */}
      {/* 1. FANTOM KÁRTYA A LETÖLTÉSHEZ (SQUARE SARKOKKAL)         */}
      {/* Ez a képernyőn sosem látszik (hidden), és nyomtatáskor sem */}
      {/* ========================================================== */}
      <div className="absolute top-0 left-0 -z-50 pointer-events-none w-full max-w-[400px]">
        <div 
          ref={downloadCardRef} 
          style={{ display: 'none' }} // Alapból rejtve van
          className="bg-white border-[16px] border-slate-900 p-8 flex-col items-center justify-center text-center w-full aspect-[3/4]" // aspect ratio, hogy fix mérete legyen
        >
          {/* Ugyanaz a tartalom, csak nincs kerekítés */}
          <h2 className="text-4xl font-black text-slate-800 uppercase mb-2 tracking-wider line-clamp-1">
            {car.name}
          </h2>
          <div className="text-7xl font-black text-blue-600 mb-8">
            #{car.startNumber}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border-4 border-slate-200 mb-8 shadow-inner">
            <QRCodeSVG value={voteUrl} size={250} level="H" includeMargin={true} />
          </div>
          
          <p className="text-3xl font-black text-slate-800 uppercase tracking-widest">
            Votează-mă!
          </p>
        </div>
      </div>


      {/* ========================================================== */}
      {/* 2. LÁTHATÓ KÁRTYA A KÉPERNYŐRE ÉS NYOMTATÁSRA              */}
      {/* Ennek maradnak a kerekített sarkai (rounded-3xl)           */}
      {/* ========================================================== */}
      <div 
        ref={visibleCardRef} 
        className="bg-white border-8 border-slate-900 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl print:shadow-none print:border-4 print:break-inside-avoid w-full"
      >
        <h2 className="text-3xl font-black text-slate-800 uppercase mb-2 tracking-wider line-clamp-1">
          {car.name}
        </h2>
        <div className="text-6xl font-black text-blue-600 mb-8">
          #{car.startNumber}
        </div>
        
        <div className="bg-white p-4 rounded-2xl border-4 border-slate-200 mb-6 shadow-inner">
          <QRCodeSVG value={voteUrl} size={220} level="H" includeMargin={true} />
        </div>
        
        <p className="text-2xl font-black text-slate-800 uppercase tracking-widest">
          Votează-mă!
        </p>
        <p className="text-slate-500 text-sm mt-3 font-mono bg-slate-100 px-3 py-1 rounded print:hidden">
          scanează cu camera
        </p>
      </div>

      {/* LETÖLTÉS GOMB */}
      <button 
        onClick={downloadImage}
        className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-md print:hidden flex items-center gap-2 active:scale-95"
      >
        <span>⬇️</span> Descarcă imaginea (format dreptunghiular)
      </button>
    </div>
  );
}