package app_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

// Mock implementations
type ginSwagger struct{}

func (gs *ginSwagger) WrapHandler(h http.Handler) gin.HandlerFunc {
	return func(c *gin.Context) {}
}

var ginSwaggerMock = &ginSwagger{}

type swaggerFiles struct{}

var swaggerFilesMock = &swaggerFiles{}

// Actual implementation
type LoginForm struct {
	Name string `form:"name" binding:"required" json:"name"`
	Room string `form:"room" binding:"required" json:"room"`
}

func (f *LoginForm) Validate() error {
	validate := validator.New()
	return validate.Struct(f)
}

func BindAndValidate(c *gin.Context) (*LoginForm, error) {
	var form LoginForm
	if err := c.ShouldBind(&form); err != nil {
		return nil, err
	}
	if err := form.Validate(); err != nil {
		return nil, err
	}
	return &form, nil
}

func IndexHandler(c *gin.Context) {
	if c.Request.Method == http.MethodPost {
		var form LoginForm
		if err := c.ShouldBind(&form); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if form.Validate() == nil {
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

func SetupRoutes(router *gin.Engine) {
	router.GET("/", IndexHandler)
	router.POST("/", IndexHandler)
	router.GET("/chat", ChatHandler)
	router.GET("/swagger/*any", ginSwaggerMock.WrapHandler(swaggerFilesMock))
}

// Test suite
func TestLoginForm(t *testing.T) {
	tests := []struct {
		name     string
		form     LoginForm
		wantErr  bool
		errField string
	}{
		{"Valid form", LoginForm{Name: "John", Room: "General"}, false, ""},
		{"Empty name", LoginForm{Name: "", Room: "General"}, true, "Name"},
		{"Empty room", LoginForm{Name: "John", Room: ""}, true, "Room"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.form.Validate()
			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errField)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestBindAndValidate(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name    string
		payload string
		wantErr bool
	}{
		{"Valid payload", `{"name":"John","room":"General"}`, false},
		{"Invalid payload", `{"name":"","room":"General"}`, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request, _ = http.NewRequest("POST", "/", bytes.NewBufferString(tt.payload))
			c.Request.Header.Set("Content-Type", "application/json")

			form, err := BindAndValidate(c)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, form)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, form)
			}
		})
	}
}

func TestIndexHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("GET request", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/", nil)

		IndexHandler(c)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("POST request - valid form", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		form := LoginForm{Name: "John", Room: "General"}
		jsonValue, _ := json.Marshal(form)
		c.Request, _ = http.NewRequest("POST", "/", bytes.NewBuffer(jsonValue))
		c.Request.Header.Set("Content-Type", "application/json")

		IndexHandler(c)

		assert.Equal(t, http.StatusFound, w.Code)
		assert.Equal(t, "/chat", w.Header().Get("Location"))
	})

	t.Run("POST request - invalid form", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		form := LoginForm{Name: "", Room: "General"}
		jsonValue, _ := json.Marshal(form)
		c.Request, _ = http.NewRequest("POST", "/", bytes.NewBuffer(jsonValue))
		c.Request.Header.Set("Content-Type", "application/json")

		IndexHandler(c)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

func TestChatHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Valid cookies", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/chat", nil)
		c.Request.AddCookie(&http.Cookie{Name: "name", Value: "John"})
		c.Request.AddCookie(&http.Cookie{Name: "room", Value: "General"})

		ChatHandler(c)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Invalid cookies", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/chat", nil)

		ChatHandler(c)

		assert.Equal(t, http.StatusFound, w.Code)
		assert.Equal(t, "/", w.Header().Get("Location"))
	})
}

func TestSetupRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	SetupRoutes(router)

	assert.NotNil(t, router.Routes())
	assert.Len(t, router.Routes(), 4)
}

func main() {
	// This function is required for the test file to be a valid Go program
	// It won't be executed when running the tests
}