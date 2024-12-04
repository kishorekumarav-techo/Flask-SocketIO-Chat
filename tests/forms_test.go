package app_test

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// LoginForm represents the structure for the login form
type LoginForm struct {
	Name string `form:"name" binding:"required" json:"name"`
	Room string `form:"room" binding:"required" json:"room"`
}

// Validate checks if the LoginForm fields are valid
func (f *LoginForm) Validate() error {
	validate := validator.New()
	return validate.Struct(f)
}

// BindAndValidate binds the form data to the LoginForm struct and validates it
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

// Mock implementation of gin.Context
type mockContext struct {
	shouldBindErr error
	postForm      map[string]string
}

func (m *mockContext) ShouldBind(obj interface{}) error {
	if m.shouldBindErr != nil {
		return m.shouldBindErr
	}
	form := obj.(*LoginForm)
	form.Name = m.postForm["name"]
	form.Room = m.postForm["room"]
	return nil
}

func TestLoginFormValidate(t *testing.T) {
	tests := []struct {
		name    string
		form    LoginForm
		wantErr bool
	}{
		{
			name:    "Valid form",
			form:    LoginForm{Name: "John", Room: "General"},
			wantErr: false,
		},
		{
			name:    "Empty name",
			form:    LoginForm{Name: "", Room: "General"},
			wantErr: true,
		},
		{
			name:    "Empty room",
			form:    LoginForm{Name: "John", Room: ""},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.form.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("LoginForm.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestBindAndValidate(t *testing.T) {
	tests := []struct {
		name         string
		postForm     map[string]string
		shouldBindErr error
		wantErr      bool
	}{
		{
			name:     "Valid form",
			postForm: map[string]string{"name": "John", "room": "General"},
			wantErr:  false,
		},
		{
			name:     "Missing name",
			postForm: map[string]string{"room": "General"},
			wantErr:  true,
		},
		{
			name:     "Missing room",
			postForm: map[string]string{"name": "John"},
			wantErr:  true,
		},
		{
			name:          "ShouldBind error",
			shouldBindErr: errors.New("binding error"),
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockCtx := &mockContext{
				shouldBindErr: tt.shouldBindErr,
				postForm:      tt.postForm,
			}

			form, err := BindAndValidate(mockCtx)

			if (err != nil) != tt.wantErr {
				t.Errorf("BindAndValidate() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr && (form.Name != tt.postForm["name"] || form.Room != tt.postForm["room"]) {
				t.Errorf("BindAndValidate() got = %v, want %v", form, tt.postForm)
			}
		})
	}
}

func TestBindAndValidateWithGin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name    string
		payload string
		wantErr bool
	}{
		{
			name:    "Valid JSON",
			payload: `{"name":"John","room":"General"}`,
			wantErr: false,
		},
		{
			name:    "Invalid JSON - missing name",
			payload: `{"room":"General"}`,
			wantErr: true,
		},
		{
			name:    "Invalid JSON - missing room",
			payload: `{"name":"John"}`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request, _ = http.NewRequest("POST", "/", bytes.NewBufferString(tt.payload))
			c.Request.Header.Set("Content-Type", "application/json")

			form, err := BindAndValidate(c)

			if (err != nil) != tt.wantErr {
				t.Errorf("BindAndValidate() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				var expected LoginForm
				json.Unmarshal([]byte(tt.payload), &expected)
				if form.Name != expected.Name || form.Room != expected.Room {
					t.Errorf("BindAndValidate() got = %v, want %v", form, expected)
				}
			}
		})
	}
}

func main() {
	// This function is required for the test file to be a valid Go program
	// It won't be executed when running the tests
}