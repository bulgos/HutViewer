import { memo, type FC } from 'react';
import type { HutAvailability } from './hut-availability';
import { useIsHutHovered } from './useIsHutHovered';
import type { HutType } from './HutType';
import {
  CALENDAR_MONTH_SHORT,
  OPENING_LABEL,
  calendarMonthIndex,
  currentMonthOpening,
  openingVisualKind
} from './openingStatus';
import './HutCard.css';
import { availabilityLevel, getAvailabilityStatus } from './hut-availability';
import { SERVICE_LABELS, SUITABILITY_LABELS } from './filter-labels';

export type HutCardProps = {
  hut: HutType;
  availability: HutAvailability[];
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onShowOnMap: () => void;
};

export const HutCard: FC<HutCardProps> = memo(function HutCard({
  hut,
  availability,
  detailsOpen,
  onDetailsOpenChange,
  onHoverStart,
  onHoverEnd,
  onShowOnMap,
}) {
  const isHighlighted = useIsHutHovered(hut.id);
  const services = Object.entries(hut.services).filter(([, v]) => v);
  const suitable = Object.entries(hut.suitable).filter(([, v]) => v);

  const now = new Date();
  const monthIndex = calendarMonthIndex(now);
  const currentOpening = currentMonthOpening(hut, now);
  const openingLabel = currentOpening !== undefined ? OPENING_LABEL[currentOpening] : 'Unknown';

  return (
    <article
      className={`hut-card${isHighlighted ? ' hut-card--highlighted' : ''}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <header className="hut-card__header">
        <div className="hut-card__header-top">
          <h3 className="hut-card__title">{hut.geographical_name}</h3>
          <div className="hut-card__header-actions">
            <button
              type="button"
              className="hut-card__map-btn"
              title="Zoom and center map on this hut"
              onClick={(e) => {
                e.stopPropagation();
                onShowOnMap();
              }}
            >
              On map
            </button>
            <span
              className={`hut-card__badge ${hut.is_private ? 'hut-card__badge--private' : 'hut-card__badge--shared'}`}
            >
              {hut.is_private ? 'Private' : 'Shared'}
            </span>
          </div>
        </div>
        <div className="hut-card__header-meta">
          <span className="hut-card__stat">
            <strong>{hut.sleeps}</strong> beds
          </span>
          <span
            className={`hut-card__now hut-card__now--${openingVisualKind(currentOpening)}`}
            title={`Opening status in ${CALENDAR_MONTH_SHORT[monthIndex] ?? 'this month'}`}
          >
            <span className="hut-card__now-month">{CALENDAR_MONTH_SHORT[monthIndex]}</span>
            <span className="hut-card__now-sep" aria-hidden>
              ·
            </span>
            {openingLabel}
          </span>
        </div>
      </header>

      <details
        className="hut-card__details"
        open={detailsOpen}
        onToggle={(e) => onDetailsOpenChange(e.currentTarget.open)}
      >
        <summary className="hut-card__summary">
          <span className="hut-card__summary-chevron" aria-hidden />
          More details
          <button
            type="button"
            className="hut-card__copy-id"
            title="Copy API ID to clipboard"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(JSON.stringify(hut.rawData));
            }}
          >
            API Data
          </button>
        </summary>
        <div className="hut-card__details-inner">
          {
            <div className="hut-card__availability-wrap">
              <span className="hut-card__label">Availability</span>
              {availability.length === 0 ? (
                <span className="hut-card__chip hut-card__chip--muted">No dates listed</span>
              ) : (
                <ul className="hut-card__availability" aria-label="Bed availability by date">
                  {availability.map((day) => {
                    const availabilityPercentage = availabilityLevel(day.freeBeds, day.totalSleepingPlaces);
                    const status = getAvailabilityStatus(availabilityPercentage);
                    return (
                      <li key={day.date.toISOString()} className="hut-card__availability-row">
                        <span className="hut-card__availability-date">{day.dateFormatted}</span>
                        <span className="hut-card__availability-beds">
                          <strong>{day.freeBeds}</strong>
                          <span className="hut-card__availability-beds-sep">/</span>
                          {day.totalSleepingPlaces}
                        </span>
                        <span className={`hut-card__availability-status hut-card__availability-status--${status}`}>
                          {availabilityPercentage.toFixed(1)}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          }

          <div className="hut-card__months-wrap">
            <span className="hut-card__label">Season</span>
            <div className="hut-card__months" role="list" aria-label="Months open or serviced">
              {hut.openings.map((opening, i) => (
                <span
                  key={`${hut.id}-${i}`}
                  className={`hut-card__month hut-card__month--${opening}`}
                  title={`${CALENDAR_MONTH_SHORT[i] ?? `M${i + 1}`}: ${opening}`}
                  role="listitem"
                >
                  {CALENDAR_MONTH_SHORT[i]}
                </span>
              ))}
            </div>
            <div className="hut-card__legend" aria-hidden>
              <span>
                <span className="hut-card__legend-dot hut-card__legend-dot--closed" /> Closed
              </span>
              <span>
                <span className="hut-card__legend-dot hut-card__legend-dot--open" /> Open
              </span>
              <span>
                <span className="hut-card__legend-dot hut-card__legend-dot--serviced" /> Serviced
              </span>
            </div>
          </div>

          <div>
            <span className="hut-card__label">Services</span>
            <div className="hut-card__chips">
              {services.length === 0 ? (
                <span className="hut-card__chip hut-card__chip--muted">None listed</span>
              ) : (
                services.map(([key]) => (
                  <span key={key} className="hut-card__chip">
                    {SERVICE_LABELS[key as keyof typeof SERVICE_LABELS] ?? key.replace(/_/g, ' ')}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="hut-card__label">Good for</span>
            <div className="hut-card__chips">
              {suitable.length === 0 ? (
                <span className="hut-card__chip hut-card__chip--muted">None listed</span>
              ) : (
                suitable.map(([key]) => (
                  <span key={key} className="hut-card__chip">
                    {SUITABILITY_LABELS[key as keyof typeof SUITABILITY_LABELS] ?? key.replace(/_/g, ' ')}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </details>
    </article>
  );
});
