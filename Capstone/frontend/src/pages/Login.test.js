import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

// Mock axios and navigation
jest.mock("axios");
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test("renders login form fields and button", () => {
  render(
    <MemoryRouter>
      <Login setIsAuthenticated={jest.fn()} />
    </MemoryRouter>
  );

  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
});

test("updates form input values", () => {
  render(
    <MemoryRouter>
      <Login setIsAuthenticated={jest.fn()} />
    </MemoryRouter>
  );

  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");

  fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  fireEvent.change(passwordInput, { target: { value: "password123" } });

  expect(emailInput.value).toBe("test@example.com");
  expect(passwordInput.value).toBe("password123");
});

test("successful login stores token and navigates", async () => {
  const mockSetAuth = jest.fn();
  axios.post.mockResolvedValue({
    data: { token: "abc123", role: "member" },
  });

  render(
    <MemoryRouter>
      <Login setIsAuthenticated={mockSetAuth} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "secret" },
  });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => {
    expect(localStorage.getItem("token")).toBe("abc123");
    expect(localStorage.getItem("role")).toBe("member");
    expect(mockSetAuth).toHaveBeenCalledWith(true);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});

test("shows error message on 401 unauthorized", async () => {
  axios.post.mockRejectedValue({
    response: { status: 401 },
  });

  render(
    <MemoryRouter>
      <Login setIsAuthenticated={jest.fn()} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "wrong@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "wrongpass" },
  });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => {
    expect(screen.getByText("Invalid email or password.")).toBeInTheDocument();
  });
});

test("shows generic error message for unexpected failure", async () => {
    axios.post.mockRejectedValue({
        response: { data: "Internal Server Error" },
      });      

  render(
    <MemoryRouter>
      <Login setIsAuthenticated={jest.fn()} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "pass" },
  });

  fireEvent.click(screen.getByRole("button", { name: /login/i }));

  await waitFor(() => {
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });
});
