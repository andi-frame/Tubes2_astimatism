package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

// Top-Down Version:
// func GraphElements(recipes []models.RecipeType) map[string][]models.RecipeType {
// 	result := make(map[string][]models.RecipeType)
// 	for _, r := range recipes {
// 		result[r.Element] = append(result[r.Element], r)
// 	}
// 	return result
// }

func BuildGraph(recipes []models.RecipeType) map[models.PairElement]int {
	result := make(map[models.PairElement]int)
	for _, r := range recipes {
		pair := models.PairElement{
			Element1: r.IngredientId1,
			Element2: r.IngredientId2,
		}
		result[pair] = r.ElementId
	}
	return result
}

func IsBaseElement(id int) bool {
	base := map[int]bool{
		1: true, 2: true, 3: true, 4: true,
	}
	return base[id]
}
