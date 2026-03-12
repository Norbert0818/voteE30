// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6">
      
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl max-w-3xl w-full border-t-8 border-blue-600">
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6">
          Bun venit la Întâlnire! 🏆
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
          Vezi mașinile expuse și votează-ți favoritele în diferitele categorii. Votul tău decide câștigătorii!
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/cars" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:-translate-y-1">
            Arată-mi mașinile!
          </Link>
          <Link href="/exhibitor" className="bg-slate-200 text-slate-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-300 transition shadow-md">
            Înscrie mașina proprie
          </Link>
        </div>
      </div>

    </div>
  );
}