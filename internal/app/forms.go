package app

import (
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