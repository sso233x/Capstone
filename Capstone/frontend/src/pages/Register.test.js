import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "./Register";
import axios from "axios";
import { BrowserRouter as Router } from "react-router-dom";

// ✅ Define this BEFORE jest.mock so it's in scope
const mockNavigate = jest.fn();

// ✅ Mock only useNavigate, preserve the rest
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// ✅ Mock axios
jest.mock("axios");

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render the registration form", () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign Up/i })).toBeInTheDocument();
  });

  test("should submit the form and navigate to dashboard on success", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "User created successfully" } });

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://localhost:5000/register", {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("should display an error message on failed registration", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: "Email already in use" } } });

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  test("should clear error message when user starts typing after an error", async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: "Email already in use" } } });

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });

    // Start typing again
    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Jane Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "newemail@example.com" } });

    await waitFor(() => {
      expect(screen.queryByText("Email already in use")).not.toBeInTheDocument();
    });
  });
});
