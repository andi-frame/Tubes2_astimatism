package main

import (
	"fmt"
	"net/http"

	"github.com/andi-frame/Tubes2_astimatism/backend/internal/server"
)

func main() {
	server := server.NewServer()

	err := server.ListenAndServe()
	if err != nil && err != http.ErrServerClosed {
		panic(fmt.Sprintf("http server error: %s", err))
	}
}
