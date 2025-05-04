import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import axios from 'axios';
import { MemoryRouter, useNavigate } from 'react-router-dom'; 

jest.mock('axios');
jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert to avoid actual popup during testing
jest.spyOn(window, 'confirm').mockImplementation(() => true); // Mock confirm to always return true

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

test('should show loading state initially', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      enrolled_classes: [
        {
          class_id: 1,
          class_name: 'Yoga',
          schedule: 'Monday 8 AM',
          status: 'active',
          timestamp: '2025-01-01T10:00:00Z',
        },
      ],
    },
  });

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  // Make sure the loading state is shown initially
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('should display profile data once fetched', async () => {
  const mockData = {
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'member',
      enrolled_classes: [
        {
          class_id: 1,
          class_name: 'Yoga',
          schedule: 'Monday 8 AM',
          status: 'active',
          timestamp: '2025-01-01T10:00:00Z',
        },
      ],
    },
  };

  axios.get.mockResolvedValueOnce(mockData); // Mock axios response

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText("John Doe's Profile")).toBeInTheDocument();
    expect(screen.getByText('Yoga')).toBeInTheDocument();
  });
});

test('should display error message if profile data fetch fails', async () => {
  axios.get.mockRejectedValueOnce(new Error('Failed to fetch profile data')); // Mock axios failure

  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.getByText('There was an error fetching your profile data.')).toBeInTheDocument();
  });
});

test('should call cancel membership API and redirect after confirmation', async () => {
    const mockNavigate = jest.fn(); // Mock navigate function
    useNavigate.mockReturnValue(mockNavigate); // Mock useNavigate to return mockNavigate
  
    // Mock axios.get to resolve with profile data
    axios.get.mockResolvedValueOnce({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'member',
        enrolled_classes: [
          {
            class_id: 1,
            class_name: 'Yoga',
            schedule: 'Monday 8 AM',
            status: 'active',
            timestamp: '2025-01-01T10:00:00Z',
          },
        ],
      },
    });
  
    // Mock axios.delete to resolve successfully
    axios.delete.mockResolvedValueOnce({
      data: { success: true },
    });
  
    // Mock window.confirm to simulate user confirmation
    window.confirm = jest.fn().mockReturnValue(true);
  
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  
    // Wait for the profile to load before interacting
    await waitFor(() => {
      expect(screen.getByText("John Doe's Profile")).toBeInTheDocument();
    });
  
    // Find and click the cancel membership button
    const cancelButton = screen.getByText('Cancel Membership');
    fireEvent.click(cancelButton);
  
    // Check if the confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to cancel your membership? This will remove your account and all class enrollments."
    );
  
    // Wait for the axios.delete call and check that it was made with the correct params
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        'http://localhost:5000/cancel-membership',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  
    // Verify that navigate was called to redirect after cancellation
    expect(mockNavigate).toHaveBeenCalledWith('/');
});
  