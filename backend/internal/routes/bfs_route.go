package routes

import (
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func BFSRoute(r *gin.Engine) {
	// r.GET("/bfs-shortest-recipe", handlers.BFSShortestRecipeHandler)
	r.GET("/bfs-tree", handlers.GraphTarget)
}
