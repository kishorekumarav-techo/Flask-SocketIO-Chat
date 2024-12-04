package app_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock implementations
type MockConn struct {
	mock.Mock
	context string
	room    string
}

func (m *MockConn) Context() interface{} {
	return m.context
}

func (m *MockConn) Join(room string) {
	m.room = room
}

func (m *MockConn) Leave(room string) {
	m.room = ""
}

func (m *MockConn) Emit(event string, args ...interface{}) {
	m.Called(event, args[0])
}

func (m *MockConn) To(room string) MockEmitter {
	return MockEmitter{room: room, conn: m}
}

type MockEmitter struct {
	room string
	conn *MockConn
}

func (m MockEmitter) Emit(event string, args ...interface{}) {
	m.conn.Called(event, args[0])
}

type MockServer struct {
	mock.Mock
	eventHandlers map[string]func(MockConn, string)
}

func (m *MockServer) OnEvent(nsp, event string, f interface{}) {
	if m.eventHandlers == nil {
		m.eventHandlers = make(map[string]func(MockConn, string))
	}
	m.eventHandlers[event] = f.(func(MockConn, string))
}

// Actual implementation
func InitializeSocketEvents(server *MockServer) {
	server.OnEvent("/chat", "joined", joined)
	server.OnEvent("/chat", "text", text)
	server.OnEvent("/chat", "left", left)
}

func joined(s MockConn, msg string) {
	room := s.Context().(string)
	s.Join(room)
	s.Emit("status", map[string]interface{}{
		"msg": fmt.Sprintf("%s has entered the room.", s.Context().(string)),
	})
}

func text(s MockConn, msg string) {
	room := s.Context().(string)
	s.To(room).Emit("message", map[string]interface{}{
		"msg": fmt.Sprintf("%s: %s", s.Context().(string), msg),
	})
}

func left(s MockConn, msg string) {
	room := s.Context().(string)
	s.Leave(room)
	s.To(room).Emit("status", map[string]interface{}{
		"msg": fmt.Sprintf("%s has left the room.", s.Context().(string)),
	})
}

// Test suite
func TestSocketEvents(t *testing.T) {
	server := &MockServer{}
	InitializeSocketEvents(server)

	t.Run("TestJoined", func(t *testing.T) {
		conn := &MockConn{context: "TestUser"}
		conn.On("Emit", "status", map[string]interface{}{
			"msg": "TestUser has entered the room.",
		}).Once()

		server.eventHandlers["joined"](*conn, "")

		assert.Equal(t, "TestUser", conn.room)
		conn.AssertExpectations(t)
	})

	t.Run("TestText", func(t *testing.T) {
		conn := &MockConn{context: "TestUser", room: "TestRoom"}
		conn.On("Emit", "message", map[string]interface{}{
			"msg": "TestUser: Hello, world!",
		}).Once()

		server.eventHandlers["text"](*conn, "Hello, world!")

		conn.AssertExpectations(t)
	})

	t.Run("TestLeft", func(t *testing.T) {
		conn := &MockConn{context: "TestUser", room: "TestRoom"}
		conn.On("Emit", "status", map[string]interface{}{
			"msg": "TestUser has left the room.",
		}).Once()

		server.eventHandlers["left"](*conn, "")

		assert.Equal(t, "", conn.room)
		conn.AssertExpectations(t)
	})
}

// Main function to run the tests
func TestMain(m *testing.M) {
	m.Run()
}