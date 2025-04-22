import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../components/NavBar';
import { AuthContext } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

describe('NavBar', () => {
  it('renders brand and no logout when not authenticated', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <BrowserRouter>
          <NavBar />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText('Marco Polo Clone')).toBeInTheDocument();
    expect(screen.queryByText(/Logout/i)).toBeNull();
  });

  it('renders greeting and logout when authenticated, and calls logout on click', () => {
    const logout = jest.fn();
    const user = { name: 'TestUser' };
    render(
      <AuthContext.Provider value={{ user, logout }}>
        <BrowserRouter>
          <NavBar />
        </BrowserRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText(`Hi, ${user.name}`)).toBeInTheDocument();
    const btn = screen.getByText('Logout');
    fireEvent.click(btn);
    expect(logout).toHaveBeenCalled();
  });
});
