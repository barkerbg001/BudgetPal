import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../src/api/client';
import { LoginScreen } from '../src/screens/LoginScreen';

const mockLogin = jest.fn();

jest.mock('../src/store/authStore', () => ({
  useAuthStore: (
    selector: (state: { login: typeof mockLogin }) => unknown,
  ) => selector({ login: mockLogin }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders the sign-in form with demo credentials', async () => {
    await render(<LoginScreen />);

    expect(screen.getByText('BudgetPal')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('demo@budgetpal.app')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('password123')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
  });

  it('calls login with trimmed email and password', async () => {
    mockLogin.mockResolvedValue(undefined);
    await render(<LoginScreen />);

    await fireEvent.changeText(
      screen.getByDisplayValue('demo@budgetpal.app'),
      '  user@budgetpal.app  ',
    );
    await fireEvent.changeText(
      screen.getByDisplayValue('password123'),
      'secret123',
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@budgetpal.app', 'secret123');
    });
  });

  it('shows an API error message when login fails', async () => {
    mockLogin.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Invalid email or password'),
    ).toBeOnTheScreen();
  });
});
