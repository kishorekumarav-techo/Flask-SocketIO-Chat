import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

// Mock implementations
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (cb: (data: any) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      cb({ name: 'Test User', room: 'Test Room' });
    },
    formState: { errors: {} },
  }),
}));

// Component implementation
interface FormData {
  name: string;
  room: string;
}

const IndexComponent: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1000));
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

// Test suite
describe('IndexComponent', () => {
  it('renders without crashing', () => {
    render(<IndexComponent />);
    expect(screen.getByText('Flask-SocketIO-Chat')).toBeInTheDocument();
  });

  it('displays form fields', () => {
    render(<IndexComponent />);
    expect(screen.getByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Room:')).toBeInTheDocument();
  });

  it('submits the form', async () => {
    render(<IndexComponent />);
    fireEvent.click(screen.getByText('Join'));
    await waitFor(() => {
      expect(screen.getByText('Joining...')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Join')).toBeInTheDocument();
    });
  });
});

// Test runner
const runTests = async () => {
  console.log('Running tests...');
  const testResults: { [key: string]: string } = {};

  for (const testCase of Object.keys(IndexComponent.prototype)) {
    if (testCase.startsWith('test')) {
      try {
        await (IndexComponent as any).prototype[testCase]();
        testResults[testCase] = 'PASS';
      } catch (error) {
        testResults[testCase] = 'FAIL';
        console.error(`Test case ${testCase} failed:`, error);
      }
    }
  }

  console.log('Test results:');
  Object.entries(testResults).forEach(([testCase, result]) => {
    console.log(`${testCase}: ${result}`);
  });
};

runTests();