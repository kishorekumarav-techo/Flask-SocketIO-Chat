import React from 'react';

interface FormProps {
  form: {
    hidden_tag: () => JSX.Element;
    name: {
      label: string;
      field: () => JSX.Element;
      errors: string[];
    };
    room: {
      label: string;
      field: () => JSX.Element;
      errors: string[];
    };
    submit: () => JSX.Element;
  };
}

const IndexPage: React.FC<FormProps> = ({ form }) => {
  return (
    <html>
      <head>
        <title>Flask-SocketIO-Chat</title>
      </head>
      <body>
        <h1>Flask-SocketIO-Chat</h1>
        <form method="POST">
          {form.hidden_tag()}
          <div>
            <label htmlFor="name">{form.name.label}: </label>
            {form.name.field()}
            {form.name.errors.map((error, index) => (
              <span key={index}>{error}</span>
            ))}
          </div>
          <div>
            <label htmlFor="room">{form.room.label}: </label>
            {form.room.field()}
            {form.room.errors.map((error, index) => (
              <span key={index}>{error}</span>
            ))}
          </div>
          {form.submit()}
        </form>
      </body>
    </html>
  );
};

export default IndexPage;