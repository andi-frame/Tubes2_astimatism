package logic

import (
	"slices"
	"sync"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
)

func BuildLimitedBFSTree(targetId int, elementsGraph map[int][]models.PairElement, tierMap map[int]int, limit uint64) *models.TreeNode {
	root := &models.TreeNode{
		Element: targetId,
		Visited: []int{targetId},
	}

	queue := []*models.TreeNode{root}

	var mu sync.Mutex

	// Visit each node
	for len(queue) > 0 && root.PossibleRecipes < limit {
		var batch []*models.TreeNode
		mu.Lock()
		batchSize := min(len(queue), 10)
		batch = queue[:batchSize]
		queue = queue[batchSize:]
		mu.Unlock()

		// Process batch
		var wg sync.WaitGroup
		newNodesChan := make(chan *models.TreeNode, 100)

		for _, curr := range batch {
			if IsBaseElement(curr.Element) {
				continue
			}

			wg.Add(1)
			go func(currentNode *models.TreeNode) {
				defer wg.Done()

				var localNewNodes []*models.TreeNode

				recipes := elementsGraph[currentNode.Element]
				currTier := tierMap[currentNode.Element]

				for _, recipe := range recipes {
					// Check Tier
					if currTier <= tierMap[recipe.Element1] || currTier <= tierMap[recipe.Element2] {
						continue
					}

					// Check infinite loop
					mu.Lock()
					hasLoop := slices.Contains(currentNode.Visited, recipe.Element1) ||
						slices.Contains(currentNode.Visited, recipe.Element2)
					mu.Unlock()

					if hasLoop {
						continue
					}

					// First ingredient
					child1 := &models.TreeNode{
						Parent:  currentNode,
						Element: recipe.Element1,
						Visited: append(slices.Clone(currentNode.Visited), recipe.Element1),
					}
					isChild1Base := IsBaseElement(child1.Element)
					if isChild1Base {
						child1.PossibleRecipes = 1
					}

					// Second ingredient
					child2 := &models.TreeNode{
						Parent:  currentNode,
						Element: recipe.Element2,
						Visited: append(slices.Clone(currentNode.Visited), recipe.Element2),
					}
					isChild2Base := IsBaseElement(child2.Element)
					if isChild2Base {
						child2.PossibleRecipes = 1
					}

					// Create pair node
					pairNode := &models.PairNode{
						Element1: child1,
						Element2: child2,
					}

					// Add children to current node
					mu.Lock()
					currentNode.Children = append(currentNode.Children, pairNode)
					mu.Unlock()

					if isChild1Base && isChild2Base {
						mu.Lock()
						calculatePossibleRecipes(currentNode)
						mu.Unlock()
					} else {
						if !isChild1Base {
							localNewNodes = append(localNewNodes, child1)
						}
						if !isChild2Base {
							localNewNodes = append(localNewNodes, child2)
						}
					}
				}

				for _, node := range localNewNodes {
					newNodesChan <- node
				}
			}(curr)
		}

		go func() {
			wg.Wait()
			close(newNodesChan)
		}()

		// Collect all new nodes from channel
		var newNodes []*models.TreeNode
		for node := range newNodesChan {
			newNodes = append(newNodes, node)
		}

		// Add new nodes to queue
		mu.Lock()
		queue = append(queue, newNodes...)
		mu.Unlock()
	}

	mu.Lock()
	PruneTree(root)
	mu.Unlock()
	return root
}

func calculatePossibleRecipes(node *models.TreeNode) {
	if node == nil {
		return
	}

	if len(node.Children) == 0 {
		node.PossibleRecipes = 1
		return
	}

	var total uint64 = 0
	for _, pair := range node.Children {
		total += pair.Element1.PossibleRecipes * pair.Element2.PossibleRecipes
	}

	node.PossibleRecipes = total

	if node.Parent != nil {
		calculatePossibleRecipes(node.Parent)
	}
}

func PruneTree(node *models.TreeNode) {
	if node == nil || len(node.Children) == 0 {
		return
	}

	// Recursively prune
	prunedChildren := make([]*models.PairNode, 0)
	for _, pair := range node.Children {
		PruneTree(pair.Element1)
		PruneTree(pair.Element2)

		if pair.Element1.PossibleRecipes > 0 && pair.Element2.PossibleRecipes > 0 {
			prunedChildren = append(prunedChildren, pair)
		}
	}

	node.Children = prunedChildren
}
