import React from "react";
import ForgeIcon from "../../icons/ForgeIcon";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function FlPagination({
  page = 0,
  totalPages = 1,
  onPrevious,
  onNext,
  className = "",
  ariaLabel = "Paginacion",
}) {
  if (totalPages <= 1) return null;

  const currentPage = Math.max(0, Math.min(Number(page || 0), Math.max(0, Number(totalPages || 1) - 1)));
  const isFirst = currentPage <= 0;
  const isLast = currentPage >= totalPages - 1;

  return (
    <nav className={cx("fl-pagination", className)} aria-label={ariaLabel}>
      <button
        type="button"
        className="fl-pagination__button"
        onClick={isFirst ? undefined : onPrevious}
        disabled={isFirst}
        aria-label="Pagina anterior"
      >
        <ForgeIcon name="chevron-left" size={16} />
      </button>
      <span className="fl-pagination__label">
        <strong className="fl-pagination__current">{currentPage + 1}</strong>
        <span className="fl-pagination__sep">/</span>
        <span className="fl-pagination__total">{totalPages}</span>
      </span>
      <button
        type="button"
        className="fl-pagination__button"
        onClick={isLast ? undefined : onNext}
        disabled={isLast}
        aria-label="Pagina siguiente"
      >
        <ForgeIcon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
