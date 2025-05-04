import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios and react-router-dom's useNavigate
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(), // Mock useNavigate
}));

// Mock localStorage token
beforeEach(() => {
  localStorage.setItem('token', 'test-token');
});

// Helper to render with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AdminDashboard', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard title', () => {
    renderWithRouter(<AdminDashboard />);
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  test('fetches and displays classes', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Math', capacity: 25, schedule: 'MWF 10-11' },
      ],
    });

    renderWithRouter(<AdminDashboard />);

    expect(await screen.findByText(/Math/i)).toBeInTheDocument();
    expect(screen.getByText(/Capacity: 25/i)).toBeInTheDocument();
  });

  test('adds a new class', async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // Initially no classes

    const newClass = { id: 2, name: 'Science', capacity: 30, schedule: 'TTh 9-10' };
    axios.post.mockResolvedValueOnce({ status: 201, data: newClass });

    renderWithRouter(<AdminDashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Class Name/i), {
      target: { value: 'Science' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Capacity/i), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Schedule/i), {
      target: { value: 'TTh 9-10' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Class/i }));

    await waitFor(() => {
      expect(screen.getByText(/Science/i)).toBeInTheDocument();
    });
  });

  test('deletes a class', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 3, name: 'History', capacity: 20, schedule: 'MWF 2-3' }],
    });

    axios.delete.mockResolvedValueOnce({ status: 200 });

    renderWithRouter(<AdminDashboard />);

    const deleteBtn = await screen.findByText(/Delete/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText(/History/i)).not.toBeInTheDocument();
    });
  });

  test('edits a class', async () => {
    const initialClass = { id: 4, name: 'Physics', capacity: 40, schedule: 'MWF 1-2' };
    axios.get.mockResolvedValueOnce({ data: [initialClass] });

    const updatedClass = { ...initialClass, name: 'Advanced Physics', capacity: 45 };
    axios.put.mockResolvedValueOnce({ status: 200, data: updatedClass });

    renderWithRouter(<AdminDashboard />);

    const editBtn = await screen.findByText(/Edit/i);
    fireEvent.click(editBtn);

    const nameInput = screen.getByDisplayValue('Physics');
    fireEvent.change(nameInput, { target: { value: 'Advanced Physics' } });

    const capacityInput = screen.getByDisplayValue('40');
    fireEvent.change(capacityInput, { target: { value: '45' } });

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Advanced Physics/i)).toBeInTheDocument();
      expect(screen.getByText(/Capacity: 45/i)).toBeInTheDocument();
    });
  });
});
