"use client";

import { useState } from "react";
import Image from "next/image";
import StartMenu from "@/components/start-menu";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col relative overflow-hidden"
      style={{ backgroundImage: "url('/wallpaper.jpg')" }}
    >
      {/* windows taskbar */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
        {/* Logo/Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all transform hover:scale-110"
        >
          <span className="text-white font-bold text-xl">A</span> {/* This is for the button logo, A is for astimatism or alchemy (whatever). But, better to find a logo */}
        </button>
        
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search elements..."
            className="pl-3 pr-8 py-1.5 rounded-full bg-white/10 border border-white/20 text-white w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20"
          />
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* This is to open the control panel (The start menu-like component) */}
      <StartMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      {/* This is actually the default footer for credits. But it blocks the start menu and I have another idea */}
      {/* We can create a component that looks like an app on the desktop. If clicked, it will show a window for credits */}
      {/* We can also add other things for fun like easter egg or anything really. */}
      {/* <footer className="p-4 text-center text-white/70 text-sm absolute bottom-0 w-full bg-gradient-to-t from-black/20 to-transparent">
        <p>Little Alchemy 2 Recipe Finder - Created by Team Astimatism</p>
      </footer> */}
    </div>
  );
}