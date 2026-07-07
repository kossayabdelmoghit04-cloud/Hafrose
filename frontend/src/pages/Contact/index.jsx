import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import Swal from 'sweetalert2';
import contactService from '../../services/contactService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import Card from '../../components/ui/Card';

const SUBJECTS = [
  'Renseignement sur un produit',
  'Suivi de commande',
  'Service après-vente',
  'Demande de personnalisation',
  'Presse & Partenariats',
  'Autre'
];

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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot anti-spam field - hidden from users */}
            <input type="text" name="website" value={form.website} onChange={handleChange} className="hidden" tabIndex="-1" autoComplete="off" aria-hidden="true" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Nom complet" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
              <Input label="Adresse e-mail" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Téléphone (facultatif)" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              <div className="flex flex-col space-y-1.5 text-left">
                <label className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-luxury-charcoal/80">
                  Sujet
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border outline-none text-xs font-sans font-light tracking-wide text-luxury-charcoal transition-all duration-300 rounded-none ${
                    errors.subject ? 'border-rose-400' : 'border-luxury-charcoal/10 focus:border-luxury-gold'
                  }`}
                  required
                >
                  <option value="">Sélectionner un sujet</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <span className="text-[10px] font-sans text-rose-500 font-light">{errors.subject}</span>}
              </div>
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-[10px] tracking-[0.25em] uppercase font-sans font-medium text-luxury-charcoal/80">
                Votre message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 bg-white border outline-none text-xs font-sans font-light tracking-wide text-luxury-charcoal transition-all duration-300 placeholder:text-luxury-gray/50 rounded-none ${
                  errors.message ? 'border-rose-400' : 'border-luxury-charcoal/10 focus:border-luxury-gold'
                }`}
                placeholder="Décrivez votre demande avec le plus de détails possible..."
                required
              />
              {errors.message && <span className="text-[10px] font-sans text-rose-500 font-light">{errors.message}</span>}
            </div>

            <Button
              variant="primary"
              type="submit"
              fullWidth
              disabled={isSubmitting}
              icon={<FiSend size={14} />}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer votre message'}
            </Button>
          </form>
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
