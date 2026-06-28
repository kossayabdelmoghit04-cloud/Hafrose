import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Minimal Luxury Pagination component
 * @param {Object} props
 * @param {number} props.currentPage - Active page index
 * @param {number} props.lastPage - Total number of pages
 * @param {function} props.onPageChange - Handler callback when a page is selected
 */
export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null;

  // Generate range of page numbers to show
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(lastPage, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <nav className="flex items-center justify-center space-x-2 my-12" aria-label="Pagination">
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-10 h-10 flex items-center justify-center border border-luxury-charcoal/5 text-luxury-charcoal hover:border-luxury-gold/40 hover:text-luxury-gold disabled:opacity-30 disabled:hover:border-luxury-charcoal/5 disabled:hover:text-luxury-charcoal transition-all duration-300 rounded-none cursor-pointer disabled:cursor-not-allowed"
        aria-label="Page précédente"
      >
        <FiChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {startPageHasGap(pages, 1) && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="w-10 h-10 font-sans text-xs tracking-wider border border-luxury-charcoal/5 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-300 rounded-none cursor-pointer"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="w-8 h-10 flex items-end justify-center pb-2 text-luxury-gray text-xs font-light">
              ...
            </span>
          )}
        </>
      )}

      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 font-sans text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer ${
              isActive
                ? 'bg-luxury-charcoal text-luxury-cream border border-luxury-charcoal'
                : 'border border-luxury-charcoal/5 text-luxury-charcoal hover:border-luxury-gold/40 hover:text-luxury-gold'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {endPageHasGap(pages, lastPage) && (
        <>
          {pages[pages.length - 1] < lastPage - 1 && (
            <span className="w-8 h-10 flex items-end justify-center pb-2 text-luxury-gray text-xs font-light">
              ...
            </span>
          )}
          <button
            type="button"
            onClick={() => onPageChange(lastPage)}
            className="w-10 h-10 font-sans text-xs tracking-wider border border-luxury-charcoal/5 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all duration-300 rounded-none cursor-pointer"
          >
            {lastPage}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-10 h-10 flex items-center justify-center border border-luxury-charcoal/5 text-luxury-charcoal hover:border-luxury-gold/40 hover:text-luxury-gold disabled:opacity-30 disabled:hover:border-luxury-charcoal/5 disabled:hover:text-luxury-charcoal transition-all duration-300 rounded-none cursor-pointer disabled:cursor-not-allowed"
        aria-label="Page suivante"
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
}

// Helpers for ellipses gap logic
function startPageHasGap(visiblePages, firstPage) {
  return visiblePages.length > 0 && visiblePages[0] > firstPage;
}

function endPageHasGap(visiblePages, lastPage) {
  return visiblePages.length > 0 && visiblePages[visiblePages.length - 1] < lastPage;
}
