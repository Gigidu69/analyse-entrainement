
import React, { useState, useEffect } from "react";
import FormulaireJournee from "./FormulaireJournee";
import CarnetDeBord from "./CarnetDeBord";
import GraphiquesHebdo from "./GraphiquesHebdo";
import StatistiquesComparaisons from "./StatistiquesComparaisons";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot
} from "firebase/firestore";
import "./index.css";

const firebaseConfig = {
  apiKey: "AIzaSyDQHfkTaUSXnKV8dQj0PJXe58S_s5kGVmo",
  authDomain: "suivi-des-charges-d9063.firebaseapp.com",
  projectId: "suivi-des-charges-d9063",
  storageBucket: "suivi-des-charges-d9063.appspot.com",
  messagingSenderId: "232577689867",
  appId: "1:232577689867:web:da4a945a5b5d17024d1a0e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("saisie");
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const colRef = collection(db, "artifacts/default-app-id/users", u.uid, "journees");
        onSnapshot(colRef, (snapshot) => {
          setHistorique(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
      } else {
        setHistorique([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Erreur de connexion : " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Préremplissage pour édition
  const [editDay, setEditDay] = useState(null);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {!user ? (
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-6 rounded max-w-md mx-auto mt-24"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Connexion</h2>
          {error && <div className="bg-red-500 text-sm p-2 mb-3">{error}</div>}
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-2 rounded bg-slate-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full mb-4 p-2 rounded bg-slate-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-cyan-500 p-2 rounded">
            Se connecter
          </button>
        </form>
      ) : (
        <>
          <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold">Suivi d'entraînement</h1>
            <button onClick={handleLogout} className="text-sm bg-red-500 px-4 py-2 rounded">
              Déconnexion
            </button>
          </div>

          <nav className="mb-6 space-x-2">
            <button onClick={() => { setView("saisie"); setEditDay(null); }} className={`px-3 py-1 rounded ${view === "saisie" ? "bg-cyan-600" : "bg-slate-700"}`}>➕ Journée</button>
            <button onClick={() => setView("carnet")} className={`px-3 py-1 rounded ${view === "carnet" ? "bg-cyan-600" : "bg-slate-700"}`}>📘 Carnet</button>
            <button onClick={() => setView("graph")} className={`px-3 py-1 rounded ${view === "graph" ? "bg-cyan-600" : "bg-slate-700"}`}>📈 Graphiques</button>
            <button onClick={() => setView("stats")} className={`px-3 py-1 rounded ${view === "stats" ? "bg-cyan-600" : "bg-slate-700"}`}>📊 Statistiques</button>
          </nav>

          {view === "saisie" && (
            <FormulaireJournee
              user={user}
              db={db}
              onSaved={() => setView("carnet")}
              editData={editDay}
            />
          )}

          {view === "carnet" && (
            <CarnetDeBord
              user={user}
              db={db}
              data={historique}
              onEdit={(day) => {
                setEditDay(day);
                setView("saisie");
              }}
              onRefresh={() => {}}
            />
          )}

          {view === "graph" && <GraphiquesHebdo data={historique} />}

          {view === "stats" && <StatistiquesComparaisons data={historique} />}
        </>
      )}
    </div>
  );
}
