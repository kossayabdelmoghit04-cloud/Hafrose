import { FormEvent, useState } from 'react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { TurnstileWidget } from '../../components/security';
import { publicSubmissionService } from '../../services/publicSubmission.service';
import { useSEO } from '../../hooks/useSEO';

export const ContactPage = () => {
  useSEO({ title: 'Contact | HAFROSE' });
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '',
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ type: 'error', text: 'Veuillez terminer la vérification anti-robot.' });
      return;
    }

    setPending(true);
    try {
      await publicSubmissionService.submitContact({ ...form, turnstileToken: token });
      setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
      setMessage({ type: 'success', text: 'Votre message a bien été envoyé.' });
    } catch {
      setMessage({ type: 'error', text: 'Impossible d’envoyer le message. Veuillez réessayer.' });
    } finally {
      setPending(false);
      setToken(null);
      setResetKey((value) => value + 1);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100">
      <Section spacing="lg">
        <Container size="sm">
          <Card className="p-6 md:p-8 bg-white space-y-6">
            <header>
              <p className="text-caption uppercase tracking-luxury text-burgundy-600">Conciergerie</p>
              <h1 className="font-serif text-h2 text-neutral-950">Contactez HAFROSE</h1>
            </header>
            {message && <Alert variant={message.type}>{message.text}</Alert>}
            <form onSubmit={submit} className="space-y-4">
              <Input label="Nom" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Sujet" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Textarea label="Message" required minLength={10} rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <div className="sr-only" aria-hidden="true">
                <Input label="Site web" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <TurnstileWidget action="contact" resetKey={resetKey} onTokenChange={setToken} />
              <Button type="submit" variant="primary" size="lg" fullWidth isLoading={pending} disabled={pending || !token}>
                Envoyer le message
              </Button>
            </form>
          </Card>
        </Container>
      </Section>
    </div>
  );
};

export default ContactPage;
