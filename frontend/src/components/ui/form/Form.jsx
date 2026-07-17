import { clsx } from 'clsx';
import { FormFieldProvider, useFormField } from './FormFieldContext';

/**
 * Luxury Form System — <Form> Component (Phase 2.0.3)
 *
 * Composition-based API following the Hafrose Design System philosophy:
 * "Pureté Radicale · Lenteur Luxueuse · Rigueur Technique"
 *
 * Usage:
 *   <Form onSubmit={handleSubmit}>
 *     <Form.Section title="Coordonnées">
 *       <Form.Row cols={2}>
 *         <Form.Field name="email" error={errors.email}>
 *           <Form.Label required>Email</Form.Label>
 *           <EmailField variant="admin" />
 *           <Form.Helper>Format: nom@domaine.fr</Form.Helper>
 *         </Form.Field>
 *       </Form.Row>
 *     </Form.Section>
 *     <Form.Footer>
 *       <Form.Actions>
 *         <Button type="submit">Valider</Button>
 *       </Form.Actions>
 *     </Form.Footer>
 *   </Form>
 */

/* ─────────────────────────────────────────────
   Responsive cols helper
   cols: number | { default?, sm?, md?, lg? }
   ───────────────────────────────────────────── */
function resolveColsClass(cols) {
  if (!cols || cols === 1) return 'grid-cols-1';

  if (typeof cols === 'number') {
    const map = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6' };
    return map[cols] || 'grid-cols-1';
  }

  const parts = ['grid-cols-1']; // always start 1-col on mobile
  if (cols.sm)  parts.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md)  parts.push(`md:grid-cols-${cols.md}`);
  if (cols.lg)  parts.push(`lg:grid-cols-${cols.lg}`);
  // "default" overrides the base mobile class
  if (cols.default && cols.default !== 1) {
    parts[0] = `grid-cols-${cols.default}`;
  }
  return parts.join(' ');
}

/* ─────────────────────────────────────────────
   <Form> — Root wrapper
   ───────────────────────────────────────────── */
function Form({ onSubmit, noValidate = true, className, children, ...props }) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate={noValidate}
      className={clsx('w-full', className)}
      {...props}
    >
      {children}
    </form>
  );
}

/* ─────────────────────────────────────────────
   <Form.Header>
   ───────────────────────────────────────────── */
Form.Header = function FormHeader({ className, children }) {
  return (
    <div className={clsx('mb-8', className)}>
      {children}
    </div>
  );
};
Form.Header.displayName = 'Form.Header';

/* ─────────────────────────────────────────────
   <Form.Title>
   ───────────────────────────────────────────── */
Form.Title = function FormTitle({ as: Tag = 'h2', className, children }) {
  return (
    <Tag
      className={clsx(
        'font-heading font-light text-anthracite tracking-[0.08em] uppercase',
        'text-[22px] leading-tight',
        className
      )}
    >
      {children}
    </Tag>
  );
};
Form.Title.displayName = 'Form.Title';

/* ─────────────────────────────────────────────
   <Form.Description>
   ───────────────────────────────────────────── */
Form.Description = function FormDescription({ className, children }) {
  return (
    <p
      className={clsx(
        'font-sans font-light text-warm-gray text-[11px] tracking-[0.05em] mt-2',
        className
      )}
    >
      {children}
    </p>
  );
};
Form.Description.displayName = 'Form.Description';

/* ─────────────────────────────────────────────
   <Form.Section>
   Uses <fieldset> + <legend> when title is provided (a11y)
   ───────────────────────────────────────────── */
Form.Section = function FormSection({ title, description, className, children }) {
  if (title) {
    return (
      <fieldset className={clsx('border-0 p-0 m-0 min-w-0', className)}>
        <legend className="text-label text-anthracite/70 mb-5 w-full">
          {title}
        </legend>
        {description && (
          <p className="text-[11px] font-sans text-warm-gray mb-5 -mt-3">
            {description}
          </p>
        )}
        <div className="space-y-6">
          {children}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {children}
    </div>
  );
};
Form.Section.displayName = 'Form.Section';

/* ─────────────────────────────────────────────
   <Form.Row>
   CSS Grid responsive, gap-form-row-gap
   ───────────────────────────────────────────── */
Form.Row = function FormRow({ cols = 1, className, children }) {
  const colsClass = resolveColsClass(cols);
  return (
    <div
      className={clsx(
        'grid',
        colsClass,
        'gap-6',
        className
      )}
    >
      {children}
    </div>
  );
};
Form.Row.displayName = 'Form.Row';

/* ─────────────────────────────────────────────
   <Form.Group>
   Vertical stack: label + input + feedback
   ───────────────────────────────────────────── */
Form.Group = function FormGroup({ className, children }) {
  return (
    <div className={clsx('flex flex-col space-y-1.5', className)}>
      {children}
    </div>
  );
};
Form.Group.displayName = 'Form.Group';

/* ─────────────────────────────────────────────
   <Form.Field>
   Invisible context provider — distributes IDs to children
   ───────────────────────────────────────────── */
Form.Field = function FormField({ name, error, success, className, children }) {
  return (
    <FormFieldProvider name={name} error={error} success={success}>
      <div className={clsx('flex flex-col space-y-1.5', className)}>
        {children}
      </div>
    </FormFieldProvider>
  );
};
Form.Field.displayName = 'Form.Field';

/* ─────────────────────────────────────────────
   <Form.Label>
   ───────────────────────────────────────────── */
Form.Label = function FormLabel({ required, className, children }) {
  const ctx = useFormField();
  return (
    <label
      htmlFor={ctx?.id}
      className={clsx(
        'text-label text-anthracite/80 block select-none',
        className
      )}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          className="ml-1 text-rose-gold"
          title="Champ obligatoire"
        >
          *
        </span>
      )}
    </label>
  );
};
Form.Label.displayName = 'Form.Label';

