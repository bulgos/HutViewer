import type { FC } from 'react';
import type { HutType } from './HutType';
import {
  CALENDAR_MONTH_SHORT,
  OPENING_LABEL,
  calendarMonthIndex,
  currentMonthOpening,
  openingVisualKind
} from './openingStatus';

export type HutCardHeaderProps = {
  hut: HutType;
  onShowOnMap: () => void;
};

export const HutCardHeader: FC<HutCardHeaderProps> = ({ hut, onShowOnMap }) => {
  const now = new Date();
  const monthIndex = calendarMonthIndex(now);
  const currentOpening = currentMonthOpening(hut, now);
  const openingLabel = currentOpening !== undefined ? OPENING_LABEL[currentOpening] : 'Unknown';

  return (
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
  );
};
