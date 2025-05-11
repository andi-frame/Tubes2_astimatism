package logic

import (
	"slices"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
)

func BuildLimitedBFSTree(targetId int, elementsGraph map[int][]models.PairElement, tierMap map[int]int, limit int) *models.TreeNode {

	root := &models.TreeNode{
		Element: targetId,
		Visited: []int{targetId},
	}

	queue := []*models.TreeNode{root}

	// Visit each node
	for len(queue) > 0 && root.PossibleRecipes < limit {
		curr := queue[0]
		queue = queue[1:]

		if IsBaseElement(curr.Element) {
			continue
		}

		recipes := elementsGraph[curr.Element]
		currTier := tierMap[curr.Element]

		for _, recipe := range recipes {
			// Check Tier
			if currTier <= tierMap[recipe.Element1] || currTier <= tierMap[recipe.Element2] {
				continue
			}

			// Check infinite loop
			if slices.Contains(curr.Visited, recipe.Element1) || slices.Contains(curr.Visited, recipe.Element2) {
				continue
			}

			// First ingredient
			child1 := &models.TreeNode{
				Parent:  curr,
				Element: recipe.Element1,
				Visited: append(slices.Clone(curr.Visited), recipe.Element1),
			}
			if IsBaseElement(recipe.Element1) {
				child1.PossibleRecipes = 1
			}

			// Second ingredient
			child2 := &models.TreeNode{
				Parent:  curr,
				Element: recipe.Element2,
				Visited: append(slices.Clone(curr.Visited), recipe.Element2),
			}
			if IsBaseElement(recipe.Element2) {
				child2.PossibleRecipes = 1
			}

			curr.Children = append(curr.Children, &models.PairNode{
				Element1: child1,
				Element2: child2,
			})

			isChild1Base := IsBaseElement(child1.Element)
			isChild2Base := IsBaseElement(child2.Element)

			if isChild1Base && isChild2Base {
				calculatePossibleRecipes(curr)
			} else {
				if !isChild1Base {
					queue = append(queue, child1)
				}
				if !isChild2Base {
					queue = append(queue, child2)
				}
			}
		}
	}

	PruneTree(root)
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

	total := 0
	for _, pair := range node.Children {
		total += pair.Element1.PossibleRecipes * pair.Element2.PossibleRecipes
	}

	node.PossibleRecipes = total

	calculatePossibleRecipes(node.Parent)
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
