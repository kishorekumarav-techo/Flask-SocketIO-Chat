import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  room: string;
}

const IndexComponent: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    // Here you would typically send the form data to your backend
    // For example:
    // await fetch('/join', { method: 'POST', body: JSON.stringify(data) });
    setSubmitting(false);
  };

  return (
    <div>
      <h1>Flask-SocketIO-Chat</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          <label htmlFor="room">Room:</label>
          <input
            id="room"
            {...register('room', { required: 'Room is required' })}
          />
          {errors.room && <span>{errors.room.message}</span>}
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Joining...' : 'Join'}
        </button>
      </form>
    </div>
  );
};

export default IndexComponent;