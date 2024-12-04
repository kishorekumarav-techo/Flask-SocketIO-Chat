package app

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
)

// InitializeSocketEvents sets up the Socket.IO event handlers
func InitializeSocketEvents(server *socketio.Server) {
	server.OnEvent("/chat", "joined", joined)
	server.OnEvent("/chat", "text", text)
	server.OnEvent("/chat", "left", left)
}

// joined handles the 'joined' event when a client enters a room
func joined(s socketio.Conn, msg string) {
	room := s.Context().(string)
	s.Join(room)
	s.Emit("status", gin.H{
		"msg": fmt.Sprintf("%s has entered the room.", s.Context().(string)),
	})
}

// text handles the 'text' event when a client sends a new message
func text(s socketio.Conn, msg string) {
	room := s.Context().(string)
	s.To(room).Emit("message", gin.H{
		"msg": fmt.Sprintf("%s: %s", s.Context().(string), msg),
	})
}

// left handles the 'left' event when a client leaves a room
func left(s socketio.Conn, msg string) {
	room := s.Context().(string)
	s.Leave(room)
	s.To(room).Emit("status", gin.H{
		"msg": fmt.Sprintf("%s has left the room.", s.Context().(string)),
	})
}