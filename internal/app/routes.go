package app

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/swaggo/gin-swagger"
	"github.com/swaggo/gin-swagger/swaggerFiles"
)

// @title Go SocketIO Chat API
// @version 1.0
// @description This is a chat application API using Go and SocketIO.
// @host localhost:8080
// @BasePath /

// IndexHandler godoc
// @Summary Login form to enter a room
// @Description Renders the login form or processes the form submission
// @Tags chat
// @Accept json
// @Produce json
// @Param name formData string false "User's name"
// @Param room formData string false "Chat room name"
// @Success 200 {string} string "OK"
// @Failure 400 {object} string "Bad Request"
// @Router / [get,post]
func IndexHandler(c *gin.Context) {
	if c.Request.Method == http.MethodPost {
		var form LoginForm
		if err := c.ShouldBind(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if form.Validate() {
			c.SetCookie("name", form.Name, 3600, "/", "", false, true)
			c.SetCookie("room", form.Room, 3600, "/", "", false, true)
			c.Redirect(http.StatusFound, "/chat")
			return
		}
	}

	name, _ := c.Cookie("name")
	room, _ := c.Cookie("room")
	c.HTML(http.StatusOK, "index.html", gin.H{
		"name": name,
		"room": room,
	})
}

// ChatHandler godoc
// @Summary Chat room
// @Description Renders the chat room page
// @Tags chat
// @Accept json
// @Produce json
// @Success 200 {string} string "OK"
// @Failure 302 {string} string "Found"
// @Router /chat [get]
func ChatHandler(c *gin.Context) {
	name, err1 := c.Cookie("name")
	room, err2 := c.Cookie("room")

	if err1 != nil || err2 != nil || name == "" || room == "" {
		c.Redirect(http.StatusFound, "/")
		return
	}

	c.HTML(http.StatusOK, "chat.html", gin.H{
		"name": name,
		"room": room,
	})
}

// SetupRoutes sets up the routes for the application
func SetupRoutes(router *gin.Engine) {
	router.GET("/", IndexHandler)
	router.POST("/", IndexHandler)
	router.GET("/chat", ChatHandler)

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}