package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/logic"
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func MetaMap(ctx *gin.Context) {
	// If user already scraped recipes
	hasScraped, err := ctx.Cookie("scraped")
	if err != nil || hasScraped != "true" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "You must scrape the data first"})
		return
	}

	// Read recipes from JSON file
	filePath := "data/recipes.json"
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read recipes file"})
		return
	}

	// Deserialize recipes
	var recipes []models.RecipeType
	if err := json.Unmarshal(fileBytes, &recipes); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unmarshal recipes"})
		return
	}

	metaMap := logic.BuildMetaMapFromRecipes(recipes)

	ctx.JSON(http.StatusOK, gin.H{
		"data": metaMap,
	})
}
