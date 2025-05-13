"use client";

import { useState, ChangeEvent, useEffect, JSX } from "react";
import Image from "next/image";
import StartMenu from "@/components/start-menu";
import Window from "@/components/window";
import RecipeTree from "@/components/recipe-tree";
import { fetchScraperData } from "@/lib/api/scrapper";
import { useScraperStore } from "@/lib/store/scraper_store";
import FullPageLoader from "@/components/FullPageLoader";
import { useMetaMapStore } from "@/lib/store/map_store";
import { fetchMetaMap } from "@/lib/api/meta_map";
import { useImagePreloader } from "@/components/image-preloader";
import CreditsApp from "@/components/credits";
import YouTubeApp from "@/components/video";
import IDontKnow from "@/components/idontknow";
import DesktopIcon from "@/components/desktop-icon";
import RickApp from "@/components/rick";

type WindowType = {
	id: string;
	title: string;
	component: JSX.Element;
	isOpen: boolean;
};

export default function Home() {
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [showTreeWindow, setShowTreeWindow] = useState<boolean>(false);
	const [targetElement, setTargetElement] = useState<string | null>(null);
	const [algorithm, setAlgorithm] = useState<string>("bfs");
	const [isMultiple, setIsMultiple] = useState<boolean>(false);
	const [limit, setLimit] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [fullLoading, setFullLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	// TODO: implement toaster
	// TODO: change loading animation

	// Scraper and Meta Map store
	const scrapData = useScraperStore((state) => state.scrapData);
	const setScrapData = useScraperStore((state) => state.setScrapData);
	const metaMap = useMetaMapStore((state) => state.metaMap);
	const setMetaMap = useMetaMapStore((state) => state.setMetaMap);
	const { loaded: imagesLoaded, progress: imageLoadProgress } =
		useImagePreloader();
	const [windows, setWindows] = useState<WindowType[]>([
		{
			id: "credits",
			title: "Credits",
			component: <CreditsApp />,
			isOpen: false,
		},
		{
			id: "youtube",
			title: "Video Showcase",
			component: <YouTubeApp />,
			isOpen: false,
		},
		{
			id: "idk",
			title: "???",
			component: <IDontKnow />,
			isOpen: false,
		},
		{
			id: "rickroll",
			title: "You have been rick rolled",
			component: <RickApp />,
			isOpen: false,
		},
	]);

	const handleLaunchApp = (id: string) => {
		setWindows((prev) =>
			prev.map((win) => (win.id === id ? { ...win, isOpen: true } : win))
		);
	};

	const handleCloseWindow = (id: string) => {
		setWindows((prev) =>
			prev.map((win) => (win.id === id ? { ...win, isOpen: false } : win))
		);
	};

	useEffect(() => {
		const getData = async () => {
			try {
				if (scrapData === null) {
					setFullLoading(true);
					const res = await fetchScraperData();
					setScrapData(res.data);
					setFullLoading(false);
				}
			} catch (err) {
				console.error("Error fetching scraper data");
				console.error(err);
			}
		};

		getData();
	}, [metaMap, scrapData, setMetaMap, setScrapData]);

	useEffect(() => {
		const getMap = async () => {
			try {
				if (metaMap === null && scrapData !== null) {
					const res = await fetchMetaMap(scrapData);
                    if (res.error) {
                        setError(res.error.message)
                    }
					setMetaMap(res.data);
				}
			} catch (err) {
				console.error("Error fetching meta map data");
				console.error(err);
			}
		};

		getMap();
	}, [metaMap, scrapData, setMetaMap]);

	const handleSearchFocus = (): void => {
		setIsMenuOpen(true);
	};

	const isLoading = fullLoading || !imagesLoaded;

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

	if (isLoading) {
		return <FullPageLoader progress={imageLoadProgress} />;
	}

	return (
		<>
			{fullLoading && <FullPageLoader />}
			<div
				className="min-h-screen bg-cover bg-center flex flex-col relative overflow-hidden"
				style={{ backgroundImage: "url('/lantern.jpg')" }}
			>
				{/* Desktop Icons */}
				<div className="grid grid-cols-1 gap-6 p-8 absolute top-0 left-0">
					<DesktopIcon
						id="credits"
						icon="/credits.svg"
						label="Credits"
						onLaunch={handleLaunchApp}
					/>
					<DesktopIcon
						id="youtube"
						icon="/youtube.svg"
						label="Video"
						onLaunch={handleLaunchApp}
					/>
					<DesktopIcon
						id="idk"
						icon="/idk.jpeg"
						label="???"
						onLaunch={handleLaunchApp}
					/>
					<DesktopIcon
						id="rickroll"
						icon="/youtube.svg"
						label="video?"
						onLaunch={handleLaunchApp}
					/>
				</div>
				{/* windows taskbar */}
				<div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-2 rounded-full shadow-lg">
					{/* Logo/Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all transform hover:scale-110"
					>
						<Image
							src="/start-logo.svg"
							alt="eye icon"
							width={24}
							height={24}
						/>
					</button>

					{/* Search Bar */}
					<div className="relative">
						<input
							type="text"
							placeholder="Search elements..."
							value={searchQuery}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								setSearchQuery(e.target.value)
							}
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
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
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

				{/* App windows */}
				{windows.map(
					(win) =>
						win.isOpen && (
							<Window
								key={win.id}
								title={win.title}
								isOpen={win.isOpen}
								onClose={() => handleCloseWindow(win.id)}
								width={800}
								height={600}
								initialPosition={{
									x:
										window.innerWidth / 2 +
										(Math.random() * 100 - 50),
									y:
										window.innerHeight / 2 +
										(Math.random() * 100 - 50),
								}}
							>
								{win.component}
							</Window>
						)
				)}

				{/* Recipe Tree Window*/}
				{showTreeWindow && targetElement && (
					<Window
						title={`Recipe Tree for ${targetElement}`}
						isOpen={showTreeWindow}
						onClose={() => setShowTreeWindow(false)}
						width={800}
						height={600}
						minWidth={400}
						minHeight={300}
					>
						<div className="min-h-[400px]">
							{loading ? (
								<div className="flex justify-center items-center h-64">
									<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
								</div>
							) : error ? (
								<div className="text-red-500 text-center py-4">
									{error}
								</div>
							) : (
								<div className="text-center">
									<h1 className="text-4xl font-bold mb-8">
										Recipe Tree Visualizer
									</h1>
									<div className="w-full h-[600px] flex justify-center">
										<RecipeTree
											targetElement={targetElement}
											limit={limit}
											isMultiple={isMultiple}
											algorithm={algorithm}
										/>
									</div>
									<p className="text-xl font-semibold mb-6">
										{targetElement}
									</p>
									<p className="text-gray-600 mb-4">
										Recipe tree visualization for{" "}
										{targetElement} using{" "}
										{algorithm.toUpperCase()}.
									</p>
								</div>
							)}
						</div>
					</Window>
				)}
			</div>
		</>
	);
}
