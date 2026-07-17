import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import { Form, EmailField, PasswordField } from '../../components/ui/form';

/**
 * Admin Login Page — Luxury Form System (Phase 2.0.3)
 *
 * First migrated form. Demonstrates:
 * - <Form> wrapper with <Form.Field> context
 * - <Form.Label> auto-linked via useFormField()
 * - <Form.Error> with aria-live="polite" and animate-form-error
 * - <EmailField variant="admin"> + <PasswordField variant="admin">
 * - Zero inline ad-hoc Tailwind for form anatomy
 */
export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/admin/login', { email, password });

      if (response.success && response.data.token) {
        login(response.data.token, response.data.user);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(response.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      setError(err.message || 'Identifiants incorrects ou accès refusé.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Loader fullPage />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-luxury-charcoal font-sans px-4">
      <Card
        variant="admin"
        size="lg"
        as="div"
        className="w-full max-w-md backdrop-blur-md"
        animate={false}
      >
        <Card.Body>
          {/* Header */}
          <Form.Header className="text-center">
            <Form.Title as="h1" className="text-3xl text-rose-gold">
              Hafrose Admin
            </Form.Title>
            <Form.Description>
              Console de Gestion d'Entreprise
            </Form.Description>
          </Form.Header>

          {/* Global error alert */}
          {error && (
            <Card variant="alert" size="sm" className="mb-6" animate={false}>
              <Card.Body>
                <p
                  role="alert"
                  aria-live="assertive"
                  className="text-error-text text-sm text-center"
                >
                  {error}
                </p>
              </Card.Body>
            </Card>
          )}

          {/* Form */}
          <Form
            id="admin-login-form"
            onSubmit={handleSubmit}
            aria-label="Formulaire de connexion administrateur"
          >
            <Form.Section>
              {/* Email Field */}
              <Form.Field name="email">
                <Form.Label required>
                  Adresse email professionnelle
                </Form.Label>
                <EmailField
                  id="admin-email"
                  variant="admin"
                  size="md"
                  placeholder="admin@hafrose.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Field>

              {/* Password Field */}
              <Form.Field name="password">
                <Form.Label required>
                  Mot de passe
                </Form.Label>
                <PasswordField
                  id="admin-password"
                  variant="admin"
                  size="md"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Form.Field>
            </Form.Section>

            {/* Submit */}
            <Form.Footer className="border-0 pt-4">
              <Button
                type="submit"
                loading={loading}
                fullWidth
              >
                Se connecter
              </Button>
            </Form.Footer>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
