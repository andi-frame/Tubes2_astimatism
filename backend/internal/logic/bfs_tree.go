package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

func BuildBFSTree(target string, elementsGraph map[string][]models.RecipeType) *models.TreeNode {
	root := &models.TreeNode{
		Element: target,
	}

	visited := make(map[string]bool)
	visited[target] = true

	queue := []*models.TreeNode{root}

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]

		if IsBaseElement(curr.Element) {
			continue
		}

		recipes := elementsGraph[curr.Element]
		for _, recipe := range recipes {
			// Group recipe
			recipeNode := &models.TreeNode{
				Element: curr.Element,
				Parent:  curr,
			}

			// First ingredient
			child1 := &models.TreeNode{
				Element: recipe.Ingredient1,
				Parent:  recipeNode,
			}
			recipeNode.Children = append(recipeNode.Children, child1)

			// Second ingredient
			child2 := &models.TreeNode{
				Element: recipe.Ingredient2,
				Parent:  recipeNode,
			}
			recipeNode.Children = append(recipeNode.Children, child2)

			curr.Children = append(curr.Children, recipeNode)

			// Only queue unvisited non-base elements
			if !visited[recipe.Ingredient1] && !IsBaseElement(recipe.Ingredient1) {
				visited[recipe.Ingredient1] = true
				queue = append(queue, child1)
			}
			if !visited[recipe.Ingredient2] && !IsBaseElement(recipe.Ingredient2) {
				visited[recipe.Ingredient2] = true
				queue = append(queue, child2)
			}
		}
	}

	return root
}

func BuildLimitedBFSTree(target string, elementsGraph map[string][]models.RecipeType, limit int) *models.TreeNode {
	root := &models.TreeNode{
		Element: target,
	}

	visited := make(map[string]bool)
	visited[target] = true
	countPaths := 0

	queue := []*models.TreeNode{root}
	
	// Visit each node
	for len(queue) > 0 && countPaths < limit {
		curr := queue[0]
		queue = queue[1:]

		if IsBaseElement(curr.Element) {
			continue
		}

		recipes := elementsGraph[curr.Element]
		for _, recipe := range recipes {
			// Group recipe
			recipeNode := &models.TreeNode{
				Element: curr.Element,
				Parent:  curr,
			}

			// First ingredient
			child1 := &models.TreeNode{
				Element: recipe.Ingredient1,
				Parent:  recipeNode,
			}
			recipeNode.Children = append(recipeNode.Children, child1)

			// Second ingredient
			child2 := &models.TreeNode{
				Element: recipe.Ingredient2,
				Parent:  recipeNode,
			}
			recipeNode.Children = append(recipeNode.Children, child2)

			curr.Children = append(curr.Children, recipeNode)

			isChild1Base := IsBaseElement(child1.Element)
			isChild2Base := IsBaseElement(child2.Element)

			if isChild1Base && isChild2Base {
				countPaths++
				if countPaths >= limit {
					break
				}
			} else {
				if !visited[child1.Element] && !isChild1Base {
					visited[child1.Element] = true
					queue = append(queue, child1)
				}
				if !visited[child2.Element] && !isChild2Base {
					visited[child2.Element] = true
					queue = append(queue, child2)
				}
			}
		}
	}

	return root
}
