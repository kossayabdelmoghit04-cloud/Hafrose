import React, { useMemo, memo } from 'react';
import Button from './Button';
import { 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiCheck, 
  FiX, 
  FiDownload, 
  FiPrinter, 
  FiUpload 
} from 'react-icons/fi';

const PRESETS = {
  edit: { variant: 'secondary', icon: <FiEdit className="w-3.5 h-3.5" />, ariaLabel: 'Modifier' },
  delete: { variant: 'danger', icon: <FiTrash2 className="w-3.5 h-3.5" />, ariaLabel: 'Supprimer' },
  view: { variant: 'ghost', icon: <FiEye className="w-3.5 h-3.5" />, ariaLabel: 'Consulter' },
  approve: { variant: 'success', icon: <FiCheck className="w-3.5 h-3.5" />, ariaLabel: 'Approuver' },
  reject: { variant: 'danger', icon: <FiX className="w-3.5 h-3.5" />, ariaLabel: 'Rejeter' },
  download: { variant: 'secondary', icon: <FiDownload className="w-3.5 h-3.5" />, ariaLabel: 'Télécharger' },
  print: { variant: 'secondary', icon: <FiPrinter className="w-3.5 h-3.5" />, ariaLabel: 'Imprimer' },
  upload: { variant: 'primary', icon: <FiUpload className="w-3.5 h-3.5" />, ariaLabel: 'Téléverser' }
};

const AdminActionButton = memo(({
  action,
  icon,
  label,
  variant,
  size = 'xs',
  title,
  'aria-label': ariaLabel,
  className = '',
  children,
  ...props
}) => {
  const resolved = useMemo(() => {
    const key = (action || variant || '').toLowerCase();
    const preset = PRESETS[key];

    // If variant is a preset key, resolve to the preset's real variant
    const resolvedVariant = (preset && !action) 
      ? preset.variant 
      : (variant || (preset ? preset.variant : 'secondary'));
      
    const resolvedIcon = icon || (preset ? preset.icon : null);
    const resolvedAriaLabel = ariaLabel || title || (preset ? preset.ariaLabel : '');

    return {
      variant: resolvedVariant,
      icon: resolvedIcon,
      ariaLabel: resolvedAriaLabel
    };
  }, [action, icon, variant, ariaLabel, title]);

  const hasText = !!(label || children);

  const accessibilityProps = useMemo(() => {
    if (!hasText) {
      return {
        'aria-label': resolved.ariaLabel || 'Action',
        title: title || resolved.ariaLabel || 'Action'
      };
    }
    return {
      title: title || undefined
    };
  }, [hasText, resolved.ariaLabel, title]);

  return (
    <Button
      variant={resolved.variant}
      size={size}
      icon={resolved.icon}
      className={className}
      {...accessibilityProps}
      {...props}
    >
      {label || children}
    </Button>
  );
});

AdminActionButton.displayName = 'AdminActionButton';

export default AdminActionButton;
