package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

/*
	Graph used for Depth First Search 
	Output is
	map<id, vector<pair<id,id>>
*/
func BuildGraphDFS(recipes []models.RecipeType) map[int][]models.PairElement {
	result := make(map[int][]models.PairElement)
	for _, r := range recipes {
		pair := models.PairElement{
			Element1: r.IngredientId1,
			Element2: r.IngredientId2,
		}
		result[r.ElementId] = append(result[r.ElementId], pair)
	}
	return result
}

// Bottom-Up Version:
// func BuildGraph(recipes []models.RecipeType) map[models.PairElement]int {
// 	result := make(map[models.PairElement]int)
// 	for _, r := range recipes {
// 		pair := models.PairElement{
// 			Element1: r.IngredientId1,
// 			Element2: r.IngredientId2,
// 		}
// 		result[pair] = r.ElementId
// 	}
// 	return result
// }

// Top-Down Version:
func BuildGraph(recipes []models.RecipeType) map[int][]models.PairElement {
	result := make(map[int][]models.PairElement)
	for _, r := range recipes {
		pair := models.PairElement{
			Element1: r.IngredientId1,
			Element2: r.IngredientId2,
		}
		result[r.ElementId] = append(result[r.ElementId], pair)
	}
	return result
}

func BuildElementMetaMap(recipes []models.RecipeType) map[int]models.ElementMeta {
	meta := make(map[int]models.ElementMeta)
	for _, r := range recipes {
		if _, exists := meta[r.ElementId]; !exists {
			meta[r.ElementId] = models.ElementMeta{
				Name:   r.Element,
				ImgUrl: r.ImgUrl,
				Tier:   r.Tier,
			}
		}
	}
	return meta
}



func IsBaseElement(id int) bool {
	base := map[int]bool{
		1: true, 2: true, 3: true, 4: true,
	}
	return base[id]
}

func BuildTierMap(recipes []models.RecipeType) map[int]int {
	tierMap := make(map[int]int)

	for _, recipe := range recipes {
		tierMap[recipe.ElementId] = recipe.Tier
	}

	return tierMap
}

func BuildIdMap(recipes []models.RecipeType) map[string]int {
	idMap := make(map[string]int)

	for _, recipe := range recipes {
		idMap[recipe.Element] = recipe.ElementId
	}

	return idMap
}