/* ─────────────────────────────────────────────
   <Form.Helper>
   Hint text below the field
   ───────────────────────────────────────────── */
Form.Helper = function FormHelper({ className, children }) {
  const ctx = useFormField();
  return (
    <p
      id={ctx?.helperId}
      className={clsx(
        'text-[11px] font-sans font-light text-warm-gray leading-relaxed',
        className
      )}
    >
      {children}
    </p>
  );
};
Form.Helper.displayName = 'Form.Helper';

/* ─────────────────────────────────────────────
   <Form.Error>
   Inline error message — aria-live for screen readers
   ───────────────────────────────────────────── */
Form.Error = function FormError({ animate = true, className, children }) {
  const ctx = useFormField();
  const message = children || ctx?.errorMessage;
  if (!message) return null;

  return (
    <span
      id={ctx?.errorId}
      role="alert"
      aria-live="polite"
      className={clsx(
        'text-[10px] font-sans font-light text-error-text block',
        animate && 'animate-form-error',
        className
      )}
    >
      {message}
    </span>
  );
};
Form.Error.displayName = 'Form.Error';

/* ─────────────────────────────────────────────
   <Form.Success>
   Inline success message
   ───────────────────────────────────────────── */
Form.Success = function FormSuccess({ animate = true, className, children }) {
  const ctx = useFormField();
  const message = children || ctx?.successMessage;
  if (!message) return null;

  return (
    <span
      aria-live="polite"
      className={clsx(
        'text-[10px] font-sans font-light text-success-text block',
        animate && 'animate-form-success',
        className
      )}
    >
      {message}
    </span>
  );
};
Form.Success.displayName = 'Form.Success';

/* ─────────────────────────────────────────────
   <Form.Counter>
   Character counter for Textarea fields
   ───────────────────────────────────────────── */
Form.Counter = function FormCounter({ current = 0, max, className }) {
  const isNearLimit = max && current >= Math.floor(max * 0.9);
  const isAtLimit   = max && current >= max;

  return (
    <span
      aria-live="polite"
      aria-atomic="true"
      className={clsx(
        'text-[9px] font-mono text-right block',
        isAtLimit   && 'text-error-text',
        isNearLimit && !isAtLimit && 'text-warning-text',
        !isNearLimit && 'text-warm-gray/70',
        className
      )}
    >
      {max ? `${current} / ${max}` : current}
    </span>
  );
};
Form.Counter.displayName = 'Form.Counter';

/* ─────────────────────────────────────────────
   <Form.Divider>
   1px horizontal rule — aria-hidden
   ───────────────────────────────────────────── */
Form.Divider = function FormDivider({ className }) {
  return (
    <hr
      aria-hidden="true"
      className={clsx('h-px bg-beige border-0 my-6', className)}
    />
  );
};
Form.Divider.displayName = 'Form.Divider';

/* ─────────────────────────────────────────────
   <Form.Footer>
   Bottom area, separated by top border
   ───────────────────────────────────────────── */
Form.Footer = function FormFooter({ className, children }) {
  return (
    <div className={clsx('mt-8 pt-6 border-t border-beige', className)}>
      {children}
    </div>
  );
};
Form.Footer.displayName = 'Form.Footer';

/* ─────────────────────────────────────────────
   <Form.Actions>
   Button row — right-aligned by default
   ───────────────────────────────────────────── */
Form.Actions = function FormActions({ align = 'right', className, children }) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3',
        align === 'right'  && 'justify-end',
        align === 'left'   && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'spread' && 'justify-between',
        className
      )}
    >
      {children}
    </div>
  );
};
Form.Actions.displayName = 'Form.Actions';

Form.displayName = 'Form';

export default Form;
