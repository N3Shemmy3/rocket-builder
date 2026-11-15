export function CollapsiblePanel({
  id,
  title,
  badge = null,
  badgeTone = 'muted',
  isOpen,
  onToggle,
  className = '',
  children,
}) {
  return (
    <section
      className={`panel-card${className ? ` ${className}` : ''} ${
        isOpen ? 'is-open' : 'is-collapsed'
      }`}
    >
      <h2 className="panel-card-heading">
        <button
          type="button"
          className="panel-toggle-btn"
          aria-expanded={isOpen}
          aria-controls={`${id}-body`}
          onClick={onToggle}
        >
          <span className="panel-chevron" aria-hidden="true" />
          <span className="panel-title-text">{title}</span>
          {badge != null && (
            <span className={`panel-status-badge tone-${badgeTone}`}>
              {badge}
            </span>
          )}
        </button>
      </h2>
      <div
        id={`${id}-body`}
        className="panel-collapse-grid"
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
      >
        <div className="panel-collapse-inner">
          <div className="panel-card-body">{children}</div>
        </div>
      </div>
    </section>
  );
}
