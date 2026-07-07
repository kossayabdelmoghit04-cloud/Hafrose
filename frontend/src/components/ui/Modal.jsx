import { 
  createContext, 
  useContext, 
  useEffect, 
  useRef, 
  useId, 
  useMemo, 
  forwardRef, 
  memo 
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
const clsx = (...classes) => classes.filter(Boolean).join(' ');
import { FiX } from 'react-icons/fi';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal sub-components must be used within <Modal>');
  }
  return context;
};

/**
 * Luxury Modal Component — Hafrose Design System
 * Polymorphic, accessible (WCAG 2.2 AA), high performance.
 */
const Modal = ({
  isOpen,
  onClose,
  variant = 'default',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  children
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const previousFocusRef = useRef(null);

  // Sauvegarder et restaurer le focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else if (previousFocusRef.current) {
      const timer = setTimeout(() => {
        previousFocusRef.current?.focus?.();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Verrouillage du scroll du body
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const contextValue = useMemo(() => ({
    isOpen,
    onClose,
    variant,
    size,
    closeOnBackdrop,
    closeOnEsc,
    titleId,
    descriptionId
  }), [isOpen, onClose, variant, size, closeOnBackdrop, closeOnEsc, titleId, descriptionId]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <ModalContext.Provider value={contextValue}>
      <AnimatePresence>
        {isOpen && children}
      </AnimatePresence>
    </ModalContext.Provider>,
    document.body
  );
};

/* ── 1. BACKDROP SUB-COMPONENT ── */
const Backdrop = memo(() => {
  const { onClose, closeOnBackdrop } = useModal();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => closeOnBackdrop && onClose()}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      aria-hidden="true"
    />
  );
});
Backdrop.displayName = 'Modal.Backdrop';

/* ── 2. CONTAINER SUB-COMPONENT (Focus Trap, Esc close, Animations) ── */
const Container = forwardRef(({ 
  as: Component = 'div', 
  className, 
  children, 
  ...props 
}, ref) => {
  const { variant, size, onClose, closeOnEsc, titleId, descriptionId } = useModal();
  const localRef = useRef(null);

  // Gérer la touche Échap et le Focus Trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && localRef.current) {
        const focusableElements = localRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement || document.activeElement === localRef.current) {
            lastElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto focus sur le conteneur ou le premier élément interactif
    if (localRef.current) {
      const focusable = localRef.current.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        localRef.current.focus();
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, onClose]);

  const isDrawer = variant.startsWith('drawer-');

  // Animation specifications
  const animationProps = useMemo(() => {
    if (variant === 'drawer-right') {
      return {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      };
    }
    if (variant === 'drawer-left') {
      return {
        initial: { x: '-100%' },
        animate: { x: 0 },
        exit: { x: '-100%' },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      };
    }
    if (variant === 'drawer-bottom') {
      return {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      };
    }
    // Centered modals
    return {
      initial: { opacity: 0, scale: 0.95, y: 15 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 15 },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
    };
  }, [variant]);

  // Styles de dimensions pour les modales centrées
  const sizeClasses = {
    xs: 'w-full max-w-xs',
    sm: 'w-full max-w-md',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
    full: 'w-full max-w-full h-full'
  }[size];

  // Styles de structure des conteneurs
  const variantClasses = {
    default: 'bg-luxury-cream border border-luxury-gold/30 rounded-none shadow-modal',
    confirmation: 'bg-luxury-cream border border-luxury-gold/15 rounded-lg shadow-modal',
    danger: 'bg-luxury-cream border border-red-500/25 rounded-lg shadow-modal',
    success: 'bg-luxury-cream border border-emerald-500/25 rounded-lg shadow-modal',
    admin: 'bg-luxury-cream border border-luxury-gold/20 rounded-lg shadow-modal',
    image: 'bg-transparent border-none shadow-none',
    fullscreen: 'w-screen h-screen max-w-none max-h-none rounded-none m-0 border-none bg-luxury-cream',
    'drawer-right': 'fixed right-0 top-0 h-full w-full sm:w-[400px] border-l border-luxury-gold/10 rounded-none bg-luxury-cream shadow-modal',
    'drawer-left': 'fixed left-0 top-0 h-full w-[300px] border-r border-luxury-gold/10 rounded-none bg-luxury-cream shadow-modal',
    'drawer-bottom': 'fixed bottom-0 left-0 right-0 w-full max-h-[80vh] border-t border-luxury-gold/10 rounded-t-lg bg-luxury-cream shadow-modal'
  }[variant];

  // Fusionner les références
  const setRefs = (node) => {
    localRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div className={clsx(
      !isDrawer && "fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto pointer-events-none"
    )}>
      <motion.div
        {...animationProps}
        ref={setRefs}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex="-1"
        className={clsx(
          "pointer-events-auto focus:outline-none flex flex-col",
          !isDrawer && sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
});
Container.displayName = 'Modal.Container';

/* ── 3. HEADER SUB-COMPONENT ── */
const Header = forwardRef(({ as: Component = 'div', className, children, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={clsx(
        "flex items-center justify-between px-6 py-4 border-b border-luxury-gold/10",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Header.displayName = 'Modal.Header';

/* ── 4. TITLE SUB-COMPONENT ── */
const Title = forwardRef(({ as: Component = 'h3', className, children, ...props }, ref) => {
  const { titleId } = useModal();
  return (
    <Component
      ref={ref}
      id={titleId}
      className={clsx(
        "font-serif text-lg text-luxury-charcoal",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Title.displayName = 'Modal.Title';

/* ── 5. DESCRIPTION SUB-COMPONENT ── */
const Description = forwardRef(({ as: Component = 'p', className, children, ...props }, ref) => {
  const { descriptionId } = useModal();
  return (
    <Component
      ref={ref}
      id={descriptionId}
      className={clsx(
        "text-xs text-luxury-gray font-sans",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Description.displayName = 'Modal.Description';

/* ── 6. BODY SUB-COMPONENT ── */
const Body = forwardRef(({ as: Component = 'div', className, children, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={clsx(
        "p-6 overflow-y-auto flex-grow",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Body.displayName = 'Modal.Body';

/* ── 7. FOOTER SUB-COMPONENT ── */
const Footer = forwardRef(({ as: Component = 'div', className, children, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={clsx(
        "px-6 py-4 border-t border-luxury-gold/10 flex items-center justify-between bg-luxury-light-gray/20",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Footer.displayName = 'Modal.Footer';

/* ── 8. ACTIONS SUB-COMPONENT ── */
const Actions = forwardRef(({ as: Component = 'div', className, children, ...props }, ref) => {
  return (
    <Component
      ref={ref}
      className={clsx(
        "flex gap-3 justify-end ml-auto",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});
Actions.displayName = 'Modal.Actions';

/* ── 9. CLOSE BUTTON SUB-COMPONENT ── */
const CloseButton = memo(({ className, onClick, ...props }) => {
  const { onClose } = useModal();
  return (
    <button
      type="button"
      onClick={onClick || onClose}
      className={clsx(
        "absolute top-4 right-4 p-1.5 rounded text-luxury-gray hover:text-luxury-charcoal hover:bg-luxury-gold/5 transition-all duration-300 cursor-pointer focus-visible:outline-luxury",
        className
      )}
      aria-label="Fermer"
      {...props}
    >
      <FiX className="w-5 h-5" />
    </button>
  );
});
CloseButton.displayName = 'Modal.CloseButton';

// Attacher les sous-composants au parent
Modal.Backdrop = Backdrop;
Modal.Container = Container;
Modal.Header = Header;
Modal.Title = Title;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.Actions = Actions;
Modal.CloseButton = CloseButton;

export default memo(Modal);
