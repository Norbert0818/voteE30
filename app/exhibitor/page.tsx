// app/exhibitor/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import toast from "react-hot-toast";

export default function ExhibitorPage() {
  const { data: session, status } = useSession();
  
  const [startNumber, setStartNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ha még tölt a session, vagy nincs bejelentkezve
  if (status === "loading") return <div className="p-8 text-center text-xl">Încărcare...</div>;
  if (!session) return <div className="p-8 text-center text-xl text-red-500 font-bold">Te rugăm să te autentifici pentru a utiliza această pagină!</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Te rugăm să încarci o imagine cu mașina!");
      return;
    }

    setIsSubmitting(true);

    // Elküldjük az adatokat a saját API végpontunknak
    const res = await fetch("/api/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startNumber,
        name,
        description,
        imageUrl,
        userEmail: session.user?.email, // Ezzel azonosítjuk a backendben
      }),
    });

    if (res.ok) {
      toast.success("Mașina a fost înscrisă cu succes pentru votare!");
      // Űrlap törlése sikeres mentés után
      setStartNumber("");
      setName("");
      setDescription("");
      setImageUrl("");
    } else {
      const errorData = await res.json();
      toast.error(`A apărut o eroare: ${errorData.error}`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 flex flex-col items-center">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 text-center">Înscriere Mașină</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Număr de concurs (ID)</label>
            <input 
              type="number" 
              required
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex. 12"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tipul exact al mașinii / Nume</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex. Lada 2107 Roșie"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Scurtă descriere (Ce modificări ai făcut?)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Ex. Eșapament sport, suspensie coborâtă, interior din piele..."
            />
          </div>

          {/* Cloudinary Képfeltöltő Gomb */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Fotografia mașinii</label>
            
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              onSuccess={(result: any) => {
                setImageUrl(result.info.secure_url); // Itt kapjuk meg a kész linket!
              }}
            >
              {({ open }) => {
                return (
                  <button 
                    type="button" // Fontos, hogy ne küldje be a formot!
                    onClick={() => open()}
                    className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition"
                  >
                    {imageUrl ? "📸 Imagine încărcată cu succes! (Click pentru înlocuire)" : "📤 Selectează imaginea pentru încărcare"}
                  </button>
                );
              }}
            </CldUploadWidget>

            {/* Ha van kép, meg is mutatjuk előnézetben */}
            {imageUrl && (
              <img src={imageUrl} alt="Previzualizare" className="mt-4 rounded-lg w-full h-48 object-cover shadow-sm" />
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-4 rounded-xl mt-6 transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
          >
            {isSubmitting ? "Se salvează..." : "Salvare Mașină pentru Votare"}
          </button>

        </form>
      </div>
    </div>
  );
}