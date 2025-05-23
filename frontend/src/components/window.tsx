"use client";

import { useState, useEffect, useRef, ReactNode } from "react";

interface WindowProps {
	title: string;
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	initialPosition?: { x: number; y: number };
	width?: number | string;
	height?: number | string;
	className?: string;
	minWidth?: number;
	minHeight?: number;
}

export default function Window({
	title,
	isOpen,
	onClose,
	children,
	initialPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
	width = 600,
	height = "auto",
	className = "",
	minWidth = 200,
	minHeight = 150,
}: WindowProps) {
	const [position, setPosition] = useState(initialPosition);
	const [size, setSize] = useState({
		width: typeof width === "number" ? width : parseInt(width) || 600,
		height:
			typeof height === "number"
				? height
				: height === "auto"
				? 400
				: parseInt(height) || 400,
	});
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState("");
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [isVisible, setIsVisible] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const [preMaximizeState, setPreMaximizeState] = useState({
		position,
		size,
	});

	const windowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [isOpen]);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.target instanceof Element && e.target.closest(".window-content"))
			return;
		setIsDragging(true);
		setDragStart({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
	};

	const handleResizeStart = (e: React.MouseEvent, direction: string) => {
		e.stopPropagation();
		e.preventDefault();
		setIsResizing(true);
		setResizeDirection(direction);
		setDragStart({
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleMaximizeToggle = () => {
		if (isMaximized) {
			setIsMaximized(false);
			setPosition(preMaximizeState.position);
			setSize(preMaximizeState.size);
		} else {
			setPreMaximizeState({ position, size });

			setIsMaximized(true);
			setPosition({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2,
			});
			setSize({
				width: window.innerWidth - 40,
				height: window.innerHeight - 40,
			});
		}
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging && !isMaximized) {
				setPosition({
					x: e.clientX - dragStart.x,
					y: e.clientY - dragStart.y,
				});
			} else if (isResizing && !isMaximized) {
				const dx = e.clientX - dragStart.x;
				const dy = e.clientY - dragStart.y;
				const windowElement = windowRef.current;
				if (!windowElement) return;

				let newWidth = size.width;
				let newHeight = size.height;
				let newX = position.x;
				let newY = position.y;

				if (resizeDirection.includes("e")) {
					newWidth = Math.max(minWidth, size.width + dx);
					newX = position.x + dx / 2;
				}

				if (resizeDirection.includes("s")) {
					newHeight = Math.max(minHeight, size.height + dy);
					newY = position.y + dy / 2;
				}

				if (resizeDirection.includes("w")) {
					newWidth = Math.max(minWidth, size.width - dx);
					newX = position.x + dx / 2;
				}

				if (resizeDirection.includes("n")) {
					newHeight = Math.max(minHeight, size.height - dy);
					newY = position.y + dy / 2;
				}

				setSize({ width: newWidth, height: newHeight });
				setPosition({ x: newX, y: newY });
				setDragStart({ x: e.clientX, y: e.clientY });
			}
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			setIsResizing(false);
		};

		if (isDragging || isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [
		isDragging,
		isResizing,
		dragStart,
		position,
		size,
		resizeDirection,
		minWidth,
		minHeight,
		isMaximized,
	]);

	if (!isVisible) return null;

	return (
		<div
			ref={windowRef}
			className={`fixed z-50 bg-black/80 backdrop-blur-xl text-white rounded-xl shadow-2xl overflow-hidden border border-white/10 ${className}`}
			style={{
				left: position.x,
				top: position.y,
				transform: "translate(-50%, -50%)",
				width: `${size.width}px`,
				height: `${size.height}px`,
			}}
		>
			{/* Window title bar */}
			<div
				className="px-4 py-3 flex justify-between items-center cursor-move border-b border-white/10"
				onMouseDown={handleMouseDown}
			>
				<h2 className="font-medium text-sm">{title}</h2>
				<div className="window-controls flex items-center space-x-2">
					<button
						onClick={handleMaximizeToggle}
						className="rounded-full w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
						title={isMaximized ? "Restore" : "Maximize"}
					>
						{isMaximized ? "□" : "▢"}
					</button>
					<button
						onClick={onClose}
						className="rounded-full w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
						title="Close"
					>
						<svg
							className="w-3 h-3"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Window content */}
			<div
				className="window-content p-6 overflow-auto styled-scrollbar"
				style={{
					height: "calc(100% - 40px)",
					maxHeight: isMaximized ? "none" : "70vh",
				}}
			>
				{children}
			</div>

			{/* Resize handles */}
			{!isMaximized && (
				<>
					<div
						className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "ne")}
					/>
					<div
						className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "se")}
					/>
					<div
						className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "sw")}
					/>
					<div
						className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "nw")}
					/>
					<div
						className="absolute top-0 left-1/2 w-1/3 h-4 -ml-[16.67%] cursor-n-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "n")}
					/>
					<div
						className="absolute bottom-0 left-1/2 w-1/3 h-4 -ml-[16.67%] cursor-n-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "s")}
					/>
					<div
						className="absolute left-0 top-1/2 h-1/3 w-4 -mt-[16.67%] cursor-w-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "w")}
					/>
					<div
						className="absolute right-0 top-1/2 h-1/3 w-4 -mt-[16.67%] cursor-e-resize z-50"
						onMouseDown={(e) => handleResizeStart(e, "e")}
					/>
				</>
			)}
		</div>
	);
}
