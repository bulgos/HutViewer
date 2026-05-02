import type { FC } from 'react';
import type { HutType } from './HutType';
import {
  CALENDAR_MONTH_SHORT,
  OPENING_LABEL,
  calendarMonthIndex,
  currentMonthOpening,
  openingVisualKind,
} from './openingStatus';
import './HutCard.css';

const SERVICE_LABELS: Record<string, string> = {
  drinks: 'Drinks',
  internet: 'Internet',
  not_paid: 'Members / no fee',
  css_rebate: 'CSS rebate',
  half_board: 'Half board',
  plain_meals: 'Meals',
  family_rooms: 'Family rooms',
  payment_mobile: 'Mobile pay',
  cooking_catered: 'Catered cooking',
  dogs_on_request: 'Dogs on request',
  payment_creditcard: 'Card payment',
  cooking_non_catered: 'Self-catering kitchen',
  separable_group_rooms: 'Group rooms',
};

const SUITABILITY_LABELS: Record<string, string> = {
  family: 'Families',
  climbing: 'Climbing',
  alpine_tour: 'Alpine tours',
  via_ferrata: 'Via ferrata',
  climbing_kids: 'Kids climbing',
  mountain_hiking: 'Hiking',
  ski_snowboard_tour: 'Ski / snowboard tours',
};

export const HutCard: FC<{ hut: HutType }> = ({ hut }) => {
  const services = Object.entries(hut.services).filter(([, v]) => v);
  const suitable = Object.entries(hut.suitable).filter(([, v]) => v);

  const now = new Date();
  const monthIndex = calendarMonthIndex(now);
  const currentOpening = currentMonthOpening(hut, now);
  const openingLabel =
    currentOpening !== undefined ? OPENING_LABEL[currentOpening] : 'Unknown';

  return (
    <article className="hut-card">
      <header className="hut-card__header">
        <div className="hut-card__header-top">
          <h3 className="hut-card__title">{hut.geographical_name}</h3>
          <span
            className={`hut-card__badge ${hut.is_private ? 'hut-card__badge--private' : 'hut-card__badge--shared'}`}
          >
            {hut.is_private ? 'Private' : 'Shared'}
          </span>
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

      <details className="hut-card__details">
        <summary className="hut-card__summary">
          <span className="hut-card__summary-chevron" aria-hidden />
          More details
        </summary>
        <div className="hut-card__details-inner">
          <div className="hut-card__months-wrap">
            <span className="hut-card__label">Season</span>
            <div className="hut-card__months" role="list" aria-label="Months open or serviced">
              {hut.openings.map((opening, i) => (
                <span
                  key={`${hut.id}-${i}`}
                  className={`hut-card__month hut-card__month--${opening}`}
                  title={`${CALENDAR_MONTH_SHORT[i] ?? `M${i + 1}`}: ${opening}`}
                  role="listitem"
                />
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
                    {SERVICE_LABELS[key] ?? key.replace(/_/g, ' ')}
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
                    {SUITABILITY_LABELS[key] ?? key.replace(/_/g, ' ')}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </details>
    </article>
  );
};
