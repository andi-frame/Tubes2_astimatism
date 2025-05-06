package logic

import "github.com/andi-frame/Tubes2_astimatism/backend/internal/models"

func GraphElements(recipes []models.RecipeType) map[string][]models.RecipeType {
	result := make(map[string][]models.RecipeType)
	for _, r := range recipes {
		result[r.Element] = append(result[r.Element], r)
	}
	return result
}

func IsBaseElement(name string) bool {
	base := map[string]bool{
		"Air": true, "Water": true, "Earth": true, "Fire": true,
	}
	return base[name]
}