import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";

const CSV_URL = "/api/csv";

const translations = {
  es: {
    title: "Call For Science",
    subtitle: "Encuentra convocatorias académicas abiertas con filtros inteligentes.",
    filters: {
      cuartil: "Todos los cuartiles",
      resumen: "Resumen requerido",
      pago: "Pago máximo",
      tematica: "Buscar temática...",
      limpiar: "Limpiar filtros",
    },
    resumenSplash: "📝 Solo piden resumen",
    seeCFP: "Ver CFP",
    cuartilLabel: "Cuartil",
    pagoLabel: "Pago",
    tematicasLabel: "Temáticas",
    deadlineLabel: "Fecha límite",
    perPage: "Por página",
    prev: "Anterior",
    next: "Siguiente",
    sobre: {
      titulo: "Sobre Call For Science",
      texto: "Esta herramienta permite encontrar oportunidades académicas internacionales filtradas por criterios clave como cuartil, temática, necesidad de resumen y remuneración. Diseñada para investigadores que buscan publicar de forma estratégica.",
    },
    encontrados: (n) => `${n} convocatorias encontradas`,
    cambiarIdioma: "English version",
  },
  en: {
    title: "Call For Science",
    subtitle: "Find open academic calls with smart filters.",
    filters: {
      cuartil: "All quartiles",
      resumen: "Requires abstract",
      pago: "Max APC",
      tematica: "Search topic...",
      limpiar: "Clear filters",
    },
    resumenSplash: "📝 Abstract only",
    seeCFP: "See CFP",
    cuartilLabel: "Quartile",
    pagoLabel: "APC",
    tematicasLabel: "Topics",
    deadlineLabel: "Deadline",
    perPage: "Per page",
    prev: "Prev",
    next: "Next",
    sobre: {
      titulo: "About Call For Science",
      texto: "This tool helps you find international academic opportunities filtered by key criteria like quartile, topic, abstract requirement, and compensation. Designed for researchers seeking strategic publication.",
    },
    encontrados: (n) => `${n} calls found`,
    cambiarIdioma: "Versión en español",
  },
};

function formatDate(dateString: string, lang: 'es' | 'en') {
  const parts = dateString?.split("/") || [];
  if (parts.length !== 3) return dateString;
  const [day, month, year] = parts;
  const monthsEs = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const monthsEn = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const m = parseInt(month, 10);
  if (isNaN(m) || m < 1 || m > 12) return dateString;
  const monthLabel = lang === 'es' ? monthsEs[m-1] : monthsEn[m-1];
  return `${day}/${monthLabel}/${year}`;
}

