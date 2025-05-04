import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { login, register } from './auth';

// Create a mock adapter instance for axios
const mock = new MockAdapter(axios);

describe('auth.js', () => {
    let localStorageMock;

    beforeEach(() => {
        localStorageMock = (function () {
            let store = {};
            return {
                getItem: jest.fn((key) => store[key]),
                setItem: jest.fn((key, value) => {
                    store[key] = value;
                }),
                removeItem: jest.fn((key) => {
                    delete store[key];
                }),
                clear: jest.fn(() => {
                    store = {};
                }),
            };
        })();

        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });

        mock.reset(); // Reset axios mock
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should log in a user and store token and role in localStorage', async () => {
        const mockResponse = { token: 'abc123', role: 'user' };
        mock.onPost('http://127.0.0.1:5000/login').reply(200, mockResponse);

        const email = 'test@example.com';
        const password = 'password';

        const response = await login(email, password);

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
        expect(localStorage.setItem).toHaveBeenCalledWith('role', 'user');
        expect(response).toEqual(mockResponse);
    });

    it('should register a new user', async () => {
        const mockResponse = { message: 'User registered successfully' };
        mock.onPost('http://127.0.0.1:5000/register').reply(200, mockResponse);

        const name = 'John Doe';
        const email = 'john@example.com';
        const password = 'password';

        const response = await register(name, email, password);
        expect(response.data).toEqual(mockResponse);
    });

    it('should handle login failure correctly', async () => {
        mock.onPost('http://127.0.0.1:5000/login').reply(401, { message: 'Invalid credentials' });

        const email = 'invalid@example.com';
        const password = 'wrongpassword';

        try {
            await login(email, password);
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.message).toBe('Invalid credentials');
        }
    });
});
