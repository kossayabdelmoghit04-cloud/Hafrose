/**
 * AUTH FEATURE — Barrel Export
 *
 * Responsibility: Handles customer authentication lifecycle.
 * Contains: Login, Register, Forgot Password flows.
 * Consumes: authService, useAuthStore
 * Exposes: hooks, services re-exports for feature-internal use
 *
 * Internal structure:
 *   components/  — AuthForm, LoginForm, RegisterForm, PasswordResetForm
 *   hooks/       — useLogin, useRegister, useLogout
 *   pages/       — LoginPage, RegisterPage, ForgotPasswordPage
 *   types/       — feature-specific form state types
 */

// Hooks
export * from './hooks/useLogin';
export * from './hooks/useLogout';
export * from './hooks/useRegister';
