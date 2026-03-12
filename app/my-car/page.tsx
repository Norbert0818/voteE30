// app/my-car/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import toast from "react-hot-toast";

export default function MyCarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [car, setCar] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }

    const fetchMyCar = async () => {
      const res = await fetch("/api/my-car");
      if (res.ok) {
        const data = await res.json();
        if (data.car) {
          setCar(data.car);
          setName(data.car.name);
          setDescription(data.car.description);
          setMainImage(data.car.imageUrl);
          setGalleryImages(data.car.galleryImages || []); // Ha még üres lenne, tömböt csinál belőle
        }
      }
      setIsLoading(false);
    };

    fetchMyCar();
  }, [session, status, router]);

  const handleSave = async () => {
    setIsSaving(true);
    const res = await fetch("/api/my-car", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId: car.id, name, description, galleryImages, imageUrl: mainImage })
    });

    if (res.ok) {
      toast.success("Datele mașinii tale au fost actualizate cu succes!");
    } else {
      toast.error("A apărut o eroare în timpul salvării.");
    }
    setIsSaving(false);
  };

  const removeImage = (indexToRemove: number) => {
    setGalleryImages(galleryImages.filter((_, index) => index !== indexToRemove));
  };

  if (isLoading) return <div className="p-8 text-center text-xl font-bold">Încărcare...</div>;

  if (!car) {
    return (
      <div className="max-w-3xl mx-auto p-6 py-12 text-center">
        <h1 className="text-3xl font-black text-slate-800 mb-4">Mașina Mea</h1>
        <p className="text-slate-500 text-lg">Nu ai înscris încă nicio mașină la eveniment!</p>
        <button onClick={() => router.push("/exhibitor")} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
          Înscrie mașina acum
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 py-12">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border-4 border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800">Editează Mașina Mea</h1>
          <div className="bg-slate-900 text-white font-black text-xl md:text-2xl px-4 py-2 rounded-xl">#{car.startNumber}
          </div>
        </div>

        <div className="space-y-6">

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Imagine Principală (Obligatoriu)</h3>
            <p className="text-slate-500 text-sm mb-6">Această imagine va apărea pe buletinul de vot și pe pagina de sumar.</p>
            
            {mainImage ? (
              <div className="relative rounded-xl overflow-hidden shadow-sm group w-full max-w-md">
                <img src={mainImage} alt="Imagine principală" className="w-full h-64 object-cover" />
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setMainImage(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition shadow-lg"
                >
                  Șterge imaginea 🗑️
                </button>
              </div>
            ) : (
              <CldUploadWidget 
                uploadPreset="ofnotabi" 
                onSuccess={(result: any, { widget }) => {
                  if (result?.event === "success" && result?.info?.secure_url) {
                    setMainImage(result.info.secure_url); // Beállítja az új főképet
                    widget.close();
                  }
                }}
              >
                {({ open }) => (
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); open(); }}
                    className="w-full max-w-md h-64 rounded-xl border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer font-bold"
                  >
                    <span className="text-4xl mb-2">📸</span>
                    <span>Încarcă o imagine principală nouă</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>
          {/* Név szerkesztése */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nume mașină / Tip</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 text-slate-800 font-semibold"
            />
          </div>

          {/* Leírás szerkesztése */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descriere (Ce merită știut despre ea?)</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Képgaléria kezelése */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Galerie Foto</h3>
            <p className="text-slate-500 text-sm mb-6">Încarcă imagini suplimentare cu mașina ta (se recomandă maxim 4). Apasă pe X-ul roșu pentru a șterge o imagine.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Eddig feltöltött képek */}
              {galleryImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-sm group">
                <img src={img} alt="Imagine galerie" className="w-full h-full object-cover" />
                <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); removeImage(index); }} 
                    // ÚJ: Mobilon is látszik a gomb kicsit (opacity-80), ne csak hoverre, mert mobilon nincs egér-hover!
                    className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full font-bold opacity-80 md:opacity-0 group-hover:opacity-100 transition shadow-lg flex items-center justify-center"
                >
                    X
                </button>
                </div>
              ))}
              
              {/* Új kép hozzáadása gomb (Cloudinary) */}
              <CldUploadWidget 
                uploadPreset="ofnotabi" 
                onSuccess={(result: any, { widget }) => {
                  console.log("Cloudinary válasz:", result); // Ezt fogjuk nézni, ha baj van!
                  
                  // Csak akkor adjuk hozzá, ha tényleg sikeres volt és van kép link
                  if (result?.event === "success" && result?.info?.secure_url) {
                    setGalleryImages(prevImages => [...prevImages, result.info.secure_url]);
                    widget.close(); // Automatikusan bezárja az ablakot
                  }
                }}
              >
                {({ open }) => (
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      open(); 
                    }}
                    className="aspect-square rounded-xl border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 hover:border-blue-400 hover:text-blue-500 transition cursor-pointer font-bold"
                  >
                    <span className="text-3xl mb-2">+</span>
                    <span>Adaugă poză</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-emerald-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-emerald-700 transition shadow-lg active:scale-95 disabled:bg-slate-400 mt-8"
          >
            {isSaving ? "Se salvează..." : "Salvează Modificările 💾"}
          </button>
        </div>

      </div>
    </div>
  );
}