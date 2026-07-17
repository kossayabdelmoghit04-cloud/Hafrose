import React, { createContext, useContext, useMemo, useState, useEffect, memo, forwardRef } from 'react';
import { 
  FiSearch, 
  FiInbox, 
  FiImage, 
  FiArrowUp, 
  FiArrowDown, 
  FiCalendar, 
  FiX, 
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
const clsx = (...classes) => classes.filter(Boolean).join(' ');
import Button from './Button';

// ----------------------------------------------------------------------
// TableContext
// ----------------------------------------------------------------------
const TableContext = createContext({
  variant: 'admin',
  density: 'comfortable',
  resetPage: () => {}
});

// ----------------------------------------------------------------------
// 1. Table (Racine)
// ----------------------------------------------------------------------
export const Table = memo(({
  children,
  variant = 'admin',
  density = 'comfortable',
  'aria-label': ariaLabel,
  resetPage = () => {},
  className = '',
  ...props
}) => {
  const contextValue = useMemo(() => ({
    variant,
    density,
    resetPage
  }), [variant, density, resetPage]);

  const variantWrapperClass = useMemo(() => {
    switch (variant) {
      case 'admin':
      case 'financial':
        return 'bg-[--color-table-bg] border border-[--color-table-border] rounded-lg shadow-[--shadow-card-soft]';
      case 'flat':
        return 'bg-[--color-table-bg] border border-[--color-table-border] rounded-lg';
      case 'modal':
        return 'bg-white border border-[--color-table-border] rounded';
      case 'dashboard':
      case 'striped':
      case 'borderless':
      case 'summary':
      default:
        return 'bg-transparent';
    }
  }, [variant]);

  return (
    <TableContext.Provider value={contextValue}>
      <div 
        role="region" 
        aria-label={ariaLabel} 
        className={clsx('w-full flex flex-col', variantWrapperClass, className)}
        {...props}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
});

Table.displayName = 'Table';

// ----------------------------------------------------------------------
// 2. Table.Toolbar
// ----------------------------------------------------------------------
export const TableToolbar = memo(({ children, className = '', ...props }) => {
  return (
    <div 
      role="toolbar"
      className={clsx(
        'flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 p-4 border-b border-[--color-table-border]',
        className
      )}
      {...props}
    >
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 flex-1">
        {children}
      </div>
    </div>
  );
});

TableToolbar.displayName = 'Table.Toolbar';

// ----------------------------------------------------------------------
// 3. Table.Search
// ----------------------------------------------------------------------
export const TableSearch = memo(({
  value,
  onChange,
  placeholder = 'Rechercher...',
  debounce = 0,
  className = '',
  ...props
}) => {
  const { resetPage } = useContext(TableContext);
  const [localValue, setLocalValue] = useState(value || '');

  // Synchronise value prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounce <= 0) return;
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
        resetPage();
      }
    }, debounce);
    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange, value, resetPage]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    if (debounce <= 0) {
      onChange(val);
      resetPage();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    resetPage();
  };

  return (
    <div className={clsx('relative flex items-center bg-luxury-light-gray/40 rounded border border-luxury-gold/10 w-full sm:max-w-xs px-3 py-2', className)}>
      <FiSearch className="text-luxury-gray shrink-0 mr-2" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Rechercher dans le tableau"
        className="bg-transparent border-none outline-none text-sm text-luxury-charcoal w-full pr-6"
        {...props}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
          className="absolute right-2 text-luxury-gray hover:text-luxury-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-table-focus-ring]"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

TableSearch.displayName = 'Table.Search';

// ----------------------------------------------------------------------
// 4. Table.Filter
// ----------------------------------------------------------------------
export const TableFilter = memo(({
  label,
  options = [],
  value,
  onChange,
  allLabel = 'Tous',
  className = '',
  ...props
}) => {
  const { resetPage } = useContext(TableContext);

  const handleChange = (e) => {
    onChange(e.target.value);
    resetPage();
  };

  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-center gap-1.5', className)}>
      {label && (
        <span className="text-xs text-luxury-gray font-semibold whitespace-nowrap hidden sm:inline">
          {label} :
        </span>
      )}
      <select
        value={value}
        onChange={handleChange}
        aria-label={label || 'Filtrer les données'}
        className="px-3 py-2 bg-white border border-luxury-gold/15 rounded text-sm outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[--color-table-focus-ring]"
        {...props}
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

TableFilter.displayName = 'Table.Filter';

// ----------------------------------------------------------------------
// 4bis. Table.DateFilter
// ----------------------------------------------------------------------
export const TableDateFilter = memo(({
  label,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const { resetPage } = useContext(TableContext);

  const handleChange = (e) => {
    onChange(e.target.value);
    resetPage();
  };

  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-center gap-1.5', className)}>
      {label && (
        <span className="text-xs text-luxury-gray font-semibold whitespace-nowrap hidden sm:inline">
          {label} :
        </span>
      )}
      <div className="relative flex items-center bg-white border border-luxury-gold/15 rounded px-3 py-2">
        <FiCalendar className="text-luxury-gray mr-2 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={handleChange}
          aria-label={label || 'Filtrer par date'}
          className="bg-transparent border-none outline-none text-sm text-luxury-charcoal cursor-pointer"
          {...props}
        />
      </div>
    </div>
  );
});

TableDateFilter.displayName = 'Table.DateFilter';

// ----------------------------------------------------------------------
// 5. Table.Actions
// ----------------------------------------------------------------------
export const TableActions = memo(({ children, className = '', ...props }) => {
  return (
    <div className={clsx('flex items-center gap-2 ml-auto', className)} {...props}>
      {children}
    </div>
  );
});

TableActions.displayName = 'Table.Actions';

// ----------------------------------------------------------------------
// 6. Table.ResultCount
// ----------------------------------------------------------------------
export const TableResultCount = memo(({ count, label = 'résultat(s)', className = '', ...props }) => {
  return (
    <span 
      className={clsx('text-xs text-luxury-gray font-semibold self-center whitespace-nowrap mr-2', className)}
      {...props}
    >
      {count !== undefined ? `${count} ${label}` : ''}
    </span>
  );
});

TableResultCount.displayName = 'Table.ResultCount';

// ----------------------------------------------------------------------
// 7. Table.Container
// ----------------------------------------------------------------------
export const TableContainer = memo(({ children, className = '', ...props }) => {
  return (
    <div className={clsx('overflow-x-auto w-full scrollbar-thin', className)}>
      <table className="w-full text-sm text-left border-collapse" {...props}>
        {children}
      </table>
    </div>
  );
});

TableContainer.displayName = 'Table.Container';

// ----------------------------------------------------------------------
// 8. Table.Head
// ----------------------------------------------------------------------
export const TableHead = memo(({ children, sticky = false, className = '', ...props }) => {
  return (
    <thead 
      className={clsx(
        'bg-[--color-table-head-bg] border-b border-[--color-table-head-border]',
        sticky && 'sticky top-0 z-10',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
});

TableHead.displayName = 'Table.Head';

// ----------------------------------------------------------------------
// 9. Table.HeadRow
// ----------------------------------------------------------------------
export const TableHeadRow = memo(({ children, className = '', ...props }) => {
  return (
    <tr className={clsx('border-b border-[--color-table-head-border]', className)} {...props}>
      {children}
    </tr>
  );
});

TableHeadRow.displayName = 'Table.HeadRow';

// ----------------------------------------------------------------------
// 10. Table.HeadCell
// ----------------------------------------------------------------------
export const TableHeadCell = memo(({
  children,
  align = 'left',
  width,
  sortable = false,
  sortDirection = 'none',
  onSort,
  hideBelow,
  className = '',
  ...props
}) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  
  const hideClass = hideBelow ? `hidden ${hideBelow}:table-cell` : '';

  const sortIcon = useMemo(() => {
    if (!sortable) return null;
    if (sortDirection === 'asc') return <FiArrowUp className="w-3 h-3 ml-1 shrink-0 text-luxury-gold transition-transform duration-200" />;
    if (sortDirection === 'desc') return <FiArrowDown className="w-3 h-3 ml-1 shrink-0 text-luxury-gold transition-transform duration-200" />;
    return <FiArrowUp className="w-3 h-3 ml-1 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity duration-200" />;
  }, [sortable, sortDirection]);

  const cellContent = sortable ? (
    <button
      type="button"
      onClick={onSort}
      className={clsx(
        'group inline-flex items-center hover:text-luxury-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-table-focus-ring] rounded px-1 -mx-1 py-0.5',
        align === 'right' && 'justify-end w-full'
      )}
    >
      {children}
      {sortIcon}
    </button>
  ) : children;

  return (
    <th
      scope="col"
      className={clsx(
        'px-6 py-4 text-xs font-semibold text-[--color-table-head-text] uppercase tracking-wider whitespace-nowrap',
        alignClass,
        width,
        hideClass,
        className
      )}
      aria-sort={sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined}
      {...props}
    >
      {cellContent}
    </th>
  );
});

TableHeadCell.displayName = 'Table.HeadCell';

// ----------------------------------------------------------------------
// 11. Table.Body
// ----------------------------------------------------------------------
export const TableBody = memo(({
  children,
  loading = false,
  skeletonRows = 5,
  skeletonColumns = 5,
  isFetching = false,
  className = '',
  ...props
}) => {
  const content = useMemo(() => {
    if (loading) {
      return Array.from({ length: skeletonRows }).map((_, rIdx) => (
        <TableSkeletonRow key={`sk-${rIdx}`} columns={skeletonColumns} />
      ));
    }
    return children;
  }, [loading, skeletonRows, skeletonColumns, children]);

  return (
    <tbody 
      className={clsx(
        'bg-[--color-table-bg] transition-opacity duration-200', 
        isFetching && 'opacity-65',
        className
      )}
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {content}
    </tbody>
  );
});

TableBody.displayName = 'Table.Body';

// ----------------------------------------------------------------------
// 12. Table.Row
// ----------------------------------------------------------------------
export const TableRow = memo(forwardRef(({
  children,
  hoverable = true,
  clickable = false,
  selected = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const { variant } = useContext(TableContext);

  const rowClasses = useMemo(() => {
    const isInteractive = clickable || !!onClick;
    return clsx(
      'border-b border-[--color-table-border] last:border-b-0 transition-colors duration-150 outline-none',
      hoverable && !disabled && 'hover:bg-[--color-table-row-hover-bg]',
      selected && 'bg-[--color-table-row-selected-bg]',
      disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
      isInteractive && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[--color-table-focus-ring]',
      variant === 'striped' && 'odd:bg-[--color-table-stripe-bg]'
    );
  }, [hoverable, clickable, onClick, selected, disabled, variant]);

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) onClick(e);
    }
  };

  return (
    <tr
      ref={ref}
      className={clsx(rowClasses, className)}
      tabIndex={clickable || !!onClick ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={clickable || !!onClick ? handleKeyDown : undefined}
      aria-selected={selected ? 'true' : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      {...props}
    >
      {children}
    </tr>
  );
}));

TableRow.displayName = 'Table.Row';

// ----------------------------------------------------------------------
// 13. Table.Cell
// ----------------------------------------------------------------------
export const TableCell = memo(({
  children,
  align = 'left',
  numeric = false,
  truncate = false,
  width,
  colSpan = 1,
  hideBelow,
  className = '',
  ...props
}) => {
  const { density } = useContext(TableContext);

  const cellClasses = useMemo(() => {
    const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    const hideClass = hideBelow ? `hidden ${hideBelow}:table-cell` : '';
    
    const densityPadY = density === 'compact' ? 'py-2' : density === 'spacious' ? 'py-5' : 'py-4';
    const densityPadX = density === 'compact' ? 'px-4' : density === 'spacious' ? 'px-8' : 'px-6';
    
    return clsx(
      'align-middle text-[--color-table-body-text]',
      alignClass,
      hideClass,
      densityPadX,
      densityPadY,
      numeric && 'font-mono [font-variant-numeric:tabular-nums]',
      truncate && 'max-w-xs truncate'
    );
  }, [align, numeric, truncate, hideBelow, density]);

  return (
    <td 
      className={clsx(cellClasses, width, className)}
      colSpan={colSpan}
      title={truncate && typeof children === 'string' ? children : undefined}
      {...props}
    >
      {children}
    </td>
  );
});

TableCell.displayName = 'Table.Cell';

// ----------------------------------------------------------------------
// 14. Table.ImageCell
// ----------------------------------------------------------------------
export const TableImageCell = memo(({
  src,
  alt,
  size = 'md',
  rounded = false,
  className = '',
  ...props
}) => {
  const [failed, setFailed] = useState(false);

  const sizeClass = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-[--size-image-cell-sm] h-[--size-image-cell-sm]';
      case 'lg': return 'w-[--size-image-cell-lg] h-[--size-image-cell-lg]';
      case 'md':
      default:
        return 'w-[--size-image-cell-md] h-[--size-image-cell-md]';
    }
  }, [size]);

  if (!src || failed) {
    return (
      <div 
        className={clsx(
          'bg-[--color-image-cell-placeholder-bg] flex items-center justify-center border border-dashed border-[--color-image-cell-border] text-[--color-image-cell-placeholder-icon] shrink-0',
          sizeClass,
          rounded ? 'rounded' : 'rounded-none',
          className
        )}
        aria-label="Aucune image"
        {...props}
      >
        <FiImage className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className={clsx('relative border border-[--color-image-cell-border] shrink-0 overflow-hidden', sizeClass, rounded ? 'rounded' : 'rounded-none', className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover object-center"
        {...props}
      />
    </div>
  );
});

TableImageCell.displayName = 'Table.ImageCell';

// ----------------------------------------------------------------------
// 15. Table.PrimaryText & SecondaryText
// ----------------------------------------------------------------------
export const TablePrimaryText = memo(({ children, className = '', ...props }) => {
  return (
    <div className={clsx('font-semibold text-[--color-table-body-text] text-sm leading-tight', className)} {...props}>
      {children}
    </div>
  );
});

TablePrimaryText.displayName = 'Table.PrimaryText';

export const TableSecondaryText = memo(({ children, className = '', ...props }) => {
  return (
    <div className={clsx('text-xs text-[--color-table-secondary-text] mt-0.5 leading-tight', className)} {...props}>
      {children}
    </div>
  );
});

TableSecondaryText.displayName = 'Table.SecondaryText';

// ----------------------------------------------------------------------
// 16. Table.StatusBadge
// ----------------------------------------------------------------------
export const TableStatusBadge = memo(({
  status,
  label,
  size = 'xs',
  dot = false,
  className = '',
  ...props
}) => {
  const normStatus = (status || '').toLowerCase();

  const statusLabel = useMemo(() => {
    if (label) return label;
    switch (normStatus) {
      case 'pending':
      case 'pending_mod':
        return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      case 'refunded': return 'Remboursée';
      case 'draft': return 'Brouillon';
      case 'published': return 'Publié';
      case 'hidden': return 'Masqué';
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'success': return 'Succès';
      case 'warning': return 'Attention';
      case 'danger': return 'Erreur';
      case 'info': return 'Info';
      case 'neutral': return 'Neutre';
      default:
        return status;
    }
  }, [normStatus, label, status]);

  if (dot) {
    const dotColorClass = normStatus === 'unread' ? 'bg-[--color-status-unread-dot]' : 'bg-transparent';
    return (
      <span 
        title={statusLabel} 
        className={clsx('w-2.5 h-2.5 rounded-full block shrink-0', dotColorClass, className)}
        {...props}
      />
    );
  }

  const badgeColorClass = useMemo(() => {
    switch (normStatus) {
      case 'pending':
      case 'pending_mod':
      case 'warning':
      case 'low_stock':
        return 'bg-[--color-status-pending-bg] text-[--color-status-pending-text] border border-[--color-status-pending-border]';
      case 'confirmed':
      case 'info':
        return 'bg-[--color-status-confirmed-bg] text-[--color-status-confirmed-text] border border-[--color-status-confirmed-border]';
      case 'processing':
        return 'bg-[--color-status-processing-bg] text-[--color-status-processing-text] border border-[--color-status-processing-border]';
      case 'shipped':
        return 'bg-[--color-status-shipped-bg] text-[--color-status-shipped-text] border border-[--color-status-shipped-border]';
      case 'delivered':
      case 'published':
      case 'active':
      case 'approved':
      case 'success':
        return 'bg-[--color-status-delivered-bg] text-[--color-status-delivered-text] border border-[--color-status-delivered-border]';
      case 'cancelled':
      case 'hidden':
      case 'rejected':
      case 'danger':
      case 'out_stock':
        return 'bg-[--color-status-cancelled-bg] text-[--color-status-cancelled-text] border border-[--color-status-cancelled-border]';
      case 'refunded':
      case 'draft':
      case 'inactive':
      case 'neutral':
      default:
        return 'bg-[--color-status-refunded-bg] text-[--color-status-refunded-text] border border-[--color-status-refunded-border]';
    }
  }, [normStatus]);

  return (
    <span
      role="status"
      className={clsx(
        'inline-flex items-center gap-1 rounded-[2px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap',
        size === 'xs' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]',
        badgeColorClass,
        className
      )}
      {...props}
    >
      {statusLabel}
    </span>
  );
});

TableStatusBadge.displayName = 'Table.StatusBadge';

// ----------------------------------------------------------------------
// 17. Table.StockIndicator
// ----------------------------------------------------------------------
export const TableStockIndicator = memo(({
  value,
  threshold = 2,
  outOfStockLabel = 'Rupture',
  className = '',
  ...props
}) => {
  if (value === 0) {
    return <TableStatusBadge status="out_stock" label={outOfStockLabel} className={className} {...props} />;
  }
  if (value <= threshold) {
    return <TableStatusBadge status="low_stock" label={`Stock Bas: ${value}`} className={className} {...props} />;
  }
  return (
    <span className={clsx('text-[--color-table-body-text] text-sm', className)} {...props}>
      {value}
    </span>
  );
});

TableStockIndicator.displayName = 'Table.StockIndicator';

// ----------------------------------------------------------------------
// 18. Table.RowActions
// ----------------------------------------------------------------------
export const TableRowActions = memo(({ children, className = '', ...props }) => {
  return (
    <div className={clsx('flex items-center justify-end gap-2', className)} {...props}>
      {children}
    </div>
  );
});

TableRowActions.displayName = 'Table.RowActions';

// ----------------------------------------------------------------------
// 19. Table.SkeletonRow
// ----------------------------------------------------------------------
export const TableSkeletonRow = memo(({ columns = 5, className = '', ...props }) => {
  const { density } = useContext(TableContext);

  const padY = density === 'compact' ? 'py-2' : density === 'spacious' ? 'py-5' : 'py-4';

  return (
    <tr aria-hidden="true" className={clsx('border-b border-[--color-table-border] last:border-b-0', className)} {...props}>
      {Array.from({ length: columns }).map((_, cIdx) => {
        let shimmerShape = <div className="h-3 rounded skeleton-shimmer w-20" />;
        
        // Custom shapes for standard inventory/admin lists
        if (cIdx === 0) {
          shimmerShape = <div className="w-10 h-10 rounded skeleton-shimmer shrink-0" />;
        } else if (cIdx === 1) {
          shimmerShape = (
            <div className="flex flex-col gap-1.5 w-full">
              <div className="h-3.5 rounded skeleton-shimmer w-36" />
              <div className="h-2 rounded skeleton-shimmer w-20 opacity-60" />
            </div>
          );
        } else if (cIdx === columns - 1) {
          shimmerShape = <div className="h-6 rounded skeleton-shimmer w-16 ml-auto" />;
        }

        return (
          <td key={`skc-${cIdx}`} className={clsx('px-6 align-middle', padY)}>
            {shimmerShape}
          </td>
        );
      })}
    </tr>
  );
});

TableSkeletonRow.displayName = 'Table.SkeletonRow';

// ----------------------------------------------------------------------
// 20. Table.Empty
// ----------------------------------------------------------------------
export const TableEmpty = memo(({
  visible,
  colSpan,
  icon = <FiInbox />,
  title = 'Aucun résultat',
  description,
  action,
  variant = 'empty',
  className = '',
  ...props
}) => {
  if (!visible) return null;

  return (
    <tr aria-live="polite" className={className} {...props}>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-12 h-12 text-[--color-table-empty-icon] flex items-center justify-center text-4xl shrink-0">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[--color-table-empty-title]">{title}</p>
            {description && (
              <p className="text-xs text-[--color-table-empty-desc] max-w-xs mx-auto leading-relaxed">{description}</p>
            )}
          </div>
          {action && (
            <div className="pt-2">{action}</div>
          )}
        </div>
      </td>
    </tr>
  );
});

TableEmpty.displayName = 'Table.Empty';

// ----------------------------------------------------------------------
// 21. Table.Footer
// ----------------------------------------------------------------------
export const TableFooter = memo(({ children, className = '', ...props }) => {
  return (
    <div 
      className={clsx(
        'border-t border-[--color-table-footer-border] bg-[--color-table-footer-bg] rounded-b-lg overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

TableFooter.displayName = 'Table.Footer';

// ----------------------------------------------------------------------
// 22. Table.Pagination
// ----------------------------------------------------------------------
export const TablePagination = memo(({
  currentPage,
  lastPage,
  total,
  onPrev,
  onNext,
  className = '',
  ...props
}) => {
  if (lastPage <= 1) return null;

  return (
    <nav 
      aria-label="Navigation de pagination"
      className={clsx('px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3', className)}
      {...props}
    >
      <span aria-live="polite" aria-atomic="true" className="text-xs text-[--color-table-pagination-text]">
        Page {currentPage} sur {lastPage} {total !== undefined && ` · ${total} résultat(s)`}
      </span>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={onPrev}
          aria-label="Page précédente"
          icon={<FiChevronLeft />}
        >
          Précédent
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === lastPage}
          onClick={onNext}
          aria-label="Page suivante"
          icon={<FiChevronRight />}
          iconPosition="right"
        >
          Suivant
        </Button>
      </div>
    </nav>
  );
});

TablePagination.displayName = 'Table.Pagination';

// ----------------------------------------------------------------------
// Attach Subcomponents for Composition API usage
// ----------------------------------------------------------------------
Table.Toolbar = TableToolbar;
Table.Search = TableSearch;
Table.Filter = TableFilter;
Table.DateFilter = TableDateFilter;
Table.Actions = TableActions;
Table.ResultCount = TableResultCount;
Table.Container = TableContainer;
Table.Head = TableHead;
Table.HeadRow = TableHeadRow;
Table.HeadCell = TableHeadCell;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.ImageCell = TableImageCell;
Table.PrimaryText = TablePrimaryText;
Table.SecondaryText = TableSecondaryText;
Table.StatusBadge = TableStatusBadge;
Table.StockIndicator = TableStockIndicator;
Table.RowActions = TableRowActions;
Table.SkeletonRow = TableSkeletonRow;
Table.Empty = TableEmpty;
Table.Footer = TableFooter;
Table.Pagination = TablePagination;

export default Table;
