import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import { AuthContext } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Register Page', () => {
  let registerMock, navigateMock;

  beforeEach(() => {
    registerMock = jest.fn();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
  });

  it('renders name, email, password inputs and button', () => {
    render(
      <AuthContext.Provider value={{ register: registerMock }}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('calls register and navigates on success', async () => {
    registerMock.mockResolvedValue();
    render(
      <AuthContext.Provider value={{ register: registerMock }}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Joe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'joe@ex.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('Joe', 'joe@ex.com', 'secret');
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('displays error on failure', async () => {
    const err = { response: { data: { msg: 'Email exists' } } };
    registerMock.mockRejectedValue(err);
    render(
      <AuthContext.Provider value={{ register: registerMock }}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: 'Ann' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'ann@ex.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText(/email exists/i)).toBeInTheDocument();
    });
  });
});
