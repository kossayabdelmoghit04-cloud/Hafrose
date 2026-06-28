import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiArrowRight } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Intégration future de la newsletter via SweetAlert ou API
    alert('Merci pour votre inscription à la Maison Hafrose.');
  };

  return (
    <footer className="bg-luxury-charcoal text-luxury-cream pt-16 pb-8 border-t border-luxury-gold/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Brand & Narrative */}
        <div className="space-y-4 md:col-span-1">
          <span className="font-serif text-xl tracking-[0.25em] text-luxury-cream block">
            HAFROSE
          </span>
          <p className="text-xs text-luxury-cream/60 leading-relaxed font-sans font-light">
            Maison française d'excellence. Façonnant des créations de haute maroquinerie, horlogerie et joaillerie d'exception pour sublimer le quotidien des esthètes.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="text-luxury-cream/60 hover:text-luxury-gold transition-colors duration-300">
              <FiInstagram size={18} />
            </a>
            <a href="#" className="text-luxury-cream/60 hover:text-luxury-gold transition-colors duration-300">
              <FiFacebook size={18} />
            </a>
            <a href="#" className="text-luxury-cream/60 hover:text-luxury-gold transition-colors duration-300">
              <FiTwitter size={18} />
            </a>
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="font-serif text-sm tracking-widest text-luxury-gold uppercase mb-6 font-medium">
            Collections
          </h3>
          <ul className="space-y-3 text-xs text-luxury-cream/60 font-sans font-light">
            <li>
              <Link to="/shop?category=sacs" className="hover:text-luxury-gold transition-colors duration-300">
                Sacs & Maroquinerie
              </Link>
            </li>
            <li>
              <Link to="/shop?category=bijoux" className="hover:text-luxury-gold transition-colors duration-300">
                Joaillerie fine
              </Link>
            </li>
            <li>
              <Link to="/shop?category=montres" className="hover:text-luxury-gold transition-colors duration-300">
                Horlogerie d'Exception
              </Link>
            </li>
            <li>
              <Link to="/shop?category=lunettes" className="hover:text-luxury-gold transition-colors duration-300">
                Accessoires & Lunettes
              </Link>
            </li>
          </ul>
        </div>

        {/* Boutique Services */}
        <div>
          <h3 className="font-serif text-sm tracking-widest text-luxury-gold uppercase mb-6 font-medium">
            Services
          </h3>
          <ul className="space-y-3 text-xs text-luxury-cream/60 font-sans font-light">
            <li>
              <Link to="/contact" className="hover:text-luxury-gold transition-colors duration-300">
                Prendre rendez-vous
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-luxury-gold transition-colors duration-300">
                Service client
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-luxury-gold transition-colors duration-300">
                Livraison & Retours
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-luxury-gold transition-colors duration-300">
                Conseils d'entretien
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h3 className="font-serif text-sm tracking-widest text-luxury-gold uppercase mb-6 font-medium">
            Newsletter
          </h3>
          <p className="text-xs text-luxury-cream/60 font-sans font-light leading-relaxed">
            Inscrivez-vous pour recevoir les invitations exclusives aux collections privées et actualités de la Maison.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              placeholder="Votre adresse email"
              required
              className="w-full bg-transparent border-b border-luxury-cream/20 text-xs py-2 pr-10 focus:outline-none focus:border-luxury-gold text-luxury-cream placeholder-luxury-cream/40 tracking-wider font-sans transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-luxury-gold hover:text-luxury-cream transition-colors duration-300 cursor-pointer"
              aria-label="S'abonner"
            >
              <FiArrowRight size={16} />
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-luxury-cream/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-luxury-cream/40 font-sans uppercase tracking-widest gap-4">
        <div>
          © {currentYear} Maison Hafrose. Tous droits réservés.
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-luxury-gold transition-colors duration-300">Mentions Légales</a>
          <a href="#" className="hover:text-luxury-gold transition-colors duration-300">Données Personnelles</a>
          <a href="#" className="hover:text-luxury-gold transition-colors duration-300">Conditions de Vente</a>
        </div>
      </div>
    </footer>
  );
}
