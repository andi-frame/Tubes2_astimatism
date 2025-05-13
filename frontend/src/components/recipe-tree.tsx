import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { fetchBFSSearch } from "@/lib/api/bfs_search";
import { useMetaMapStore } from "@/lib/store/map_store";
import { fetchDFSSearch } from "@/lib/api/dfs_search";

export interface TreeNode {
	element: number;
	children?: PairNode[];
}

export interface PairNode {
	element1: TreeNode;
	element2: TreeNode;
}

const emptyTree = {
	element: 0,
};

interface RecipeTreeProps {
	targetElement: string;
	limit: number;
	isMultiple: boolean;
	algorithm: string;
}

// Tree settings
const nodeWidth = 60;
const nodeHeight = 40;
const outerPadding = 50;
const verticalSpacing = 100;
const horizontalSpacing = 50;

const RecipeTree: React.FC<RecipeTreeProps> = ({
	targetElement,
	limit = 1,
	isMultiple,
	algorithm,
}) => {
	const [tree, setTree] = useState<TreeNode>(emptyTree);
	const svgRef = useRef<SVGSVGElement>(null);
	const imageCache = useRef<{ [key: string]: boolean }>({});
	const zoomBehaviorRef = useRef<d3.ZoomBehavior<
		SVGSVGElement,
		unknown
	> | null>(null);
	const initialScaleRef = useRef<number>(0.9);
	const metaMap = useMetaMapStore((state) => state.metaMap);

	useEffect(() => {
		const getTree = async () => {
			try {
				if (isMultiple && limit == 1) {
					console.log(
						"Error: limit should be more than one for multiple"
					);
					return;
				}

				if (algorithm == "bfs") {
					const res = await fetchBFSSearch(
						metaMap?.NameIdMap[targetElement] || 0,
						limit
					);
					setTree(res.data.Tree);
				} else {
					const res = await fetchDFSSearch(
						metaMap?.NameIdMap[targetElement] || 0,
						limit
					);
					setTree(res.data.Tree);
				}
			} catch (err) {
				console.error("Error fetching search");
				console.error(err);
			}
		};

		getTree();
	}, [algorithm, isMultiple, limit, metaMap?.NameIdMap, targetElement]);

	const getTreeDimension = useCallback((tree: TreeNode) => {
		const breadthByLevel: number[] = [];

		const countNodesAtLevel = (node: TreeNode, depth = 0) => {
			if (!node) return;

			if (breadthByLevel.length <= depth) {
				breadthByLevel[depth] = 0;
			}

			breadthByLevel[depth]++;

			if (node.children) {
				for (const child of node.children) {
					countNodesAtLevel(child.element1, depth + 1);
					countNodesAtLevel(child.element2, depth + 1);
				}
			}
		};

		countNodesAtLevel(tree);
		const maxBreadthCount = breadthByLevel.length
			? Math.max(...breadthByLevel)
			: 0;

		return {
			maxBreadth: maxBreadthCount,
			maxDepth: breadthByLevel.length - 1,
			breadthByLevel,
		};
	}, []);

	const dimension = getTreeDimension(tree);
	const canvasWidth = Math.max(
		nodeWidth * dimension.maxBreadth +
			(dimension.maxBreadth - 1) * horizontalSpacing +
			outerPadding * 2,
		800
	);
	const canvasHeight =
		nodeHeight * (dimension.maxDepth + 1) +
		verticalSpacing * dimension.maxDepth +
		outerPadding * 2;

	// Render
	useEffect(() => {
		if (!tree || !svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const zoomContainer = svg.append("g").attr("class", "zoom-container");
		const nodeGroup = zoomContainer.append("g").attr("class", "nodes");
		const linkGroup = zoomContainer.append("g").attr("class", "links");

		zoomBehaviorRef.current = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4])
			.on("zoom", (event) => {
				zoomContainer.attr("transform", event.transform);
			});

		svg.call(zoomBehaviorRef.current);

		initialScaleRef.current =
			Math.min(
				svgRef.current.clientWidth / canvasWidth,
				svgRef.current.clientHeight / canvasHeight,
				1
			) * 0.9;

		svg.on("dblclick.zoom", () => {
			if (!svgRef.current || !zoomBehaviorRef.current) return;

			const newTransform = d3.zoomIdentity
				.translate(svgRef.current.clientWidth / 2, 20)
				.scale(initialScaleRef.current)
				.translate(-canvasWidth / 2, 0);

			zoomBehaviorRef.current.transform(
				svg.transition().duration(750),
				newTransform
			);
		});

		if (zoomBehaviorRef.current) {
			svg.call(
				zoomBehaviorRef.current,
				d3.zoomIdentity
					.translate(svgRef.current.clientWidth / 2, 20)
					.scale(initialScaleRef.current)
					.translate(-canvasWidth / 2, 0)
			);
		}

		const nodeMap = new Map();
		const nodesByLevel: TreeNode[][] = [];

		const collectNodesByLevel = (node: TreeNode, depth = 0) => {
			if (!node) return;

			if (!nodesByLevel[depth]) nodesByLevel[depth] = [];
			nodesByLevel[depth].push(node);

			if (node.children) {
				for (const child of node.children) {
					collectNodesByLevel(child.element1, depth + 1);
					collectNodesByLevel(child.element2, depth + 1);
				}
			}
		};

		collectNodesByLevel(tree);

		for (let level = 0; level < nodesByLevel.length; level++) {
			const nodes = nodesByLevel[level];
			const levelWidth =
				nodes.length * (nodeWidth + horizontalSpacing) -
				horizontalSpacing;
			const startX = (canvasWidth - levelWidth) / 2;

			nodes.forEach((node, index) => {
				const xPosition =
					startX + index * (nodeWidth + horizontalSpacing);
				nodeMap.set(node, {
					x: xPosition + nodeWidth / 2,
					y: outerPadding + level * verticalSpacing,
				});
			});
		}

		const drawConnections = (node: TreeNode) => {
			if (!node || !node.children) return;

			for (const child of node.children) {
				const pos = nodeMap.get(node);
				const childPos1 = nodeMap.get(child.element1);
				const childPos2 = nodeMap.get(child.element2);
				const midPairPointX = (childPos1.x + childPos2.x) / 2;

				linkGroup
					.append("line")
					.attr("x1", pos.x)
					.attr("y1", pos.y + nodeHeight / 2)
					.attr("x2", midPairPointX)
					.attr("y2", pos.y + verticalSpacing * 0.75)
					.attr("stroke", "black")
					.attr("stroke-width", 2);

				linkGroup
					.append("line")
					.attr("x1", midPairPointX)
					.attr("y1", pos.y + verticalSpacing * 0.75)
					.attr("x2", midPairPointX)
					.attr("y2", childPos1.y - nodeHeight / 2)
					.attr("stroke", "black")
					.attr("stroke-width", 2);

				linkGroup
					.append("line")
					.attr("x1", childPos1.x + nodeWidth / 2)
					.attr("y1", childPos1.y)
					.attr("x2", childPos2.x - nodeWidth / 2)
					.attr("y2", childPos2.y)
					.attr("stroke", "black")
					.attr("stroke-width", 2);

				drawConnections(child.element1);
				drawConnections(child.element2);
			}
		};

		drawConnections(tree);

		const drawNodes = (node: TreeNode) => {
			if (!node) return;

			const pos = nodeMap.get(node);
			if (!pos) return;

			const nodeElement = nodeGroup
				.append("g")
				.attr(
					"transform",
					`translate(${pos.x - nodeWidth / 2}, ${
						pos.y - nodeHeight / 2
					})`
				);

			nodeElement
				.append("rect")
				.attr("width", nodeWidth)
				.attr("height", nodeHeight)
				.attr("rx", 8)
				.attr("fill", "white")
				.attr("stroke", "black");

			const iconUrl = metaMap?.IdImgMap[node.element];
			const iconSize = Math.floor(nodeHeight * 0.7);
			const iconY = nodeHeight / 2 - iconSize / 4;

			if (iconUrl) {
				if (!imageCache.current[iconUrl]) {
					imageCache.current[iconUrl] = true;
					const img = new Image();
					img.onload = () => {
						const pattern = svg
							.append("defs")
							.append("pattern")
							.attr("id", `img-${node.element}`)
							.attr("width", 1)
							.attr("height", 1)
							.attr("patternUnits", "objectBoundingBox");

						pattern
							.append("image")
							.attr("href", iconUrl)
							.attr("width", iconSize)
							.attr("height", iconSize)
							.attr("preserveAspectRatio", "xMidYMid slice");

						nodeElement
							.append("rect")
							.attr("x", nodeWidth / 2 - iconSize / 2)
							.attr("y", iconY - iconSize / 2)
							.attr("width", iconSize)
							.attr("height", iconSize)
							.attr("fill", `url(#img-${node.element})`);
					};
					img.src = iconUrl;
				} else {
					nodeElement
						.append("rect")
						.attr("x", nodeWidth / 2 - iconSize / 2)
						.attr("y", iconY - iconSize / 2)
						.attr("width", iconSize)
						.attr("height", iconSize)
						.attr("fill", `url(#img-${node.element})`);
				}
			} else {
				nodeElement
					.append("text")
					.attr("x", nodeWidth / 2)
					.attr("y", iconY)
					.attr("text-anchor", "middle")
					.attr("alignment-baseline", "middle")
					.attr("font-size", 16)
					.text(node.element || 0);
			}

			const iconName = metaMap?.IdNameMap[node.element];
			nodeElement
				.append("text")
				.attr("x", nodeWidth / 2)
				.attr("y", nodeHeight - 10)
				.attr("text-anchor", "middle")
				.attr("alignment-baseline", "middle")
				.attr("font-size", 12)
				.text(iconName || `#${node.element || 0}`);

			if (node.children) {
				for (const child of node.children) {
					drawNodes(child.element1);
					drawNodes(child.element2);
				}
			}
		};

		drawNodes(tree);
	}, [
		tree,
		metaMap,
		dimension.maxBreadth,
		dimension.maxDepth,
		canvasWidth,
		canvasHeight,
	]);

	const handleZoomIn = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newTransform = d3.zoomIdentity
			.translate(currentTransform.x, currentTransform.y)
			.scale(currentTransform.k * 1.3);

		zoomBehaviorRef.current.transform(
			svg.transition().duration(300),
			newTransform
		);
	}, []);

	const handleZoomOut = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const currentTransform = d3.zoomTransform(svg.node() as Element);
		const newTransform = d3.zoomIdentity
			.translate(currentTransform.x, currentTransform.y)
			.scale(currentTransform.k / 1.3);

		zoomBehaviorRef.current.transform(
			svg.transition().duration(300),
			newTransform
		);
	}, []);

	const handleResetZoom = useCallback(() => {
		if (!svgRef.current || !zoomBehaviorRef.current) return;

		const svg = d3.select(svgRef.current);
		const newTransform = d3.zoomIdentity
			.translate(svgRef.current.clientWidth / 2, 20)
			.scale(initialScaleRef.current)
			.translate(-canvasWidth / 2, 0);

		zoomBehaviorRef.current.transform(
			svg.transition().duration(750),
			newTransform
		);
	}, [canvasWidth]);

	return (
		<div className="w-full h-full relative">
			<svg
				ref={svgRef}
				width="100%"
				height="100%"
				className="bg-[#1a3842] cursor-move"
				style={{ touchAction: "none" }}
			/>

			{/* Zoom Controls */}
			<div className="absolute bottom-4 right-4 flex flex-col gap-2">
				<button
					className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30"
					onClick={handleZoomIn}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="11" y1="8" x2="11" y2="14" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</button>

				<button
					className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30"
					onClick={handleZoomOut}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
						<line x1="8" y1="11" x2="14" y2="11" />
					</svg>
				</button>

				<button
					className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30"
					onClick={handleResetZoom}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
					>
						<path d="M3 12h18M12 3v18" />
					</svg>
				</button>
			</div>
		</div>
	);
};

export default RecipeTree;
