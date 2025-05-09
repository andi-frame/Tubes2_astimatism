"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import RecipePath from "./recipe-path";

// Sample aja ya bang
const sampleElements = [
  "Air", "Earth", "Fire", "Water",
  "Dust", "Energy", "Land", "Lava", "Mist",
  "Mud", "Pressure", "Puddle", "Smoke", "Steam"
];

export default function StartMenu({ isOpen, onClose }) {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [targetElement, setTargetElement] = useState(null);
  const [isMultiple, setIsMultiple] = useState(false);
  const [limit, setLimit] = useState(1);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // For click detection
  const menuRef = useRef(null);

  // Animation state
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            setIsAnimating(true);
        })
      })
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // 300 is animation duration

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Search functionality
  const filteredElements = sampleElements.filter(element => 
    element.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Select element
  const handleElementClick = (element) => {
    setTargetElement(element);
    findRecipe(element);
  };

  // Find recipe, but still no connection to backend
  const findRecipe = async (targetElement) => {
    if (!targetElement) return;

    setLoading(true);
    setError("");

    // try {
    //   const response = await axios.get(`http://localhost:8080/${algorithm}`, {
    //     params: {
    //       target: targetElement,
    //       multiple: isMultiple,
    //       limit: isMultiple ? limit : 1
    //       algorithmType: algorithm
    //     },
    //   });
    //   setResults(response.data);
    // } catch (err) {
    //   console.error("Error fetching recipe path:", err);
    //   setError("Failed to find recipe path.");
    // } finally {
    //   setLoading(false);
    // }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && event.target === document.documentElement) {
        onClose();
      }
    };

    if (isOpen) {
      document.documentElement.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.documentElement.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isRendered) {
    return null;
  }

  return (
    <div 
      ref={menuRef}
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[700px] max-w-[95vw] 
        bg-black/80 backdrop-blur-xl text-white rounded-t-xl shadow-2xl overflow-hidden
        transition-transform duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search bar (again) at top */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Elements Area */}
      <div className="h-[400px] overflow-auto p-4">
        {/* Element grid */}
        {filteredElements.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
            {filteredElements.map((element) => (
              <button
                key={element}
                onClick={() => handleElementClick(element)}
                className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition-colors ${
                  targetElement === element ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10'
                }`}
              >
                <div className="w-10 h-10 mb-2 rounded-md bg-white/20 flex items-center justify-center">
                  {/* Using element first letter for icon (where is the icon for elements?) */}
                  <span className="text-xl">{element[0]}</span>
                </div>
                <span className="text-xs text-center">{element}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/70">
            No elements match your search
          </div>
        )}

        {/* Results display (Haven't finished yet...)*/}
        {targetElement && (
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Recipe for {targetElement}:
            </h3>

            {loading && <p className="text-white/70">Searching recipes...</p>}

            {error && <p className="text-red-400">{error}</p>}

            {results && !loading && (
              <>
                {results.paths ? (
                  <div className="space-y-4">
                    {results.paths.map((path, index) => (
                      <div key={index} className="bg-black/40 p-3 rounded">
                        <h4 className="text-sm font-medium mb-2">Recipe {index + 1}:</h4>
                        <RecipePath path={path} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/70">No recipe found for {targetElement}</p>
                )}

                <div className="mt-3 text-sm">
                  <p className="text-white/70">Found in {results.executionTime}ms using {algorithm.toUpperCase()}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Control bar (at the bottom) */}
      <div className="border-t border-white/10 p-4 grid grid-cols-3 gap-4 bg-black/40">
        {/* Single/Multiple Toggle */}
        <div>
          <p className="text-xs text-white/70 mb-1">Recipe Mode</p>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer select-none">
              <div className={`w-12 h-6 rounded-full flex items-center p-0.5 ${isMultiple ? 'bg-blue-600' : 'bg-white/30'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${isMultiple ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="ml-2 text-sm">
                {isMultiple ? 'Multiple Recipes' : 'Single Recipe'}
              </span>
            </label>
            <input 
              type="checkbox" 
              className="sr-only"
              checked={isMultiple}
              onChange={() => setIsMultiple(!isMultiple)}
            />
          </div>
        </div>

        {/* Limiter */}
        <div>
          <p className="text-xs text-white/70 mb-1">Maximum Results</p>
          <div className="flex items-center">
            <input
              type="number"
              min="1"
              max="10"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
              disabled={!isMultiple}
              className={`w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white focus:outline-none ${
                !isMultiple ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <span className="ml-2 text-sm text-white/70">recipes</span>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <p className="text-xs text-white/70 mb-1">Algorithm</p>
          <div className="flex items-center space-x-2">
            {['bfs', 'dfs', 'bidirectional'].map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`px-2 py-1 rounded text-xs uppercase font-medium ${
                  algorithm === algo ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}