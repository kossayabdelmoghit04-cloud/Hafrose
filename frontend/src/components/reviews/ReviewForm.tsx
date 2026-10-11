import { FormEvent, useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { TurnstileWidget } from '../security';
import { publicSubmissionService } from '../../services/publicSubmission.service';

export interface ReviewFormProps {
  productId: number;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ type: 'error', text: 'Veuillez terminer la vérification anti-robot.' });
      return;
    }

    setPending(true);
    try {
      await publicSubmissionService.submitReview({
        product_id: productId,
        customer_name: name,
        rating: Number(rating),
        comment,
        turnstileToken: token,
      });
      setName('');
      setRating('5');
      setComment('');
      setMessage({ type: 'success', text: 'Merci. Votre avis sera publié après modération.' });
    } catch {
      setMessage({ type: 'error', text: 'Impossible d’envoyer votre avis. Veuillez réessayer.' });
    } finally {
      setPending(false);
      setToken(null);
      setResetKey((value) => value + 1);
    }
  };

  return (
    <Card className="mt-12 p-6 md:p-8 bg-white max-w-2xl mx-auto">
      <h2 className="font-serif text-h3 text-neutral-950 mb-1">Partager votre avis</h2>
      <p className="text-body-sm text-neutral-600 mb-6">Votre avis sera contrôlé avant publication.</p>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <form onSubmit={submit} className="space-y-4 mt-4">
        <Input label="Votre nom" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
        <Select
          label="Note"
          required
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `${value}/5` }))}
        />
        <Textarea label="Votre avis" required minLength={10} maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} />
        <TurnstileWidget action="review" resetKey={resetKey} onTokenChange={setToken} />
        <Button type="submit" variant="primary" fullWidth isLoading={pending} disabled={pending || !token}>
          Envoyer mon avis
        </Button>
      </form>
    </Card>
  );
}
