package handlers

import (
	"net/http"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/logic"
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type RecipeRequest struct {
	Recipes []models.RecipeType `json:"recipes"`
}

func MetaMap(ctx *gin.Context) {
	var req RecipeRequest

	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	metaMap := logic.BuildMetaMapFromRecipes(req.Recipes)

	ctx.JSON(http.StatusOK, gin.H{
		"data": metaMap,
	})
}
