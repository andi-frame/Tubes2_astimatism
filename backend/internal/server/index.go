package server

import (
	"net/http"

	"fmt"
	"log"
	"time"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/coder/websocket"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	// Default routes
	r.GET("/", s.HelloWorldHandler)
	r.GET("/health", s.healthHandler)
	r.GET("/websocket", s.websocketHandler)

	// Routes
	routes.ScraperRoute(r)
	routes.BFSRoute(r)
	routes.DFSRoute(r)
	routes.MetaMapRoute(r)

	return r
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
}

func (s *Server) websocketHandler(c *gin.Context) {
	w := c.Writer
	r := c.Request
	socket, err := websocket.Accept(w, r, nil)

	if err != nil {
		log.Printf("could not open websocket: %v", err)
		_, _ = w.Write([]byte("could not open websocket"))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer socket.Close(websocket.StatusGoingAway, "server closing websocket")

	ctx := r.Context()
	socketCtx := socket.CloseRead(ctx)

	for {
		select {
		case <-socketCtx.Done():
			log.Println("Client closed the connection")
			return
		default:
			payload := fmt.Sprintf("server timestamp: %d", time.Now().UnixNano())
			err := socket.Write(socketCtx, websocket.MessageText, []byte(payload))
			if err != nil {
				log.Printf("Write failed: %v", err)
				return
			}
			time.Sleep(2 * time.Second)
		}
	}
}
