import type { Metadata } from "next";
import "./globals.css";

// 🚫 Removed Inter to fix Turbopack build error
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "paraverse",
  description: "Connecting the Unknown World.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Mapbox CSS via CDN */}
        <link
          rel="stylesheet"
          href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
        />
      </head>

      {/* Removed inter.className – kept your colour + theme */}
      <body className="bg-[#0B0C0E] text-white">
        {children}
      </body>
    </html>
  );
}

