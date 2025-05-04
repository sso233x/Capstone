import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Classes from "./Classes";
import axios from "axios";

jest.mock("axios");

const mockClasses = [
  {
    id: 1,
    name: "Yoga",
    schedule: "Monday 9 AM",
    capacity: 10,
    enrolled_count: 5,
    enrolled: false,
  },
  {
    id: 2,
    name: "Spin",
    schedule: "Wednesday 6 PM",
    capacity: 5,
    enrolled_count: 5,
    enrolled: false,
  },
  {
    id: 3,
    name: "Pilates",
    schedule: "Friday 8 AM",
    capacity: 8,
    enrolled_count: 3,
    enrolled: true,
  },
];

beforeEach(() => {
  localStorage.setItem("token", "fake-token");
  localStorage.setItem("role", "member");
});

afterEach(() => {
  jest.clearAllMocks();
});

test("fetches and displays classes on mount", async () => {
  axios.get.mockResolvedValueOnce({ data: mockClasses });
  render(<Classes />);

  expect(await screen.findByText(/Yoga/)).toBeInTheDocument();
  expect(screen.getByText(/Spin/)).toBeInTheDocument();
  expect(screen.getByText(/Pilates/)).toBeInTheDocument();
});

test("shows 'Enroll' button for available class", async () => {
  axios.get.mockResolvedValueOnce({ data: [mockClasses[0]] });
  render(<Classes />);

  expect(await screen.findByText("Enroll")).toBeInTheDocument();
});

test("shows 'Unenroll' button if user is enrolled", async () => {
  axios.get.mockResolvedValueOnce({ data: [mockClasses[2]] });
  render(<Classes />);

  expect(await screen.findByText("Unenroll")).toBeInTheDocument();
});

test("shows '❌ Full' if class is full and user not enrolled", async () => {
  axios.get.mockResolvedValueOnce({ data: [mockClasses[1]] });
  render(<Classes />);

  expect(await screen.findByText("❌ Full")).toBeInTheDocument();
});

test("enrolls in a class and refetches data", async () => {
  axios.get.mockResolvedValueOnce({ data: [mockClasses[0]] });
  axios.post.mockResolvedValueOnce({}); // enroll request
  render(<Classes />);

  const enrollBtn = await screen.findByText("Enroll");
  fireEvent.click(enrollBtn);

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/classes/1/enroll",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  expect(axios.get).toHaveBeenCalledTimes(2); // initial + after enroll
});

test("unenrolls from a class and refetches data", async () => {
  axios.get.mockResolvedValueOnce({ data: [mockClasses[2]] });
  axios.post.mockResolvedValueOnce({}); // unenroll request
  render(<Classes />);

  const unenrollBtn = await screen.findByText("Unenroll");
  fireEvent.click(unenrollBtn);

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      "http://127.0.0.1:5000/classes/3/unenroll",
      {},
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  expect(axios.get).toHaveBeenCalledTimes(2); // initial + after unenroll
});
