import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page Introuvable', 'La page recherchée n\'existe pas ou a été déplacée.');
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 pt-32 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8 max-w-xl"
      >
        <span className="text-[10px] tracking-[0.6em] text-luxury-gold uppercase font-sans font-semibold block">
          Erreur 404
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-luxury-charcoal font-extralight tracking-wide">
          Page Introuvable
        </h1>
        <div className="w-16 h-[1px] bg-luxury-gold mx-auto my-8" />
        <p className="text-sm text-luxury-gray font-sans font-light leading-relaxed max-w-md mx-auto">
          L'adresse recherchée n'est plus disponible ou a été déplacée. La Maison Hafrose vous invite à retourner vers les créations de nos collections exclusives.
        </p>
        <div className="pt-6">
          <Link to="/">
            <Button variant="primary" size="md">
              Retourner à l'Accueil
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
