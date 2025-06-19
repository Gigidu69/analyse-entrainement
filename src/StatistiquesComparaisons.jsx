
import React, { useMemo } from "react";

export default function StatistiquesComparaisons({ data }) {
  const semaines = useMemo(() => {
    const group = {};
    data.forEach(jour => {
      const date = new Date(jour.date);
      const year = date.getUTCFullYear();
      const week1 = new Date(Date.UTC(year, 0, 4));
      const dayNumber = Math.floor((date - week1) / (1000 * 60 * 60 * 24));
      const weekNum = Math.ceil((dayNumber + week1.getUTCDay() + 1) / 7);
      const weekId = `${year}-S${String(weekNum).padStart(2, "0")}`;
      if (!group[weekId]) {
        group[weekId] = {
          id: weekId,
          scoreTotal: 0,
          nbJours: 0,
          km: 0,
          dplus: 0,
          scoreMin: null,
          scoreMax: null,
        };
      }
      group[weekId].scoreTotal += jour.scoreJour || 0;
      group[weekId].nbJours += 1;
      group[weekId].km += jour.distanceRelativeTotale || 0;
      group[weekId].dplus += jour.deniveleRelatifTotal || 0;
      if (group[weekId].scoreMin === null || jour.scoreJour < group[weekId].scoreMin) {
        group[weekId].scoreMin = jour.scoreJour;
      }
      if (group[weekId].scoreMax === null || jour.scoreJour > group[weekId].scoreMax) {
        group[weekId].scoreMax = jour.scoreJour;
      }
    });
    return Object.values(group).sort((a, b) => a.id.localeCompare(b.id));
  }, [data]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Statistiques & Comparaisons</h2>
      {semaines.length === 0 ? (
        <p>Aucune donnée pour l’analyse.</p>
      ) : (
        <table className="w-full text-left bg-slate-800 rounded overflow-hidden">
          <thead className="bg-slate-700 text-slate-300">
            <tr>
              <th className="p-2">Semaine</th>
              <th className="p-2">Score total</th>
              <th className="p-2">Moy. journalière</th>
              <th className="p-2">Min / Max</th>
              <th className="p-2">Km relatifs</th>
              <th className="p-2">D+ relatifs</th>
            </tr>
          </thead>
          <tbody>
            {semaines.map((s) => (
              <tr key={s.id} className="border-t border-slate-700">
                <td className="p-2">{s.id}</td>
                <td className="p-2">{s.scoreTotal}</td>
                <td className="p-2">{(s.scoreTotal / s.nbJours).toFixed(1)}</td>
                <td className="p-2">{s.scoreMin} / {s.scoreMax}</td>
                <td className="p-2">{s.km.toFixed(1)}</td>
                <td className="p-2">{s.dplus.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
