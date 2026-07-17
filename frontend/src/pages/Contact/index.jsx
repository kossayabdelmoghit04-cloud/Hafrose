import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';
import contactService from '../../services/contactService';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card from '../../components/ui/Card';
import { Form, Input, EmailField, Select, Textarea } from '../../components/ui/form';

const SUBJECTS = [
  'Renseignement sur un produit',
  'Suivi de commande',
  'Service après-vente',
  'Demande de personnalisation',
  'Presse & Partenariats',
  'Autre'
];

const SUBJECT_OPTIONS = SUBJECTS.map((s) => ({ value: s, label: s }));

export default function Contact() {
  useDocumentTitle('Nous Contacter', 'Notre conciergerie se tient à votre entière disposition pour répondre à vos questions ou organiser une consultation privée.');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est obligatoire.';
    else if (form.name.trim().length > 255) errs.name = 'Le nom ne doit pas dépasser 255 caractères.';

    if (!form.email.trim()) errs.email = "L'adresse e-mail est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "L'adresse e-mail n'est pas valide.";

    if (!form.subject) errs.subject = 'Le sujet est obligatoire.';

    if (!form.message.trim()) errs.message = 'Le message est obligatoire.';
    else if (form.message.trim().length < 10) errs.message = 'Le message doit contenir au moins 10 caractères.';
    else if (form.message.trim().length > 5000) errs.message = 'Le message ne doit pas dépasser 5000 caractères.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    try {
      const res = await contactService.submit(form);
      if (res?.success) {
        Swal.fire({
          title: 'Message transmis',
          text: 'La Maison Hafrose a bien reçu votre message. Notre conciergerie vous répondra dans les plus brefs délais.',
          icon: 'success',
          confirmButtonColor: '#111111'
        });
        setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
      }
    } catch (err) {
      if (err.status === 429) {
        Swal.fire({ icon: 'warning', title: 'Veuillez patienter', text: 'Trop de requêtes. Réessayez dans quelques instants.', confirmButtonColor: '#111111' });
      } else if (err.errors) {
        setErrors(err.errors);
      } else {
        Swal.fire({ icon: 'error', title: 'Erreur', text: err.message || 'Envoi impossible.', confirmButtonColor: '#111111' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 pt-32 min-h-screen">
      <Breadcrumb items={[{ label: 'Contact', path: '/contact' }]} />

      {/* Page Header */}
      <div className="text-center space-y-4 mb-16">
        <span className="text-[9px] tracking-[0.5em] text-luxury-gold uppercase font-sans font-semibold">
          Conciergerie & Salon
        </span>
        <h1 className="font-serif text-4xl md:text-5xl text-luxury-charcoal font-light">Nous Contacter</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto my-6" />
        <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed max-w-xl mx-auto">
          Notre conciergerie se tient à votre entière disposition pour répondre à vos questions, organiser une consultation privée ou vous accompagner dans le choix de votre pièce d'exception.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 text-left">
        {/* Contact Form */}
        <Card
          variant="panel"
          className="lg:col-span-7 p-8 md:p-10"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Card.Header className="border-b-0 pb-0 mb-8">
            <Card.Title as="h2" className="text-xl font-light text-luxury-charcoal">Votre Message</Card.Title>
          </Card.Header>

          <Form onSubmit={handleSubmit}>
            {/* Honeypot anti-spam field - hidden from users */}
            <input type="text" name="website" value={form.website} onChange={handleChange} className="hidden" tabIndex="-1" autoComplete="off" aria-hidden="true" />

            <Form.Section>
              {/* Row 1: Nom + Email */}
              <Form.Row cols={{ default: 1, md: 2 }}>
                <Form.Field name="name" error={errors.name}>
                  <Form.Label required>Nom complet</Form.Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                  <Form.Error />
                </Form.Field>

                <Form.Field name="email" error={errors.email}>
                  <Form.Label required>Adresse e-mail</Form.Label>
                  <EmailField
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                  <Form.Error />
                </Form.Field>
              </Form.Row>

              {/* Row 2: Téléphone + Sujet */}
              <Form.Row cols={{ default: 1, md: 2 }}>
                <Form.Field name="phone" error={errors.phone}>
                  <Form.Label>Téléphone (facultatif)</Form.Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  <Form.Error />
                </Form.Field>

                <Form.Field name="subject" error={errors.subject}>
                  <Form.Label required>Sujet</Form.Label>
                  <Select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    options={SUBJECT_OPTIONS}
                    placeholder="Sélectionner un sujet"
                    required
                  />
                  <Form.Error />
                </Form.Field>
              </Form.Row>

              {/* Message */}
              <Form.Field name="message" error={errors.message}>
                <Form.Label required>Votre message</Form.Label>
                <Textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Décrivez votre demande avec le plus de détails possible..."
                  required
                />
                <Form.Counter current={form.message.length} max={5000} />
                <Form.Error />
              </Form.Field>
            </Form.Section>

            <Form.Footer className="border-t-0 pt-2 mt-6">
              <Form.Actions align="left">
                <Button
                  variant="primary"
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  icon={<FiSend size={14} />}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer votre message'}
                </Button>
              </Form.Actions>
            </Form.Footer>
          </Form>
        </Card>

        {/* Contact Info Sidebar */}
        <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.15 }} className="lg:col-span-5 space-y-10">
          {/* Salon */}
          <Card variant="flat" className="bg-luxury-charcoal text-white p-8 space-y-6">
            <Card.Title as="h3" className="text-lg font-light tracking-wide text-white">La Maison Hafrose</Card.Title>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <FiMapPin className="text-luxury-gold mt-1 flex-shrink-0" size={16} />
                <div className="text-xs font-sans font-light leading-relaxed text-luxury-cream/80">
                  <p>12, Avenue Montaigne</p>
                  <p>75008 Paris, France</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <FiPhone className="text-luxury-gold flex-shrink-0" size={16} />
                <span className="text-xs font-sans font-light text-luxury-cream/80">+33 (0)1 42 56 78 90</span>
              </div>
              <div className="flex items-center space-x-4">
                <FiMail className="text-luxury-gold flex-shrink-0" size={16} />
                <span className="text-xs font-sans font-light text-luxury-cream/80">concierge@hafrose.com</span>
              </div>
              <div className="flex items-start space-x-4">
                <FiClock className="text-luxury-gold mt-1 flex-shrink-0" size={16} />
                <div className="text-xs font-sans font-light leading-relaxed text-luxury-cream/80">
                  <p>Lundi — Samedi : 10h00 — 19h00</p>
                  <p>Dimanche : Sur rendez-vous</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Values */}
          <Card variant="service" className="p-8 border border-card-border-editorial space-y-4">
            <Card.Title as="h3" className="text-lg font-light text-luxury-charcoal">Notre Engagement</Card.Title>
            <Card.Description className="text-xs font-sans font-light text-luxury-gray leading-relaxed">
              Chaque demande reçoit l'attention personnelle qu'elle mérite. Notre équipe de conciergerie s'engage à vous répondre sous 24 heures ouvrées avec la discrétion et l'excellence qui caractérisent la Maison Hafrose.
            </Card.Description>
            <Card.Divider className="w-8 h-[1px] bg-luxury-gold border-t-0" />
            <Card.Meta className="text-luxury-gold font-semibold">
              Réponse garantie sous 24h
            </Card.Meta>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
