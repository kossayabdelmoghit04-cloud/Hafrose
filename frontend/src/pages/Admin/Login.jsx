import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';

export default function Login() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Rediriger si déjà connecté
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
    <div className="flex items-center justify-center min-h-screen bg-luxury-charcoal text-white font-sans px-4">
      <div className="w-full max-w-md p-8 bg-black/40 border border-luxury-gold/30 rounded-lg shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-luxury-gold tracking-wide uppercase">
            Hafrose Admin
          </h2>
          <p className="text-xs text-luxury-gray tracking-widest uppercase mt-2">
            Console de Gestion d'Entreprise
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-950/60 border border-red-800/40 text-red-300 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
              Adresse email professionnelle
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hafrose.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded focus:border-luxury-gold outline-none transition-all duration-300 text-white placeholder-white/20 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-luxury-gray uppercase tracking-wider mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded focus:border-luxury-gold outline-none transition-all duration-300 text-white placeholder-white/20 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-charcoal font-semibold rounded transition-all duration-300 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
}
