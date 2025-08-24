import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aquarium",
  description: "Three.js Journey Project"}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-night text-white w-full h-screen overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
