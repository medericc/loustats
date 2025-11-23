'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from 'react';

import VideoHeader from './components/VideoHeader';
import InputForm from './components/InputForm';
import MatchTable from './components/MatchTable';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface MatchAction {
    period: string;
    gt: string; // Game time
    actionType: string;
    success: boolean;
    s1: string; // Score team 1
    s2: string; // Score team 2
    player: string; // Nom du joueur
    familyName: string;
}

interface MatchData {
    pbp: MatchAction[]; // Play-by-play data
}
// Convertit les secondes en format mm:ss
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default function Home() {
    const [csvGenerated, setCsvGenerated] = useState(false);
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [selectedLink, setSelectedLink] = useState<string>(''); // État pour le lien sélectionné
    const [customUrl, setCustomUrl] = useState(''); // État pour l'URL personnalisée
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);

   const matchLinks = [
{ name: "Incarnate Word", url: "/api/espn?gameId=401809052" } ,
      { name: "Princeton", url: "/api/espn?gameId=401827784" }
,

        { name: "Middle Tennessee", url: "/api/espn?gameId=401825071" }
,
      { name: "Houston UH", url: "/api/espn?gameId=401822211" }
,
       { name: "South Dakota State", url: "/api/espn?gameId=401825070" }
];

    
// 🔁 Fonction principale
// 🔁 Fonction principale
const handleGenerate = async () => {
  // Si aucun match choisi
  if (selectedLink === "none") {
    setModalMessage("Louann s’échauffe 🏀");
    setIsWaitingModalOpen(true);
    setTimeout(() => setIsWaitingModalOpen(false), 3000);
    return;
  }

  const url = selectedLink || customUrl || "https://sidearmstats.com/rice/wbball/game.json?detail=fu";

  try {
    let response;
    if (url.startsWith("/")) {
      response = await fetch(url); // API interne (pas de CORS)
    } else {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl);
    }

    if (!response.ok) {
      // ⚠️ Cas où la requête échoue (404, 500, etc.)
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();

    // 🧩 Accepte à la fois un tableau brut ou data.Plays
    const plays = Array.isArray(data)
      ? data
      : Array.isArray(data?.Plays)
      ? data.Plays
      : [];

    if (!plays.length) {
      console.error("Aucune donnée trouvée :", data);
      // 👉 Ici on affiche aussi le message “Louann s’échauffe”
      setModalMessage("Louann s’échauffe 🏀");
      setIsWaitingModalOpen(true);
      setTimeout(() => setIsWaitingModalOpen(false), 3000);
      return;
    }

    console.log("✅ Données ESPN récupérées :", plays.length, "actions");
    console.log("👀 Exemple :", plays[0]);

    setCsvData(plays);
    setCsvGenerated(true);

  } catch (error) {
    console.error("Erreur dans handleGenerate:", error);
    // 👉 Si erreur réseau ou JSON invalide
    setModalMessage("Louann s’échauffe 🏀");
    setIsWaitingModalOpen(true);
    setTimeout(() => setIsWaitingModalOpen(false), 3000);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-12 gap-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <VideoHeader className="absolute top-0 left-0 w-full" />

      <main className="flex flex-col items-center gap-6 w-full max-w-lg sm:max-w-2xl md:max-w-4xl">
        <Select value={selectedLink} onValueChange={setSelectedLink}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionne un match" />
          </SelectTrigger>
          <SelectContent>
            {matchLinks.map((link) => (
              <SelectItem key={link.url} value={link.url}>
                {link.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <InputForm 
          value={customUrl} 
          onChange={(e) => setCustomUrl(e.target.value)} 
          onGenerate={handleGenerate} 
        />

        {csvGenerated && (
          <div className="w-full overflow-x-auto">
            <MatchTable data={csvData} />
          </div>
        )}
      </main>

      {/* ⚠️ Modale d'erreur */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">⚠️ Erreur</DialogTitle>
            <DialogDescription className="text-center mt-4">{modalMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* ⏳ Modale d’attente */}
      <Dialog open={isWaitingModalOpen} onOpenChange={setIsWaitingModalOpen}>
        <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 mb-2">⏳ Patiente</DialogTitle>
            <DialogDescription className="text-center mt-2">{modalMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <footer className="text-sm text-gray-900 mt-8">
        <a
          href="https://www.youtube.com/@fan_lucilej"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Produit par @fan_carlaleite
        </a>
      </footer>
    </div>
  );
}
