package main

import (
	"log"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	"go-socketio-chat-7f3d2/internal/app"
)

func main() {
	// Create a new Gin router
	router := gin.Default()

	// Create a new Socket.IO server
	server := socketio.NewServer(nil)

	// Create the app
	app := app.CreateApp(router, server)

	// Attach the Socket.IO server to the Gin router
	router.GET("/socket.io/*any", gin.WrapH(server))
	router.POST("/socket.io/*any", gin.WrapH(server))

	// Start the Socket.IO server
	go func() {
		if err := server.Serve(); err != nil {
			log.Fatalf("socketio listen error: %s\n", err)
		}
	}()
	defer server.Close()

	// Run the Gin server
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}