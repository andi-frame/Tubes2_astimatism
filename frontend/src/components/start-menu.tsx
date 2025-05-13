"use client";

import { useMetaMapStore } from "@/lib/store/map_store";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";

interface StartMenuProps {
	isOpen: boolean;
	onClose: () => void;
	initialSearchTerm?: string;
	onSearchChange?: (term: string) => void;
	focusSearchOnOpen?: boolean;
	onShowRecipeTree: (
		element: string,
		algorithm: string,
		isMultiple: boolean,
		limit: number
	) => void;
}

// interface RecipeResult {
// 	paths: string[][];
// 	executionTime: number;
// }

export default function StartMenu({
	isOpen,
	onClose,
	initialSearchTerm = "",
	onSearchChange,
	focusSearchOnOpen = false,
	onShowRecipeTree,
}: StartMenuProps) {
	const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
	const [targetElement, setTargetElement] = useState<string | null>(null);
	const [isMultiple, setIsMultiple] = useState<boolean>(false);
	const [limit, setLimit] = useState<number>(1);
	const [algorithm, setAlgorithm] = useState<string>("bfs");
	// const [loading, setLoading] = useState<boolean>(false);
	// const [results, setResults] = useState<RecipeResult | null>(null);
	// const [error, setError] = useState<string>("");
	const [isRendered, setIsRendered] = useState<boolean>(false);
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	// const [showTreeWindow, setShowTreeWindow] = useState<boolean>(false);

	const menuRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

    // All Elements
    const metaMap = useMetaMapStore((state) => state.metaMap)

	useEffect(() => {
		setSearchTerm(initialSearchTerm);
	}, [initialSearchTerm]);

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		if (onSearchChange) {
			onSearchChange(value);
		}
	};

	useEffect(() => {
		if (isOpen) {
			setIsRendered(true);

			const timer = requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsAnimating(true);

					if (focusSearchOnOpen) {
						const focusTimer = setTimeout(() => {
							if (searchInputRef.current) {
								searchInputRef.current.focus();
							}
						}, 300);

						return () => clearTimeout(focusTimer);
					}
				});
			});

			return () => cancelAnimationFrame(timer);
		} else {
			setIsAnimating(false);

			const timer = setTimeout(() => {
				setIsRendered(false);
			}, 300);

			return () => clearTimeout(timer);
		}
	}, [isOpen, focusSearchOnOpen]);

    // Filter elements
	const filteredElements = metaMap?.ElementList.filter((element) =>
		element.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleElementClick = (element: string) => {
		setTargetElement(element);
		onShowRecipeTree(element, algorithm, isMultiple, limit);
	};


	// Outside click detection
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isRendered) {
		return null;
	}

	return (
		<>
			{isRendered && (
				<div
					ref={menuRef}
					className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[700px] max-w-[95vw] 
            bg-black/80 backdrop-blur-xl text-white rounded-t-xl shadow-2xl overflow-hidden
            transition-transform duration-300 ease-out ${
				isAnimating ? "translate-y-0" : "translate-y-full"
			}`}
				>
					{/* Search bar */}
					<div className="p-4 border-b border-white/10">
						<div className="relative">
							<input
								ref={searchInputRef}
								type="text"
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder="Search elements..."
								className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<svg
								className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</div>

					{/* Elements Area */}
					<div className="h-[400px] overflow-auto p-4 styled-scrollbar">
						{/* Element grid */}
						{filteredElements && filteredElements.length > 0 ? (
							<div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
								{filteredElements.map((element) => (
									<button
										key={element}
										onClick={() =>
											handleElementClick(element)
										}
										className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/20 transition-colors ${
											targetElement === element
												? "bg-blue-600 hover:bg-blue-700"
												: "bg-white/10"
										}`}
									>
										<div className="w-10 h-10 mb-2 rounded-md bg-white/20 flex items-center justify-center">
                                        <Image src={metaMap?.NameImgMap[element] || ""} alt={element + " image"} width={10} height={10} className="w-2/3" />
										</div>
										<span className="text-xs text-center">
											{element}
										</span>
									</button>
								))}
							</div>
						) : (
							<div className="text-center py-8 text-white/70">
								No elements match your search
							</div>
						)}
					</div>

					{/* Control bar */}
					<div className="border-t border-white/10 p-4 grid grid-cols-3 gap-4 bg-black/40">
						{/* Single/Multiple Toggle */}
						<div>
							<p className="text-xs text-white/70 mb-1">
								Recipe Mode
							</p>
							<div className="flex items-center">
								<button
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										const newIsMultiple = !isMultiple;
										setIsMultiple(newIsMultiple);

										if (isMultiple) {
											setLimit(1);
										}
									}}
									className="flex items-center cursor-pointer select-none"
								>
									<div
										className={`w-12 h-6 rounded-full flex items-center p-0.5 ${
											isMultiple
												? "bg-blue-600"
												: "bg-white/30"
										}`}
									>
										<div
											className={`w-5 h-5 rounded-full bg-white transform transition-transform ${
												isMultiple
													? "translate-x-6"
													: ""
											}`}
										></div>
									</div>
									<span className="ml-2 text-sm">
										{"Multiple Recipes"}
									</span>
								</button>
							</div>
						</div>

						{/* Limiter */}
						<div>
							<p className="text-xs text-white/70 mb-1">
								Maximum Results
							</p>
							<div className="flex items-center">
								<input
									type="number"
									min="1"
									max="10"
									value={limit}
									onChange={(
										e: ChangeEvent<HTMLInputElement>
									) =>
										setLimit(parseInt(e.target.value) || 1)
									}
									disabled={!isMultiple}
									className={`w-16 px-2 py-1 rounded bg-white/10 border border-white/20 text-white focus:outline-none ${
										!isMultiple
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
								/>
								<span className="ml-2 text-sm text-white/70">
									recipes
								</span>
							</div>
						</div>

						{/* Algorithm Selection */}
						<div>
							<p className="text-xs text-white/70 mb-1">
								Algorithm
							</p>
							<div className="flex items-center space-x-2">
								{["bfs", "dfs"].map((algo) => (
									<button
										key={algo}
										onClick={() => setAlgorithm(algo)}
										className={`px-2 py-1 rounded text-xs uppercase font-medium ${
											algorithm === algo
												? "bg-blue-600 text-white"
												: "bg-white/10 text-white/70 hover:bg-white/20"
										}`}
									>
										{algo}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
