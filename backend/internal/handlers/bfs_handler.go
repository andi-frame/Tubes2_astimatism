package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/logic"
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func LimitedBFSTree(ctx *gin.Context) {
	// If user already scraped recipes
	// hasScraped, err := ctx.Cookie("scraped")
	// if err != nil || hasScraped != "true" {
	// 	ctx.JSON(http.StatusUnauthorized, gin.H{"error": "You must scrape the data first"})
	// 	return
	// }

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

	// Build graph
	graph := logic.BuildGraph(recipes)

	// Build Tier Map
	tierMap := logic.BuildTierMap(recipes)

	// Get target
	targetId, err := strconv.Atoi(ctx.DefaultQuery("target", ""))
	if targetId == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Target element is required"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Problem when convert target to integer"})
		return
	}

	// Get limit
	limit, err := strconv.ParseUint(ctx.DefaultQuery("limit", ""), 10, 64)
	if limit == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Limit element is required"})
		return
	} else if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Problem when convert limit to integer"})
		return
	}

	result := logic.BuildLimitedBFSTree(targetId, graph, tierMap, limit)

	ctx.JSON(http.StatusOK, gin.H{
		"data": result,
	})
}
