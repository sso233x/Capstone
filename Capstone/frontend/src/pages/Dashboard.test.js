import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";

test("renders dashboard heading and welcome message", () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText(/Welcome! Here you can view and enroll in classes./)).toBeInTheDocument();
});

test("contains link to View Classes", () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const classesLink = screen.getByRole("link", { name: /View Classes/i });
  expect(classesLink).toBeInTheDocument();
  expect(classesLink.getAttribute("href")).toBe("/classes");
});

test("contains link to My Profile", () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  const profileLink = screen.getByRole("link", { name: /My Profile/i });
  expect(profileLink).toBeInTheDocument();
  expect(profileLink.getAttribute("href")).toBe("/profile");
});
