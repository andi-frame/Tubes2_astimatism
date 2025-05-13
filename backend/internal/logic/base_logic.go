package logic

import (
	"sort"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
)

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

func BuildMetaMapFromRecipes(recipes []models.RecipeType) models.MetaMapType {
	meta := models.MetaMapType{
		ElementList: make([]string, 0),
		IdNameMap:   make(map[int]string),
		NameIdMap:   make(map[string]int),
		NameImgMap:  make(map[string]string),
		IdImgMap:    make(map[int]string),
		NameTierMap: make(map[string]int),
		IdTierMap:   make(map[int]int),
	}

	for _, recipe := range recipes {
		// Element
		if _, exists := meta.IdNameMap[recipe.ElementId]; !exists {
			meta.IdNameMap[recipe.ElementId] = recipe.Element
			meta.NameIdMap[recipe.Element] = recipe.ElementId
			meta.NameImgMap[recipe.Element] = recipe.ImgUrl
			meta.IdImgMap[recipe.ElementId] = recipe.ImgUrl
			meta.NameTierMap[recipe.Element] = recipe.Tier
			meta.IdTierMap[recipe.ElementId] = recipe.Tier
		}
	}

	for _, recipe := range recipes {
		// Ingredient 1
		if _, exists := meta.IdNameMap[recipe.IngredientId1]; !exists {
			meta.IdNameMap[recipe.IngredientId1] = recipe.Ingredient1
			meta.NameIdMap[recipe.Ingredient1] = recipe.IngredientId1
			meta.NameImgMap[recipe.Ingredient1] = recipe.ImgUrl1
			meta.IdImgMap[recipe.IngredientId1] = recipe.ImgUrl1
		}

		// Ingredient 2
		if _, exists := meta.IdNameMap[recipe.IngredientId2]; !exists {
			meta.IdNameMap[recipe.IngredientId2] = recipe.Ingredient2
			meta.NameIdMap[recipe.Ingredient2] = recipe.IngredientId2
			meta.NameImgMap[recipe.Ingredient2] = recipe.ImgUrl2
			meta.IdImgMap[recipe.IngredientId2] = recipe.ImgUrl2
		}
	}

	ids := make([]int, 0, len(meta.IdNameMap))
	for id := range meta.IdNameMap {
		ids = append(ids, id)
	}
	sort.Ints(ids)

	for _, id := range ids {
		if id == 0 {
			continue
		}
		meta.ElementList = append(meta.ElementList, meta.IdNameMap[id])
	}

	return meta
}
