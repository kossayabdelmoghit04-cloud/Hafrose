import { createContext, useContext, useId } from 'react';

/**
 * FormFieldContext — Luxury Form System (Phase 2.0.3)
 *
 * Distributes accessible IDs and state to all children of <Form.Field>.
 * This eliminates manual ID management and ensures WCAG 2.2 AA compliance
 * for aria-describedby, aria-invalid, and aria-required across all inputs.
 */

const FormFieldContext = createContext(null);

/**
 * FormFieldProvider — wraps a single field group.
 * @param {string}  name      - Unique field name (used to build stable IDs)
 * @param {string}  [error]   - Error message string; sets aria-invalid on the input
 * @param {*}       [success] - Success message or boolean
 * @param {React.ReactNode} children
 */
export function FormFieldProvider({ name, error, success, children }) {
  const uid = useId(); // Stable across renders (React 18+)
  const baseId = `field-${name}-${uid.replace(/:/g, '')}`;

  const value = {
    id: baseId,
    errorId: `${baseId}-error`,
    helperId: `${baseId}-helper`,
    hasError: Boolean(error),
    hasSuccess: Boolean(success),
    errorMessage: error || null,
    successMessage: typeof success === 'string' ? success : null,
  };

  return (
    <FormFieldContext.Provider value={value}>
      {children}
    </FormFieldContext.Provider>
  );
}

/**
 * useFormField — consume context from any child of <Form.Field>.
 * Returns null if used outside a FormFieldProvider (graceful degradation).
 */
export function useFormField() {
  return useContext(FormFieldContext);
}

export default FormFieldContext;
