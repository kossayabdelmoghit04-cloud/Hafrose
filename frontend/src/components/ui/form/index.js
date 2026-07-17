/**
 * Luxury Form System — Barrel Export (Phase 2.0.3)
 *
 * Single entry point for all Form System components.
 *
 * Usage:
 *   import { Form, Input, PasswordField, EmailField, Select } from '@/components/ui/form';
 *
 * Context (advanced):
 *   import { useFormField } from '@/components/ui/form/FormFieldContext';
 */

// ── Structural ──────────────────────────────────────────────────────────────
export { default as Form } from './Form';

// ── Input Fields ─────────────────────────────────────────────────────────────
export { default as Input }         from '../Input';      // Refactored, stays at root
export { default as Textarea }      from './Textarea';
export { default as Select }        from './Select';
export { default as PasswordField } from './PasswordField';
export { default as EmailField }    from './EmailField';
export { default as NumberField }   from './NumberField';

// ── Toggle Fields ─────────────────────────────────────────────────────────────
export { default as Switch }        from './Switch';
export { default as Checkbox }      from './Checkbox';
export { default as Radio }         from './Radio';

// ── Context (for advanced custom field composition) ───────────────────────────
export { useFormField, FormFieldProvider } from './FormFieldContext';

// ── Phase 2.0.4 (Upcoming) ────────────────────────────────────────────────────
// export { default as UploadField }   from './UploadField';
// export { default as ImagePicker }   from './ImagePicker';
// export { default as GalleryPicker } from './GalleryPicker';
// export { default as SlugField }     from './SlugField';
// export { default as PriceField }    from './PriceField';
// export { default as SearchField }   from './SearchField';
// export { default as LocationField } from './LocationField';
// export { default as ColorField }    from './ColorField';
// export { default as DateField }     from './DateField';
// export { default as Autocomplete }  from './Autocomplete';
// export { default as HiddenField }   from './HiddenField';
// export { default as FilePreview }   from './FilePreview';
