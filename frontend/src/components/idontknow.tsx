"use client";

import { useState, useEffect, useRef } from "react";

export default function IDontKnow() {
	const [score, setScore] = useState(0);
	const [timeLeft, setTimeLeft] = useState(15);
	const [gameActive, setGameActive] = useState(false);
	const [prankStage, setPrankStage] = useState(0);
	const [glitching, setGlitching] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		audioRef.current = new Audio("/error.mp3");
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
			}
		};
	}, []);

	useEffect(() => {
		if (gameActive && timeLeft > 0 && prankStage === 0) {
			const timer = setTimeout(
				() => setTimeLeft((prev) => prev - 1),
				1000
			);
			return () => clearTimeout(timer);
		}
	}, [timeLeft, gameActive, prankStage]);

	useEffect(() => {
		if (gameActive && prankStage === 0) {
			const prankDelay = Math.floor(Math.random() * 3000) + 5000; // 5-8 seconds
			const timer = setTimeout(() => {
				setPrankStage(1);
				if (audioRef.current) {
					audioRef.current
						.play()
						.catch(() => console.log("Audio play prevented"));
				}
			}, prankDelay);
			return () => clearTimeout(timer);
		}
	}, [gameActive, prankStage]);

	useEffect(() => {
		if (prankStage === 1) {
			setGlitching(true);

			const timer = setTimeout(() => {
				setGlitching(false);
				setPrankStage(2);
			}, 2000);

			return () => clearTimeout(timer);
		}

		if (prankStage === 2) {
			const timer = setTimeout(() => {
				setPrankStage(3);
				setGlitching(true);
			}, 3000);

			return () => clearTimeout(timer);
		}

		if (prankStage === 3) {
			const timer = setTimeout(() => {
				setPrankStage(4);
				setGlitching(false);
			}, 4000);

			return () => clearTimeout(timer);
		}
	}, [prankStage]);

	useEffect(() => {
		if (!glitching) return;

		const glitchInterval = setInterval(() => {
			if (containerRef.current) {
				const xShift = Math.random() * 10 - 5;
				const yShift = Math.random() * 10 - 5;
				const rotation = Math.random() * 2 - 1;
				const scale = 0.98 + Math.random() * 0.04;

				containerRef.current.style.transform = `translate(${xShift}px, ${yShift}px) rotate(${rotation}deg) scale(${scale})`;

				if (Math.random() > 0.7) {
					document.body.style.filter = `hue-rotate(${
						Math.random() * 90
					}deg)`;
				} else {
					document.body.style.filter = "";
				}
			}
		}, 100);

		return () => {
			clearInterval(glitchInterval);
			if (containerRef.current) {
				containerRef.current.style.transform = "";
			}
			document.body.style.filter = "";
		};
	}, [glitching]);

	const handleMoleClick = () => {
		if (gameActive && prankStage === 0) {
			setScore((prev) => prev + 1);
		}
	};

	const startGame = () => {
		setScore(0);
		setTimeLeft(15);
		setGameActive(true);
		setPrankStage(0);
	};

	const resetPrank = () => {
		setPrankStage(0);
		setGameActive(false);
		setTimeLeft(15);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
	};

	if (prankStage === 0) {
		return (
			<div
				ref={containerRef}
				className="h-full flex flex-col items-center"
			>
				<div className="text-center mb-4">
					<h2 className="text-2xl font-bold text-blue-400">
						Element Whacker!
					</h2>
					<p className="text-white/70">
						Click all the elements that appear!
					</p>
				</div>

				<div className="flex justify-between w-full mb-4 px-4">
					<div className="bg-white/10 px-4 py-2 rounded-lg">
						<span className="font-bold">Score:</span> {score}
					</div>
					<div className="bg-white/10 px-4 py-2 rounded-lg">
						<span className="font-bold">Time:</span> {timeLeft}s
					</div>
				</div>

				{gameActive ? (
					<div className="flex-grow w-full flex flex-col justify-center">
						<div className="w-full grid grid-cols-3 gap-2 px-4">
							{Array(9)
								.fill(null)
								.map((_, i) => (
									<div
										key={i}
										className="aspect-[4/3] bg-black/40 rounded-lg flex items-center justify-center relative overflow-hidden mb-2"
									>
										{Math.random() > 0.7 && (
											<button
												onClick={handleMoleClick}
												className="absolute inset-1 bg-blue-500 hover:bg-blue-600 rounded-lg transform transition-transform hover:scale-105 flex items-center justify-center"
											>
												<span className="text-3xl">
													🧪
												</span>
											</button>
										)}
									</div>
								))}
						</div>
					</div>
				) : (
					<div className="flex-grow flex items-center justify-center">
						<button
							onClick={startGame}
							className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-xl font-bold transition-transform transform hover:scale-105"
						>
							{timeLeft === 0 ? "Play Again" : "Start Game"}
						</button>
						{timeLeft === 0 && (
							<p className="absolute mt-24 text-xl">
								Final Score: {score}
							</p>
						)}
					</div>
				)}
			</div>
		);
	}

	if (prankStage === 1) {
		return (
			<div
				ref={containerRef}
				className="h-full flex flex-col items-center justify-center bg-blue-900 relative overflow-hidden"
			>
				<div className="absolute inset-0 bg-red-900 opacity-80"></div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="text-white text-3xl font-mono animate-pulse">
						System Error
					</div>
				</div>
			</div>
		);
	}

	if (prankStage === 2) {
		return (
			<div
				ref={containerRef}
				className="h-full flex flex-col items-center justify-center bg-red-900 p-6"
			>
				<div className="text-red-300 text-4xl font-mono font-bold mb-6 animate-bounce">
					WARNING
				</div>
				<div className="bg-black/80 p-6 rounded-lg border border-red-500 max-w-lg">
					<h2 className="text-red-500 text-2xl font-bold mb-4 text-center">
						CRITICAL SYSTEM FAILURE
					</h2>
					<p className="text-white mb-2">User data compromised:</p>
					<pre className="text-green-400 font-mono text-xs overflow-hidden">
						{`> Accessing browser history...
> Downloading personal files...
> Webcam accessed...
> Starting remote broadcast...`}
					</pre>
				</div>
			</div>
		);
	}

	if (prankStage === 3) {
		return (
			<div
				ref={containerRef}
				className="h-full flex flex-col items-center justify-center bg-black"
			>
				<div className="text-red-600 text-6xl font-bold animate-ping mb-6">
					!
				</div>
				<div className="text-red-500 text-4xl font-mono font-bold mb-2 animate-pulse">
					SYSTEM FAILURE
				</div>
				<div className="text-white font-mono text-xl animate-bounce">
					All data will be erased
				</div>
			</div>
		);
	}
	return (
		<div
			ref={containerRef}
			className="h-full flex flex-col items-center justify-center p-6"
		>
			<div className="text-yellow-400 text-5xl mb-4">💀</div>
			<h2 className="text-red-600 text-3xl font-bold mb-2">
				You Have Been Hacked!
			</h2>
			<p className="text-white/70 text-center mb-6"></p>

			<div className="text-gray-400 font-mono text-sm mb-6 text-center">
				<p>No actual errors occurred.</p>
				<p>No data was accessed or compromised.</p>
				<p>This was just a prank!</p>
			</div>

			<button
				onClick={resetPrank}
				className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl text-xl font-bold transition-transform transform hover:scale-105"
			>
				Start Over
			</button>
		</div>
	);
}
