package routes

import (
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func DFSRoute(r *gin.Engine) {
	// r.GET("/dfs-shortest-recipe", handlers.DFSShortestRecipeHandler)
	r.GET("/dfs-limited-tree", handlers.LimitedDFSTree)
}