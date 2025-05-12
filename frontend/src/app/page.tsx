"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import StartMenu from "@/components/start-menu";
import Window from "@/components/window";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showTreeWindow, setShowTreeWindow] = useState<boolean>(false);
  const [targetElement, setTargetElement] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("bfs");
  const [isMultiple, setIsMultiple] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSearchFocus = (): void => {
    setIsMenuOpen(true);
  };

  const handleShowRecipeTree = (
    element: string, 
    algorithm: string, 
    multiple: boolean, 
    resultLimit: number
  ): void => {
    setTargetElement(element);
    setAlgorithm(algorithm);
    setIsMultiple(multiple);
    setLimit(resultLimit);
    setShowTreeWindow(true);
    setLoading(true);

    // Mock loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
          <span className="text-white font-bold text-xl">A</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onClick={handleSearchFocus}
            onFocus={handleSearchFocus}
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

      {/* Start menu */}
      <StartMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        initialSearchTerm={searchQuery}
        onSearchChange={(term: string) => setSearchQuery(term)}
        focusSearchOnOpen={true}
        onShowRecipeTree={handleShowRecipeTree}
      />

      {/* Recipe Tree Window*/}
      {showTreeWindow && targetElement && (
        <Window
          title={`Recipe Tree for ${targetElement}`}
          isOpen={showTreeWindow}
          onClose={() => setShowTreeWindow(false)}
          width={650}
          height="auto"
        >
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="text-center">
                <p className="text-xl font-semibold mb-6">{targetElement}</p>
                <p className="text-gray-600 mb-4">
                  Recipe tree visualization for {targetElement} using {algorithm.toUpperCase()}.
                </p>
                <p className="text-gray-500 text-sm">
                  {isMultiple 
                    ? `Finding up to ${limit} recipe paths...` 
                    : 'Finding a single recipe path...'}
                </p>
              </div>
            )}
          </div>
        </Window>
      )}
    </div>
  );
}