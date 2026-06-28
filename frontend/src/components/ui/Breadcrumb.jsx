import { Link } from 'react-router-dom';

/**
 * Premium Luxury Breadcrumbs component
 * @param {Object} props
 * @param {Array} props.items - List of { label, path } objects
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex py-4 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-[10px] uppercase tracking-widest text-luxury-gray hover:text-luxury-gold transition-colors duration-300 font-sans font-light"
          >
            Accueil
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="inline-flex items-center">
              <span className="text-luxury-gray/30 mx-1 text-xs select-none">/</span>
              {isLast ? (
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-sans font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-[10px] uppercase tracking-widest text-luxury-gray hover:text-luxury-gold transition-colors duration-300 font-sans font-light"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
