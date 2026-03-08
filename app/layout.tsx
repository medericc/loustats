import './globals.css';
import ServiceWorkerRegister from './ServiceWorkerRegister'; // 👈 ajout du composant client
import { Analytics } from "@vercel/analytics/react";
export const metadata = {
    title: "Louann LiveStats",
    description: "Les stats détaillées en direct.",
     manifest: "/manifest.json", 
    icons: {
        icon: "/favicon.ico", // Pour le favicon par défaut
        shortcut: "/favicon.ico", // Pour les navigateurs type iOS
        apple: "/apple-touch-icon.png", // iPhone/iPad
    },
    other: {
"apple-mobile-web-app-title": "LouSchedule",
},
    openGraph: {
      title: "Louann LiveStats",
      description: "Le play by play en direct.",
      url: "https://lou-livestats.vercel.app/",
      siteName: "Louann Stats",
      images: [
        {
          url: "https://lou-livestats.vercel.app/preview.jpg", // Mets une image propre ici !
          width: 1200,
          height: 630,
          alt: "LiveStats de Louann",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image", // ✅ Correction ici
      title: "Louann LiveStats",
      description: "Les stats détaillées en direct.",
      images: ["https://lou-livestats.vercel.app/preview.jpg"], // Même image que Open Graph
    },
  };
  



export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="fr">

<body className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">

<main className="container mx-auto mt-4">{children}</main>
 {/* Analytics */}
        <Analytics />

        {/* ✅ Enregistrement du Service Worker */}
        <ServiceWorkerRegister />
</body>
</html>
);
}