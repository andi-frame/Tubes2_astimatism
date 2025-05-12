import React, { useRef } from "react";
import dynamic from "next/dynamic";
import p5Types from "p5";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
	ssr: false,
});

const imageCache: { [key: string]: any } = {};

// Sample data for testing
const sampleData = {
	tree: {
		element: 32,
		name: "Test name",
		icon: "https://cdn-icons-png.flaticon.com/512/684/684809.png",
		children: [
			{
				element1: {
					element: 3,
				},
				element2: {
					element: 25,
					children: [
						{
							element1: {
								element: 2,
							},
							element2: {
								element: 11,
								children: [
									{
										element1: {
											element: 1,
										},
										element2: {
											element: 1,
										},
									},
								],
							},
						},
						{
							element1: {
								element: 1,
							},
							element2: {
								element: 8,
								children: [
									{
										element1: {
											element: 2,
										},
										element2: {
											element: 3,
										},
									},
								],
							},
						},
					],
				},
			},
			{
				element1: {
					element: 22,
					children: [
						{
							element1: {
								element: 1,
							},
							element2: {
								element: 6,
								children: [
									{
										element1: {
											element: 3,
										},
										element2: {
											element: 3,
										},
									},
								],
							},
						},
					],
				},
				element2: {
					element: 25,
					children: [
						{
							element1: {
								element: 2,
							},
							element2: {
								element: 11,
								children: [
									{
										element1: {
											element: 1,
										},
										element2: {
											element: 1,
										},
									},
								],
							},
						},
						{
							element1: {
								element: 1,
							},
							element2: {
								element: 8,
								children: [
									{
										element1: {
											element: 2,
										},
										element2: {
											element: 3,
										},
									},
								],
							},
						},
					],
				},
			},
		],
	},
};

// Tree settings
const nodeWidth = 60;
const nodeHeight = 40;
const outerPadding = 50;
const verticalSpacing = 100;
const horizontalSpacing = 50;

interface RecipeTreeProps {
	data?: any;
}

const RecipeTree: React.FC<RecipeTreeProps> = ({ data = sampleData }) => {
	const imagesLoaded = useRef<{ [key: string]: boolean }>({});
	const p5Instance = useRef<p5Types | null>(null);

	const getTreeDimension = (tree: any) => {
		const breadthByLevel: number[] = [];

		const countNodesAtLevel = (node: any, depth = 0) => {
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

		const maxBreadthCount = Math.max(...breadthByLevel);

		return {
			maxBreadth: maxBreadthCount,
			maxDepth: breadthByLevel.length - 1,
			breadthByLevel,
		};
	};

	const dimension = getTreeDimension(data.tree);
	const canvasWidth =
		nodeWidth * dimension.maxBreadth +
		(dimension.maxBreadth - 1) * horizontalSpacing +
		outerPadding * 2;
	const canvasHeight =
		nodeHeight * (dimension.maxDepth + 1) +
		verticalSpacing * dimension.maxDepth +
		outerPadding * 2;

	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5Instance.current = p5;
		p5.createCanvas(canvasWidth, canvasHeight).parent(canvasParentRef);
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.strokeWeight(2);
		p5.imageMode(p5.CENTER);
	};

	const draw = (p5: p5Types) => {
		p5.background(26, 56, 66);

		const drawNode = (p5: p5Types, node: any, x: number, y: number) => {
			p5.fill(255);
			p5.stroke(0);
			p5.rect(
				x - nodeWidth / 2,
				y - nodeHeight / 2,
				nodeWidth,
				nodeHeight,
				8
			);

			const iconSize = Math.floor(nodeHeight * 0.7);
			const iconY = y - iconSize / 4;

			// Draw Icon
			if (node.icon) {
				if (!imageCache[node.icon]) {
					if (!imagesLoaded.current[node.icon]) {
						imagesLoaded.current[node.icon] = true;
						imageCache[node.icon] = p5.loadImage(
							node.icon,
							() => {
								if (p5Instance.current)
									p5Instance.current.redraw();
							},
							() => {
								console.error(
									"Failed to load image: ${node.icon}"
								);
							}
						);
					}
				} else {
					p5.image(
						imageCache[node.icon],
						x - iconSize / 2,
						iconY - iconSize / 2,
						iconSize,
						iconSize
					);
				}
			} else {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(16);
				p5.text(node.element || 0, x, iconY);
			}

			// Draw Name
			if (node.name) {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(12);
				p5.text(node.name, x, y + nodeHeight / 2 - 10);
			} else {
				p5.fill(0);
				p5.noStroke();
				p5.textSize(12);
				p5.text(`#${node.element || 0}`, x, y + nodeHeight / 2 - 10);
			}
		};

		const nodeMap = new Map();

		const assignPositions = (node: any, depth = 0, index = 0) => {
			if (!node) return;

			const nodesByLevel: any[][] = [];
			const collectNodesByLevel = (node: any, depth = 0) => {
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

			collectNodesByLevel(data.tree);

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
		};

		assignPositions(data.tree);

		const drawTree = (node: any) => {
			if (!node) return;

			const pos = nodeMap.get(node);
			drawNode(p5, node, pos.x, pos.y);

			if (node.children) {
				for (const child of node.children) {
					const childPos1 = nodeMap.get(child.element1);
					const childPos2 = nodeMap.get(child.element2);
					const midPairPointX = (childPos1.x + childPos2.x) / 2;

					p5.stroke(0);
					p5.line(
						pos.x,
						pos.y + nodeHeight / 2,
						midPairPointX,
						pos.y + verticalSpacing * 0.75
					);

					p5.stroke(0);
					p5.line(
						midPairPointX,
						pos.y + verticalSpacing * 0.75,
						midPairPointX,
						childPos2.y
					);

					p5.stroke(0);
					p5.line(
						childPos1.x + nodeWidth / 2,
						childPos1.y,
						childPos2.x - nodeWidth / 2,
						childPos2.y
					);

					drawTree(child.element1);
					drawTree(child.element2);
				}
			}
		};

		drawTree(data.tree);
	};

	return (
		<div className="flex justify-center items-center w-full h-full">
			<Sketch setup={setup} draw={draw} />
		</div>
	);
};

export default RecipeTree;
