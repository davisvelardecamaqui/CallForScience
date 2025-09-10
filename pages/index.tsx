import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import Papa from "papaparse";

export default function CallForScience() {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse("https://raw.githubusercontent.com/davisvelardecamaqui/CallForScience/main/CallForScienceAPP.csv", {
      download: true,
      header: true,
      complete: (results) => {
        setData(results.data);
      },
    });
  }, []);

  const [cuartil, setCuartil] = useState("");
  const [resumen, setResumen] = useState("");
  const [pagoMax, setPagoMax] = useState("");
  const [tematicaFiltro, setTematicaFiltro] = useState("");

  const filtered = data.filter((item) => {
    if (!item || typeof item !== 'object') return false;

    const hoy = new Date();
    const fechaLimite = (() => {
      const parts = item.deadline?.split("/") || [];
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(item.deadline);
    })();

    if (isNaN(fechaLimite.getTime()) || fechaLimite < hoy) return false;

    const {
      revista = "",
      tematica = "",
      tematicaEN = "",
      pago = "",
      cuartil: cuartilItem = "",
      resumen: resumenItem = ""
    } = item;

    if (!revista || !tematica || !tematicaEN) return false;

    const matchesCuartil = cuartil ? cuartil === cuartilItem : true;
    const matchesResumen = resumen
      ? resumenItem?.toLowerCase().trim() === resumen.toLowerCase().trim()
      : true;
    const matchesPago = pagoMax && !isNaN(parseFloat(pago))
      ? parseFloat(pago) <= parseFloat(pagoMax)
      : true;
    const matchesTematica = tematicaFiltro
      ? tematica.toLowerCase().includes(tematicaFiltro.toLowerCase()) ||
        tematicaEN.toLowerCase().includes(tematicaFiltro.toLowerCase())
      : true;

    return (
      matchesCuartil && matchesResumen && matchesPago && matchesTematica
    );
  });

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      {/*
      <pre className="text-xs text-zinc-500 max-h-60 overflow-auto mb-4 bg-zinc-900 p-4 rounded">
        {JSON.stringify(data.slice(0, 2), null, 2)}
      </pre>
      */}

      <h1 className="text-3xl font-serif text-gold font-bold mb-6 text-center">
        Call for Science
      </h1>

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <select
          value={cuartil}
          onChange={(e) => setCuartil(e.target.value)}
          className="bg-zinc-900 border border-gold text-gold p-2 rounded"
        >
          <option value="">Todos los cuartiles</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
        </select>

        <select
          value={resumen}
          onChange={(e) => setResumen(e.target.value)}
          className="bg-zinc-900 border border-gold text-gold p-2 rounded"
        >
          <option value="">Resumen requerido</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <Input
          type="number"
          placeholder="Pago máximo"
          value={pagoMax}
          onChange={(e) => setPagoMax(e.target.value)}
          className="bg-zinc-900 border border-gold placeholder-gold text-gold"
        />

        <input
          list="tematicas"
          placeholder="Buscar temática..."
          value={tematicaFiltro}
          onChange={(e) => setTematicaFiltro(e.target.value)}
          className="bg-zinc-900 border border-gold placeholder-gold text-gold p-2 rounded"
        />
        <datalist id="tematicas">
          {Array.from(
            new Set(
              data.flatMap(item =>
                [item.tematica, item.tematicaEN]
                  .filter(Boolean)
                  .flatMap(t => t.split(';').map(x => x.trim()))
              )
            )
          )
            .filter(op => op && op.length > 1)
            .map((option, index) => (
              <option key={index} value={option} />
            ))}
        </datalist>
      </div>

      <div className="flex justify-end mb-8">
        <Button
          variant="outline"
          className="bg-gold text-black border border-gold hover:bg-white hover:text-black"
          onClick={() => {
            setCuartil("");
            setResumen("");
            setPagoMax("");
            setTematicaFiltro("");
          }}
        >
          Limpiar filtros
        </Button>
      </div>

      <p className="text-center text-sm text-zinc-400 mb-4">{filtered.length} convocatorias encontradas</p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-zinc-950 border border-gold rounded-2xl shadow-lg">
              <CardContent className="p-5 space-y-3 relative">
                <h2 className="text-xl font-bold text-gold font-serif">
                  {item.revista}
                </h2>
                <p className="text-sm text-zinc-400 italic">{item.nombreCFP}</p>
                {item.resumen?.toLowerCase().trim() === "sí" && (
                  <div className="absolute top-3 right-3 bg-gold text-black text-xs font-semibold px-3 py-1 rounded-full shadow-md animate-pulse z-10">
                    📝 Solo piden resumen
                  </div>
                )}
                <p className="text-sm">🎯 {item.tematica}</p>
                <p className="text-sm text-zinc-400">📘 {item.tematicaEN}</p>
                <p className="text-sm">📅 Deadline: {item.deadline}</p>
                <p className="text-sm">📊 Cuartil: {item.cuartil}</p>
                <p className="text-sm">💰 Pago: ${item.pago}</p>
                <Button
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300"
                  onClick={() => window.open(item.link, "_blank")}
                >
                  Ver CFP
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
