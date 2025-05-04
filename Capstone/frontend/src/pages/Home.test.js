import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

test("renders welcome message and description", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText("Welcome to FitTrack")).toBeInTheDocument();
  expect(screen.getByText(/Manage your gym classes/i)).toBeInTheDocument();
});

test("contains link to Login", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  const loginLink = screen.getByRole("link", { name: /Login/i });
  expect(loginLink).toBeInTheDocument();
  expect(loginLink.getAttribute("href")).toBe("/login");
});

test("contains link to Register", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  const registerLink = screen.getByRole("link", { name: /Register/i });
  expect(registerLink).toBeInTheDocument();
  expect(registerLink.getAttribute("href")).toBe("/register");
});
