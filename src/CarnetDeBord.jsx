
import React from "react";
import { doc, deleteDoc } from "firebase/firestore";

export default function CarnetDeBord({ data, onEdit, onRefresh, user, db }) {
  const handleDelete = async (dayId) => {
    const confirm = window.confirm("Supprimer définitivement cette journée ?");
    if (!confirm) return;
    await deleteDoc(doc(db, "artifacts/default-app-id/users", user.uid, "journees", dayId));
    onRefresh();
  };

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">📘 Carnet de bord</h2>
      {sorted.length === 0 ? (
        <p>Aucune journée enregistrée.</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((day) => (
            <li key={day.id} className="bg-slate-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <strong>{new Date(day.date).toLocaleDateString("fr-FR")}</strong>
                <div className="space-x-2">
                  <button
                    onClick={() => onEdit(day)}
                    className="text-blue-400 hover:underline text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(day.id)}
                    className="text-red-400 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="text-sm mb-2">
                Score : <strong>{day.scoreJour}</strong> — D+ rel : {day.deniveleRelatifTotal} m — Dist. rel : {day.distanceRelativeTotale} km
              </div>
              {day.seances.map((s, i) => (
                <div key={i} className="text-sm text-slate-300">
                  <span className="font-medium">{s.titre || s.sport}</span> ({s.sport}) — {s.distance || "?"} km, {s.denivele || "?"} m D+, {s.duree || "?"}
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
