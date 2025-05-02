package routes

import (
	"github.com/andi-frame/Tubes2_astimatism/backend/internal/server/handlers"
	"github.com/gin-gonic/gin"
)

func ScraperRoute(r *gin.Engine) {
	r.GET("/scraper", handlers.ScrapeHandler)
}
