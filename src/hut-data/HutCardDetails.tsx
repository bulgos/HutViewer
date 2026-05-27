import { useEffect, useRef, type FC } from 'react';
import { pickAvailabilityDay } from '../filters/pickAvailabilityDay';
import type { HutAvailability } from './hut-availability';
import { availabilityLevel, getAvailabilityStatus } from './hut-availability';
import type { HutType } from './HutType';
import { CALENDAR_MONTH_SHORT } from './openingStatus';
import { SERVICE_LABELS, SUITABILITY_LABELS } from './filter-labels';

function hutWebsiteHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function hutWebsiteLabel(url: string): string {
  try {
    return new URL(hutWebsiteHref(url)).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export type HutCardDetailsProps = {
  hut: HutType;
  availability: HutAvailability[];
  availabilityDate: string;
};

export const HutCardDetails: FC<HutCardDetailsProps> = ({ hut, availability, availabilityDate }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedDay = pickAvailabilityDay(availability, availabilityDate);
  const services = Object.entries(hut.services).filter(([, v]) => v);
  const suitable = Object.entries(hut.suitable).filter(([, v]) => v);

  useEffect(() => {
    if (!selectedDay) return;

    const scrollToSelectedDay = () => {
      const row = listRef.current?.querySelector(
        `[data-availability-day="${selectedDay.date.toISOString()}"]`
      );
      row?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    };

    scrollToSelectedDay();
    requestAnimationFrame(scrollToSelectedDay);
  }, [hut.id, availability, availabilityDate, selectedDay?.date.getTime()]);

  return (
    <div className="hut-card__details-inner hut-card__details-inner--panel">
      {hut.url && (
        <div className="hut-card__website-wrap">
          <span className="hut-card__label">Website</span>
          <a
            href={hutWebsiteHref(hut.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="hut-card__website-link"
          >
            {hutWebsiteLabel(hut.url)}
          </a>
        </div>
      )}
      <div className="hut-card__availability-wrap">
        <span className="hut-card__label">Availability</span>
        {availability.length === 0 ? (
          <span className="hut-card__chip hut-card__chip--muted">No dates listed</span>
        ) : (
          <ul ref={listRef} className="hut-card__availability" aria-label="Bed availability by date">
            {availability.map((day) => {
              const availabilityPercentage = availabilityLevel(day.freeBeds, day.totalSleepingPlaces);
              const status = getAvailabilityStatus(availabilityPercentage);
              const isSelectedDay = selectedDay?.date.getTime() === day.date.getTime();
              return (
                <li
                  key={day.date.toISOString()}
                  data-availability-day={day.date.toISOString()}
                  className={`hut-card__availability-row${isSelectedDay ? ' hut-card__availability-row--selected' : ''}`}
                >
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

      <div className="hut-card__panel-actions">
        <button
          type="button"
          className="hut-card__copy-id"
          title="Copy API ID to clipboard"
          onClick={() => navigator.clipboard.writeText(JSON.stringify(hut.rawData))}
        >
          Copy API data
        </button>
      </div>
    </div>
  );
};
