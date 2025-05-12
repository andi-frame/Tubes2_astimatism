import React from 'react';
import dynamic from 'next/dynamic';
import p5Types from 'p5';

// Import p5 on client-side only
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false,
});

// Sample data for testing
const sampleData = {
  "tree": {
    "element": 32,
    "children": [
      {
        "element1": {
          "element": 3
        },
        "element2": {
          "element": 25,
          "children": [
            {
              "element1": {
                "element": 2
              },
              "element2": {
                "element": 11,
                "children": [
                  {
                    "element1": {
                      "element": 1
                    },
                    "element2": {
                      "element": 1
                    }
                  }
                ]
              }
            },
            {
              "element1": {
                "element": 1
              },
              "element2": {
                "element": 8,
                "children": [
                  {
                    "element1": {
                      "element": 2
                    },
                    "element2": {
                      "element": 3
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "element1": {
          "element": 22,
          "children": [
            {
              "element1": {
                "element": 1
              },
              "element2": {
                "element": 6,
                "children": [
                  {
                    "element1": {
                      "element": 3
                    },
                    "element2": {
                      "element": 3
                    }
                  }
                ]
              }
            }
          ]
        },
        "element2": {
          "element": 25,
          "children": [
            {
              "element1": {
                "element": 2
              },
              "element2": {
                "element": 11,
                "children": [
                  {
                    "element1": {
                      "element": 1
                    },
                    "element2": {
                      "element": 1
                    }
                  }
                ]
              }
            },
            {
              "element1": {
                "element": 1
              },
              "element2": {
                "element": 8,
                "children": [
                  {
                    "element1": {
                      "element": 2
                    },
                    "element2": {
                      "element": 3
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
};

// Node spacing settings
const nodeWidth = 60;
const nodeHeight = 40;
const horizontalSpacing = 150;
const verticalSpacing = 80;

interface RecipeTreeProps {
  data?: any; // Recipe tree data
}

const RecipeTree: React.FC<RecipeTreeProps> = ({ data = sampleData }) => {
  // Calculate the height and width required for the canvas based on tree depth and breadth
  const getTreeDimensions = (tree: any) => {
    const getDimensions = (node: any, depth: number = 0): { maxDepth: number; maxBreadth: number; leaves: number } => {
      if (!node) return { maxDepth: 0, maxBreadth: 0, leaves: 0 };
      
      // Handle leaf nodes
      if (!node.children) {
        return { maxDepth: depth, maxBreadth: 1, leaves: 1 };
      }
      
      // Process children
      let maxChildDepth = depth;
      let totalLeaves = 0;
      
      for (const child of node.children) {
        // Handle the special structure with element1 and element2
        if (child.element1 && child.element2) {
          const dim1 = getDimensions(child.element1, depth + 1);
          const dim2 = getDimensions(child.element2, depth + 1);
          
          maxChildDepth = Math.max(maxChildDepth, dim1.maxDepth, dim2.maxDepth);
          totalLeaves += dim1.leaves + dim2.leaves;
        } else {
          const dim = getDimensions(child, depth + 1);
          maxChildDepth = Math.max(maxChildDepth, dim.maxDepth);
          totalLeaves += dim.leaves;
        }
      }
      
      return { 
        maxDepth: maxChildDepth, 
        maxBreadth: Math.max(1, totalLeaves), 
        leaves: Math.max(1, totalLeaves) 
      };
    };
    
    const { maxDepth, maxBreadth } = getDimensions(tree);
    return {
      width: (maxDepth + 1) * horizontalSpacing + 100,
      height: maxBreadth * verticalSpacing + 100
    };
  };

  const dimensions = getTreeDimensions(data.tree);

  // p5.js setup function
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(dimensions.width, dimensions.height).parent(canvasParentRef);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.strokeWeight(2);
  };
  
  // p5.js draw function
  const draw = (p5: p5Types) => {
    p5.background(240);
    
    // Calculate node positions and draw the tree
    const drawTree = (
      node: any,
      x: number,
      y: number,
      availableWidth: number
    ): { nodeX: number; nodeY: number; width: number } => {
      if (!node) return { nodeX: x, nodeY: y, width: 0 };
      
      // Draw the current node
      p5.fill(255);
      p5.stroke(0);
      p5.rect(x - nodeWidth / 2, y - nodeHeight / 2, nodeWidth, nodeHeight, 8);
      p5.fill(0);
      p5.noStroke();
      p5.text(node.element || 0, x, y);
      
      if (!node.children) {
        return { nodeX: x, nodeY: y, width: nodeWidth };
      }
      
      // Calculate positions for children
      const childrenY: number[] = [];
      let childrenTotalHeight = 0;
      
      // Draw connections and calculate positions for children
      const nextX = x + horizontalSpacing;
      let currentY = y - (node.children.length * verticalSpacing) / 2 + verticalSpacing / 2;
      
      for (const child of node.children) {
        if (child.element1 && child.element2) {
          // Draw element1
          const e1Result = drawTree(child.element1, nextX, currentY, availableWidth / node.children.length);
          childrenY.push(e1Result.nodeY);
          
          // Draw connector line from parent to element1
          p5.stroke(0);
          p5.line(x + nodeWidth / 2, y, e1Result.nodeX - nodeWidth / 2, e1Result.nodeY);
          
          currentY += verticalSpacing;
          
          // Draw element2
          const e2Result = drawTree(child.element2, nextX, currentY, availableWidth / node.children.length);
          childrenY.push(e2Result.nodeY);
          
          // Draw connector line from parent to element2
          p5.stroke(0);
          p5.line(x + nodeWidth / 2, y, e2Result.nodeX - nodeWidth / 2, e2Result.nodeY);
          
          currentY += verticalSpacing;
        } else {
          // Handle regular nodes
          const childResult = drawTree(child, nextX, currentY, availableWidth / node.children.length);
          childrenY.push(childResult.nodeY);
          
          // Draw connector
          p5.stroke(0);
          p5.line(x + nodeWidth / 2, y, childResult.nodeX - nodeWidth / 2, childResult.nodeY);
          
          currentY += verticalSpacing;
        }
      }
      
      return { nodeX: x, nodeY: y, width: nodeWidth };
    };
    
    // Start drawing the tree at the center of the canvas
    drawTree(data.tree, horizontalSpacing, dimensions.height / 2, dimensions.width - horizontalSpacing * 2);
  };

  return (
    <div className="recipe-tree-container">
      <Sketch setup={setup} draw={draw} />
    </div>
  );
};

export default RecipeTree;