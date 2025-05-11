package logic

// import (
// 	"slices"

// 	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
// )

// func BuildLimitedBFSTree(targetId int, graph map[models.PairElement]int, tierMap map[int]int, limit int) *models.TreeNode {
// 	baseElements := []int{1, 2, 3, 4}

// 	// Root as base elements
// 	root := &models.TreeNode{}
// 	for _, id := range baseElements {
// 		root.Elements = append(root.Elements, &models.RecipeNode{
// 			Element:     id,
// 			Ingredient1: nil,
// 			Ingredient2: nil,
// 		})
// 	}

// 	queue := []*models.TreeNode{root}
// 	targetCount := 0
// 	var targetTrees []*models.RecipeNode

// 	for len(queue) > 0 && targetCount < limit {
// 		currentNode := queue[0]
// 		queue = queue[1:]

// 		currentElements := make([]int, 0)
// 		for _, recipeNode := range currentNode.Elements {
// 			currentElements = append(currentElements, recipeNode.Element)
// 		}

// 		n := len(currentElements)
// 		for i := range n {
// 			for j := i; j < n; j++ {
// 				a := currentElements[i]
// 				b := currentElements[j]

// 				pair := models.PairElement{
// 					Element1: min(a, b),
// 					Element2: max(a, b),
// 				}

// 				resultId, ok := graph[pair]
// 				if !ok {
// 					continue
// 				}

// 				tierA, tierAExists := tierMap[pair.Element1]
// 				tierB, tierBExists := tierMap[pair.Element2]
// 				tierResult, tierResultExists := tierMap[resultId]

// 				if !tierAExists || !tierBExists || !tierResultExists {
// 					continue
// 				}

// 				if tierResult <= tierA || tierResult <= tierB {
// 					continue
// 				}

// 				skip := slices.Contains(currentElements, resultId)
// 				if skip {
// 					continue
// 				}

// 				child := &models.TreeNode{}
// 				ingredient1 := findNodeById(currentNode.Elements, pair.Element1)
// 				ingredient2 := findNodeById(currentNode.Elements, pair.Element2)

// 				node := &models.RecipeNode{
// 					Element:     resultId,
// 					Ingredient1: ingredient1,
// 					Ingredient2: ingredient2,
// 				}

// 				child.Elements = append(child.Elements, node)
// 				child.Elements = append(child.Elements, currentNode.Elements...)

// 				if resultId == targetId {
// 					alreadyExists := false
// 					for _, existing := range targetTrees {
// 						if isSameRecipeTree(existing, node) {
// 							alreadyExists = true
// 							break
// 						}
// 					}
// 					if alreadyExists {
// 						continue
// 					}

// 					targetCount++
// 					targetTrees = append(targetTrees, node)

// 					if targetCount >= limit {
// 						break
// 					}
// 				}

// 				currentNode.Children = append(currentNode.Children, child)
// 				queue = append(queue, child)
// 			}
// 		}
// 	}

// 	// Merge all target trees under a new root node
// 	if len(targetTrees) > 0 {
// 		merged := &models.TreeNode{
// 			Elements: targetTrees,
// 		}
// 		return merged
// 	}

// 	return root
// }

// func isSameRecipeTree(a, b *models.RecipeNode) bool {
// 	if a == nil && b == nil {
// 		return true
// 	}
// 	if a == nil || b == nil {
// 		return false
// 	}
// 	if a.Element != b.Element {
// 		return false
// 	}
// 	return (isSameRecipeTree(a.Ingredient1, b.Ingredient1) && isSameRecipeTree(a.Ingredient2, b.Ingredient2))
// }

// func findNodeById(nodes []*models.RecipeNode, id int) *models.RecipeNode {
// 	for _, node := range nodes {
// 		if node.Element == id {
// 			return node
// 		}
// 	}
// 	return &models.RecipeNode{Element: id}
// }

// func min(a, b int) int {
// 	if a < b {
// 		return a
// 	}
// 	return b
// }

// func max(a, b int) int {
// 	if a > b {
// 		return a
// 	}
// 	return b
// }
