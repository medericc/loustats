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
       { name: "South Dakota State", url: "https://sidearmstats.com/sdstate/wbball/game.json?detail=full" }
,
  { name: "Mary Hardin-Baylor", url: "/fixed/mary_hardin_baylor.json" }
];

    
const handleGenerate = async () => {
  // 🧠 Si "none" → on affiche la modale "Patiente"
  if (selectedLink === "none") {
    setModalMessage("Louann s’échauffe 🏀");
    setIsWaitingModalOpen(true);

    // ferme la modale après quelques secondes
    setTimeout(() => {
      setIsWaitingModalOpen(false);
    }, 3000);

    return; // ⛔ on sort sans lancer la récupération
  }

  const url = selectedLink || customUrl || "https://sidearmstats.com/rice/wbball/game.json?detail=full";

  try {
    // 🔁 Proxy pour contourner CORS
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    let data;

if (url.startsWith("/")) {
  // fichier local → pas besoin de proxy
  const response = await fetch(url);
  data = await response.json();
} else {
  // lien live → on passe par le proxy
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  data = await response.json();
}

  
    // ✅ Lecture via data.Plays
    const plays = data?.Plays;
    if (!plays || !Array.isArray(plays)) {
      console.error("Structure inattendue :", data);
      setModalMessage("Structure inattendue dans le JSON 😕");
      setIsModalOpen(true);
      return;
    }

    console.log("📊 Nombre total d’actions trouvées :", plays.length);
    console.log("👀 Exemple d’action :", plays[0]);

    // 🏀 Filtrage : actions de Battiston
    const playerName = "Battiston";
    const playerPlays = plays.filter((p) => {
      const combinedText = `
        ${p?.Player?.FirstName || ""} 
        ${p?.Player?.LastName || ""} 
        ${p?.Narrative || ""} 
        ${(p?.InvolvedPlayers || [])
          .map((ip: any) => `${ip.FirstName} ${ip.LastName}`)
          .join(" ")}
      `.toLowerCase();
      return combinedText.includes(playerName.toLowerCase());
    });

    console.log(`🎯 Actions trouvées pour ${playerName} : ${playerPlays.length}`);
    console.log(playerPlays.map((p) => p.Narrative));

    if (playerPlays.length === 0) {
      setModalMessage(`Aucune donnée trouvée pour ${playerName} 😅`);
      setIsModalOpen(true);
      return;
    }

    // 🧾 Formatage et découpe des segments
    const formattedData = playerPlays.flatMap((p) => {
      const period = p.Period?.toString() ?? "";
      const chrono =
        p.ClockDisplay ||
        (p.ClockSeconds !== undefined ? formatTime(p.ClockSeconds) : "");
      const score = p.Score
        ? `${p.Score.HomeTeam ?? ""}-${p.Score.VisitingTeam ?? ""}`
        : "";

      const segments = (p.Narrative || "")
        .split(";")
        .map((s: any) => s.trim())
        .filter(Boolean);

      const rows: string[][] = [];

      segments.forEach((seg: string) => {
        const segLower = seg.toLowerCase();

        if (!segLower.includes(playerName.toLowerCase())) return;

        if (
          segLower.includes(" in") ||
          segLower.includes(" out") ||
          segLower.startsWith("in ") ||
          segLower.startsWith("out ")
        )
          return;

        let type = "Autre";
        if (segLower.includes("jumper") || segLower.includes("layup") || segLower.includes("hook") || segLower.includes("tip"))
          type = "2pt";
        else if (segLower.includes("3pt") || segLower.includes("3-pointer") || segLower.includes("3 ptr"))
          type = "3pt";
        else if (segLower.includes("free throw") || segLower.includes("ft"))
          type = "1pt";
        else if (segLower.includes("rebound"))
          type = "rebound";
        else if (segLower.includes("assist"))
          type = "assist";
        else if (segLower.includes("turnover"))
          type = "turnover";
        else if (segLower.includes("foul"))
          type = "foul";
        else if (segLower.includes("steal"))
          type = "steal";
        else if (segLower.includes("block"))
          type = "block";

        if (type === "Autre") return;

        const success = segLower.includes("good") || segLower.includes("made");
        const missed = segLower.includes("miss");

        let successFlag = "0";
        if (type === "assist") successFlag = "1";
        else successFlag = missed ? "0" : success ? "1" : "0";

        rows.push([period, chrono, type, successFlag, score]);
      });

      return rows;
    });

    const cleanData = formattedData.filter((row) => row && row[2] !== "Autre");

    setCsvData(cleanData);
    setCsvGenerated(true);
  } catch (error) {
    console.error("Erreur dans handleGenerate:", error);
    setModalMessage("Erreur pendant le chargement des données 😅");
    setIsModalOpen(true);
  }
};









    
const generateCSV = (data: any[]): string => {
  let csv = 'Joueuse,Action,Période,Temps,Score\n';

  data.forEach((p) => {
    const player = `${p.Player.FirstName} ${p.Player.LastName}`;
    const action = `${p.Action} ${p.Type || ''}`.trim();
    const period = p.Period;
    const time = p.ClockSeconds + "s";
    const score =
      p.Score
        ? `${p.Score.HomeTeam}-${p.Score.VisitingTeam}`
        : "";

    csv += `${player},${action},${period},${time},${score}\n`;
  });

  return csv;
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
    
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
                <DialogHeader>
                    <DialogTitle className="text-center mb-4">⚠️ Erreur</DialogTitle>
                    <DialogDescription className="text-center mt-4">{modalMessage}</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    
        <Dialog open={isWaitingModalOpen} onOpenChange={setIsWaitingModalOpen}>
            <DialogContent className="w-[80%] max-w-xs rounded-lg shadow-lg bg-white dark:bg-gray-800 p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2 mb-2">⏳ Patiente</DialogTitle>
                    <DialogDescription className="text-center mt-2">{modalMessage}</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    
        <footer className="text-sm text-gray-900 mt-8">
          <a href="https://www.youtube.com/@fan_lucilej" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Produit par @fan_carlaleite
          </a>
        </footer>
      </div>
    );
}