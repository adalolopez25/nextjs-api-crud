"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}