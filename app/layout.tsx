import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "MarineElect Simulation Engine",
  description: "Ship maneuvering, propulsion, and electrical simulation powered by ShipSIM physics engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lan