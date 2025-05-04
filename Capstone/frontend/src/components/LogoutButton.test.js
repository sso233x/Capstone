// tests/components/LogoutButton.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import LogoutButton from './LogoutButton';
import { useNavigate } from 'react-router-dom';

// Mock the necessary functions
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

beforeEach(() => {
  // Reset the mocks before each test
  localStorage.clear();
  jest.clearAllMocks();
  window.alert = jest.fn();
});

test('removes token from localStorage, calls setIsAuthenticated, and navigates to home on logout', () => {
  // Arrange: Set up a mock function for setIsAuthenticated
  const setIsAuthenticated = jest.fn();
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);

  localStorage.setItem("token", "fake-token");
  // Render the LogoutButton component
  render(<LogoutButton setIsAuthenticated={setIsAuthenticated} />);

  // Simulate clicking the logout button
  const logoutButton = screen.getByText(/logout/i);
  fireEvent.click(logoutButton);

  // Assert that localStorage.removeItem was called to remove the token
  expect(localStorage.getItem("token")).toBeNull();

  // Assert that setIsAuthenticated was called with false
  expect(setIsAuthenticated).toHaveBeenCalledWith(false);

  // Assert that navigate was called to navigate to the home page
  expect(navigate).toHaveBeenCalledWith("/");

  // Assert that alert was called with the correct message
  expect(window.alert).toHaveBeenCalledWith("You have been logged out.");
});
