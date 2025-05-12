package routes

import (
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func MetaMapRoute(r *gin.Engine) {
	r.GET("/meta-map", handlers.MetaMap)
}