export default function CallForScience() {
  const [data, setData] = useState([]);
  const [cuartil, setCuartil] = useState("");
  const [resumen, setResumen] = useState("");
  const [pagoMax, setPagoMax] = useState("");
  const [tematicaFiltro, setTematicaFiltro] = useState("");
  const [lang, setLang] = useState<'es' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as 'es' | 'en') || 'es';
    }
    return 'es';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const t = translations[lang];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }, [lang]);

  useEffect(() => {
    fetch(CSV_URL)
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => setData(results.data),
        });
      });
  }, []);

  const filtered = data.filter((item) => {
    if (!item || typeof item !== "object") return false;

    const hoy = new Date();
    const parts = item.deadline?.split("/") || [];
    const fechaLimite =
      parts.length === 3
        ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        : new Date(item.deadline);
    if (isNaN(fechaLimite.getTime()) || fechaLimite < hoy) return false;

    const {
      revista = "",
      tematica = "",
      tematicaEN = "",
      pago = "",
      cuartil: cuartilItem = "",
      resumen: resumenItem = "",
    } = item;

    const matchesCuartil = cuartil ? cuartil === cuartilItem : true;
    const matchesResumen = resumen
      ? resumenItem?.toLowerCase().trim() === resumen.toLowerCase().trim()
      : true;
    const matchesPago =
      pagoMax && !isNaN(parseFloat(pago))
        ? parseFloat(pago) <= parseFloat(pagoMax)
        : true;
    const matchesTematica = tematicaFiltro
      ? (lang === 'es'
          ? tematica.toLowerCase().includes(tematicaFiltro.toLowerCase())
          : tematicaEN.toLowerCase().includes(tematicaFiltro.toLowerCase()))
      : true;

    return (
      matchesCuartil &&
      matchesResumen &&
      matchesPago &&
      matchesTematica &&
      revista &&
      tematica
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);

  return (
    <>
      
      <main className="min-h-screen bg-black text-white font-sans">
        {/* LANG SWITCH */}
        <div className="flex justify-end px-6 pt-6">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="text-gold underline text-sm"
          >
            {t.cambiarIdioma}
          </button>
        </div>

        {/* HERO */}
        <section className="py-16 px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-serif font-bold text-gold"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-zinc-400 text-lg"
          >
            {t.subtitle}
          </motion.p>
        </section>

        {/* FILTROS */}
        <section className="px-6 max-w-6xl mx-auto mb-12">
          <div className="grid gap-4 md:grid-cols-5">
            <select
              value={cuartil}
              onChange={(e) => setCuartil(e.target.value)}
              className="bg-zinc-900 border border-gold text-gold p-2 rounded"
            >
              <option value="">{t.filters.cuartil}</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
            </select>

            <select
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              className="bg-zinc-900 border border-gold text-gold p-2 rounded"
            >
              <option value="">{t.filters.resumen}</option>
              <option value="Sí">Sí</option>
              <option value="No">No</option>
            </select>

            <input
              type="number"
              placeholder={t.filters.pago}
              value={pagoMax}
              onChange={(e) => setPagoMax(e.target.value)}
              className="bg-zinc-900 border border-gold text-gold p-2 rounded placeholder-gold"
            />

            <input
              list="tematicas"
              placeholder={t.filters.tematica}
              value={tematicaFiltro}
              onChange={(e) => setTematicaFiltro(e.target.value)}
              className="bg-zinc-900 border border-gold text-gold p-2 rounded placeholder-gold"
            />
            <datalist id="tematicas">
              {Array.from(
                new Set(
                  data.flatMap((item) =>
                    lang === 'es'
                      ? item.tematica?.split(";")
                      : item.tematicaEN?.split(";")
                  ).filter(Boolean).flat().map((x) => x.trim())
                )
              )
                .filter((op) => op && op.length > 1)
                .map((option, index) => (
                  <option key={index} value={option} />
                ))}
            </datalist>

            <button
              onClick={() => {
                setCuartil("");
                setResumen("");
                setPagoMax("");
                setTematicaFiltro("");
              }}
              className="bg-gold text-black font-semibold py-2 px-4 rounded hover:bg-white transition"
            >
              {t.filters.limpiar}
            </button>
          </div>

          <p className="text-sm text-zinc-400 mt-4">
            {t.encontrados(filtered.length)}
          </p>
        </section>

        {/* RESULTADOS */}
        <section className="px-6 max-w-6xl mx-auto grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {paginated.map((item, idx) => {
            const keywords = (lang === 'es' ? item.tematica : item.tematicaEN)?.split(";").map(k => k.trim()).filter(Boolean) || [];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-950 border border-gold rounded-2xl p-5 relative shadow-lg flex flex-col h-full"
              >
                {item.resumen?.toLowerCase().trim() === "sí" && (
                  <div className="absolute -top-4 -right-4 bg-gold text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg rotate-6 z-10">
                    {t.resumenSplash}
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gold mb-1 text-center">
                  {item.nombreCFP}
                </h2>
                <p className="text-sm italic text-zinc-400 mb-3 text-left">{item.revista}</p>
                <div className="mb-2 text-sm">
                  <span className="font-semibold">🎯 {t.tematicasLabel}: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {keywords.map((kw, i) => (
                      <button
                        key={i}
                        onClick={() => setTematicaFiltro(kw)}
                        className="px-2 py-1 bg-zinc-800 text-gold rounded hover:bg-gold hover:text-black text-xs"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm mb-2">📅 {t.deadlineLabel}: {formatDate(item.deadline, lang)}</p>
                <p className="text-sm mb-2">📊 {t.cuartilLabel}: {item.cuartil}</p>
                <p className="text-sm mb-4">💰 {t.pagoLabel}: ${item.pago}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => window.open(item.link, "_blank")}
                    className="w-full border border-gold text-gold hover:bg-gold hover:text-black font-semibold py-2 rounded transition"
                  >
                    {t.seeCFP}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* PAGINATION CONTROLS */}
        {filtered.length > 0 && (
          <section className="px-6 max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-24 gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-zinc-400">{t.perPage}:</label>
              <select
                value={perPage}
                onChange={(e) => {setPerPage(Number(e.target.value)); setCurrentPage(1);}}
                className="bg-zinc-900 border border-gold text-gold p-1 rounded"
              >
                {[10,20,30,50].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                className="px-3 py-1 border border-gold text-gold rounded disabled:opacity-50"
              >
                {t.prev}
              </button>
              <span className="text-sm text-zinc-400">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                className="px-3 py-1 border border-gold text-gold rounded disabled:opacity-50"
              >
                {t.next}
              </button>
            </div>
          </section>
        )}

        {/* SOBRE LA APP */}
        <section className="bg-zinc-900 py-16 px-6 text-center">
          <h3 className="text-3xl text-gold font-serif font-bold mb-4">{t.sobre.titulo}</h3>
          <p className="max-w-3xl mx-auto text-zinc-400">
            {t.sobre.texto}
          </p>
        </section>

        {/* FOOTER */}
        <footer className="bg-black text-zinc-500 text-sm text-center py-6 border-t border-zinc-800">
          <p>&copy; {new Date().getFullYear()} Call For Science. Hecho con 💡 para investigadores.</p>
        </footer>
      </main>
    </>
  );
}
