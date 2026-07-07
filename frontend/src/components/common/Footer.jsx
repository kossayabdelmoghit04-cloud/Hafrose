import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInstagram, FiFacebook, FiTwitter, FiArrowRight } from 'react-icons/fi';
import Button from '../ui/Button';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    setStatus('success');
    setMessage('Merci pour votre inscription à la Maison Hafrose.');
    setEmail('');

    // Clear alert message after 5 seconds
    setTimeout(() => {
      setStatus(null);
      setMessage('');
    }, 5000);
  };

  return (
    <footer className="bg-anthracite text-off-white pt-24 pb-12 border-t border-beige/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
        
        {/* Brand & Narrative */}
        <div className="space-y-6 md:col-span-1">
          <span className="font-heading text-2xl tracking-[0.25em] text-off-white block select-none">
            HAFROSE
          </span>
          <p className="font-sans text-xs font-light text-off-white/60 leading-relaxed">
            Maison française d'excellence. Façonnant des créations de haute maroquinerie, horlogerie et joaillerie d'exception pour sublimer le quotidien des esthètes.
          </p>
          <div className="flex space-x-4 pt-2">
            <a 
              href="#" 
              className="text-off-white/60 hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury p-1"
              aria-label="Instagram de la Maison Hafrose"
            >
              <FiInstagram size={20} />
            </a>
            <a 
              href="#" 
              className="text-off-white/60 hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury p-1"
              aria-label="Facebook de la Maison Hafrose"
            >
              <FiFacebook size={20} />
            </a>
            <a 
              href="#" 
              className="text-off-white/60 hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury p-1"
              aria-label="Twitter de la Maison Hafrose"
            >
              <FiTwitter size={20} />
            </a>
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="font-heading text-sm tracking-[0.2em] text-warm-gold uppercase mb-6 font-medium block">
            Collections
          </h3>
          <ul className="space-y-3 font-sans text-xs font-light text-off-white/60">
            <li>
              <Link 
                to="/shop?category=sacs" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Sacs & Maroquinerie
              </Link>
            </li>
            <li>
              <Link 
                to="/shop?category=bijoux" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Joaillerie fine
              </Link>
            </li>
            <li>
              <Link 
                to="/shop?category=montres" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Horlogerie d'Exception
              </Link>
            </li>
            <li>
              <Link 
                to="/shop?category=lunettes" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Accessoires & Lunettes
              </Link>
            </li>
          </ul>
        </div>

        {/* Boutique Services */}
        <div>
          <h3 className="font-heading text-sm tracking-[0.2em] text-warm-gold uppercase mb-6 font-medium block">
            Services
          </h3>
          <ul className="space-y-3 font-sans text-xs font-light text-off-white/60">
            <li>
              <Link 
                to="/contact" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Prendre rendez-vous
              </Link>
            </li>
            <li>
              <Link 
                to="/contact" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Service client
              </Link>
            </li>
            <li>
              <a 
                href="#" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Livraison & Retours
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury py-1 block"
              >
                Conseils d'entretien
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h3 className="font-heading text-sm tracking-[0.2em] text-warm-gold uppercase mb-6 font-medium block">
            Newsletter
          </h3>
          <p className="font-sans text-xs font-light text-off-white/60 leading-relaxed">
            Inscrivez-vous pour recevoir les invitations exclusives aux collections privées et actualités de la Maison.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              required
              className="w-full bg-transparent border-b border-off-white/20 text-xs py-2 pr-10 focus:outline-none focus:border-rose-gold text-off-white placeholder-off-white/40 tracking-wider font-sans transition-all duration-500 ease-luxury focus-visible:outline-none"
              aria-label="Adresse e-mail pour la newsletter"
            />
            <Button
              type="submit"
              variant="ghost"
              size="xs"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-warm-gold hover:text-rose-gold"
              aria-label="S'abonner à la newsletter"
              icon={<FiArrowRight size={16} />}
            />
          </form>

          <AnimatePresence>
            {status && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`text-[11px] font-sans font-light mt-2 tracking-wide ${
                  status === 'success' ? 'text-[#E2ECE9] bg-[#2E5A44]/10 border border-[#2E5A44]/20 px-3 py-1.5' : 'text-[#FAF0F2] bg-[#A33E53]/10 border border-[#A33E53]/20 px-3 py-1.5'
                }`}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-off-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-off-white/40 font-sans uppercase tracking-[0.2em] gap-4 text-center md:text-left">
        <div>
          © {currentYear} Maison Hafrose. Tous droits réservés.
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury">Mentions Légales</a>
          <a href="#" className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury">Données Personnelles</a>
          <a href="#" className="hover:text-rose-gold transition-colors duration-500 ease-luxury focus-visible:outline-luxury">Conditions de Vente</a>
        </div>
      </div>
    </footer>
  );
}
