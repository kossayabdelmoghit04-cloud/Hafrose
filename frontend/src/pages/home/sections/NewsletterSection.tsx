import { useState, FormEvent } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Container } from '../../../components/ui/Container';
import { Section } from '../../../components/ui/Section';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <Section spacing="xl" bg="cream-dark" className="border-t border-b border-cream-400">
      <Container size="md">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-rose-powder text-burgundy-600 mx-auto flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            <p className="text-caption font-sans font-semibold tracking-luxury-wide uppercase text-burgundy-500">
              Le Cercle HAFROSE
            </p>
            <h2 className="font-serif text-h1 md:text-display-lg text-neutral-950">
              Inscrivez-vous à la Newsletter
            </h2>
            <p className="text-body-base text-neutral-600 max-w-lg mx-auto leading-relaxed">
              Recevez en avant-première nos nouvelles collections, nos invitations aux ventes privées et nos conseils de style exclusifs.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-white rounded-md border border-success-100 shadow-hafrose-sm max-w-md mx-auto space-y-2 animate-scale-up">
              <CheckCircle className="w-8 h-8 text-success-500 mx-auto" />
              <h4 className="font-serif text-h5 text-neutral-900">Merci pour votre inscription !</h4>
              <p className="text-body-sm text-neutral-600">
                Vous recevrez très prochainement vos premières privilèges HAFROSE.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email..."
                  required
                  aria-label="Adresse email pour la newsletter"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                S'inscrire
              </Button>
            </form>
          )}

          <p className="text-caption text-neutral-400">
            En vous inscrivant, vous acceptez notre politique de confidentialité. Désinscription à tout moment.
          </p>
        </div>
      </Container>
    </Section>
  );
};
