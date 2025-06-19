
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function GraphiquesHebdo({ data }) {
  const weeklyData = useMemo(() => {
    const weeks = {};
    data.forEach(day => {
      const d = new Date(day.date);
      const monday = new Date(d);
      const dow = d.getUTCDay();
      monday.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1));
      const weekId = monday.toISOString().split("T")[0];
      if (!weeks[weekId]) {
        weeks[weekId] = {
          id: weekId,
          distanceRelative: 0,
          deniveleRelatif: 0,
          scoreTotal: 0,
          days: 0,
        };
      }
      weeks[weekId].distanceRelative += day.distanceRelativeTotale || 0;
      weeks[weekId].deniveleRelatif += day.deniveleRelatifTotal || 0;
      weeks[weekId].scoreTotal += day.scoreJour || 0;
      weeks[weekId].days += 1;
    });
    return Object.values(weeks).map(w => ({
      ...w,
      distanceRelative: parseFloat(w.distanceRelative.toFixed(2)),
      deniveleRelatif: parseFloat(w.deniveleRelatif.toFixed(2)),
    })).sort((a, b) => a.id.localeCompare(b.id));
  }, [data]);

  return (
    <div className="space-y-10">
      <h2 className="text-2xl font-bold mb-2">📈 Évolution hebdomadaire</h2>

      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Score qualité par semaine</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="id" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="scoreTotal"
              name="Score Qualité"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Distance & D+ relatifs par semaine</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="id" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
            <Legend />
            <Bar dataKey="distanceRelative" name="Distance (km rel.)" fill="#22d3ee" />
            <Bar dataKey="deniveleRelatif" name="D+ (m rel.)" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
