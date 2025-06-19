
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";

const COEFFICIENTS = {
  distance: { "Course à pied": 1, Skating: 0.7, Travail: 0.5, Rando: 0.5, "Vélo gravel": 0.35, "Vélo route": 0.3, Natation: 4, "Sports co": 0.5, Renforcement: 0 },
  denivele: { "Course à pied": 1, Skating: 0.9, Travail: 0.8, Rando: 0.8, "Vélo gravel": 0.55, "Vélo route": 0.5, Natation: 0, "Sports co": 0, Renforcement: 0 },
  renforcementKmParMinute: 0.5,};
const SPORTS = Object.keys(COEFFICIENTS.distance);

export default function FormulaireJournee({ user, db, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [alimentation, setAlimentation] = useState("Correcte");
  const [sommeil, setSommeil] = useState("08:00");
  const [difficulte, setDifficulte] = useState(10);
  const [seances, setSeances] = useState([
    { id: Date.now(), titre: "", sport: "Course à pied", distance: "", denivele: "", duree: "" },
  ]);

  const calculateScoreDistance = (kmRelatifs) => {
    if (kmRelatifs <= 0) return 0;
    if (kmRelatifs <= 14) return (50 / 14) * kmRelatifs;
    if (kmRelatifs <= 23) return 50 + (25 / 9) * (kmRelatifs - 14);
    if (kmRelatifs <= 35) return 75 + (25 / 12) * (kmRelatifs - 23);
    return 100 + 3 * (kmRelatifs - 35);
  };

  const calculateScoreDenivele = (d) => {
    if (d <= 0) return 0;
    if (d <= 500) return (50 / 500) * d;
    if (d <= 1000) return 50 + (30 / 500) * (d - 500);
    if (d <= 1600) return 80 + (20 / 600) * (d - 1000);
    return 100 + (3 / 45) * (d - 1600);
  };

  const calculateScoreSommeil = (duree) => {
    const [h, m] = duree.split(":").map(Number);
    const total = h * 60 + m;
    if (total <= 315) return 0;
    if (total >= 601) return 20;
    return Math.floor((total - 315) / 15);
  };

  const calculateScoreAlimentation = (a) => (a === "Bonne" ? 2 : a === "Correcte" ? 1 : 0);

  const calculateScoreTotal = (scores) => {
    const { distance, denivele, difficulte, sommeil, alimentation } = scores;
    const difficulteScore = ((20 - difficulte) / 20) * 100;
    return Math.round(
      (distance * 0.265) +
      (denivele * 0.265) +
      (difficulteScore * 0.33) +
      ((sommeil / 20) * 100 * 0.10) +
      ((alimentation / 2) * 100 * 0.04)
    );
  };

  const handleSeanceChange = (id, field, value) => {
    setSeances(seances.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSeance = () => {
    setSeances([...seances, {
      id: Date.now() + Math.random(),
      titre: "", sport: "Course à pied", distance: "", denivele: "", duree: ""
    }]);
  };

  const removeSeance = (id) => {
    setSeances(seances.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let distRel = 0, denivRel = 0;
    const seancesCalculees = seances.map((s) => {
      const dist = parseFloat(s.distance) || 0;
      const deniv = parseFloat(s.denivele) || 0;
      const [h, m] = s.duree ? s.duree.split(":").map(Number) : [0, 0];
      const dureeMins = h * 60 + m;
      let dr = dist * (COEFFICIENTS.distance[s.sport] || 0);
      if (s.sport === "Renforcement") dr = dureeMins * COEFFICIENTS.renforcementKmParMinute;
      const denivR = deniv * (COEFFICIENTS.denivele[s.sport] || 0);
      distRel += dr;
      denivRel += denivR;
      return { ...s, distanceRelative: dr, deniveleRelatif: denivR };
    });

    const scores = {
      distance: calculateScoreDistance(distRel),
      denivele: calculateScoreDenivele(denivRel),
      difficulte,
      sommeil: calculateScoreSommeil(sommeil),
      alimentation: calculateScoreAlimentation(alimentation),
    };

    const scoreJour = calculateScoreTotal(scores);
    const data = {
      date,
      alimentation,
      sommeil,
      difficulte,
      seances: seancesCalculees,
      distanceRelativeTotale: parseFloat(distRel.toFixed(2)),
      deniveleRelatifTotal: parseFloat(denivRel.toFixed(2)),
      scoreJour,
    };

    await setDoc(doc(db, "artifacts/default-app-id/users", user.uid, "journees", date), data);
    onSaved(); // callback vers le composant parent
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-lg">
        <label>
          Date :
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
        </label>
        <label>
          Alimentation :
          <select value={alimentation} onChange={e => setAlimentation(e.target.value)} className="block w-full p-2 rounded bg-slate-700">
            <option value="Mauvaise">Mauvaise</option>
            <option value="Correcte">Correcte</option>
            <option value="Bonne">Bonne</option>
          </select>
        </label>
        <label>
          Sommeil :
          <input type="time" value={sommeil} onChange={e => setSommeil(e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
        </label>
        <label>
          Difficulté perçue : {difficulte}
          <input type="range" min="0" max="20" value={difficulte} onChange={e => setDifficulte(Number(e.target.value))} className="block w-full" />
        </label>
      </div>

      <div className="space-y-4">
        {seances.map((s, i) => (
          <div key={s.id} className="p-4 border border-slate-700 rounded bg-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold">Séance #{i + 1}</h4>
              {seances.length > 1 && (
                <button type="button" onClick={() => removeSeance(s.id)} className="text-red-400 hover:underline text-sm">Supprimer</button>
              )}
            </div>
            <input type="text" placeholder="Titre" value={s.titre} onChange={e => handleSeanceChange(s.id, "titre", e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
            <select value={s.sport} onChange={e => handleSeanceChange(s.id, "sport", e.target.value)} className="block w-full p-2 rounded bg-slate-700">
              {SPORTS.map(sport => <option key={sport}>{sport}</option>)}
            </select>
            <input type="number" placeholder="Distance (km)" value={s.distance} onChange={e => handleSeanceChange(s.id, "distance", e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
            <input type="number" placeholder="Dénivelé (m D+)" value={s.denivele} onChange={e => handleSeanceChange(s.id, "denivele", e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
            <input type="time" placeholder="Durée" value={s.duree} onChange={e => handleSeanceChange(s.id, "duree", e.target.value)} className="block w-full p-2 rounded bg-slate-700" />
          </div>
        ))}
        {seances.length < 10 && (
          <button type="button" onClick={addSeance} className="bg-cyan-600 px-4 py-2 rounded text-white">+ Ajouter une séance</button>
        )}
      </div>

      <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-bold">
        Enregistrer la journée
      </button>
    </form>
  );
}
