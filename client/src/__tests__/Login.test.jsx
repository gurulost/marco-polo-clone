import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { AuthContext } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Login Page', () => {
  let loginMock, navigateMock;

  beforeEach(() => {
    loginMock = jest.fn();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
  });

  it('renders email, password inputs and button', () => {
    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login and navigates on success', async () => {
    loginMock.mockResolvedValue();
    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('a@b.com', 'pass');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('displays error on failure', async () => {
    const err = { response: { data: { msg: 'Bad creds' } } };
    loginMock.mockRejectedValue(err);
    render(
      <AuthContext.Provider value={{ login: loginMock }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pwd' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/bad creds/i)).toBeInTheDocument();
    });
  });
});
