import type { FC } from 'react';
import {
  SERVICE_KEYS,
  SERVICE_LABELS,
  SUITABILITY_KEYS,
  SUITABILITY_LABELS,
  type ServiceKey,
  type SuitabilityKey,
} from '../hut-data/filter-labels';
import type { AvailabilityFilterMode, HutFilterState } from './types';
import './HutFilters.css';

type Props = {
  filters: HutFilterState;
  onChange: (filters: HutFilterState) => void;
  drawAreaActive: boolean;
  onDrawAreaToggle: () => void;
  onClearArea: () => void;
  availabilityLoading: boolean;
  availabilityTargetCount: number;
  onResetAll: () => void;
};

function toggleKey<T extends string>(list: T[], key: T): T[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

export const HutFilters: FC<Props> = ({
  filters,
  onChange,
  drawAreaActive,
  onDrawAreaToggle,
  onClearArea,
  availabilityLoading,
  availabilityTargetCount,
  onResetAll,
}) => {
  const patch = (partial: Partial<HutFilterState>) => onChange({ ...filters, ...partial });

  const setAvailabilityMode = (mode: AvailabilityFilterMode) => patch({ availabilityMode: mode });

  return (
    <section className="hut-filters" aria-label="Hut filters">
      <fieldset className="hut-filters__group">
        <legend className="hut-filters__legend">Map area</legend>
        <div className="hut-filters__row">
          <button
            type="button"
            className={`hut-filters__btn${drawAreaActive ? ' hut-filters__btn--active' : ''}`}
            onClick={onDrawAreaToggle}
          >
            {drawAreaActive ? 'Drawing… drag on map' : 'Draw area on map'}
          </button>
          {filters.areaBounds && (
            <button type="button" className="hut-filters__btn hut-filters__btn--ghost" onClick={onClearArea}>
              Clear area
            </button>
          )}
        </div>
        <p className="hut-filters__hint">
          {filters.areaBounds
            ? 'Only huts inside the marked rectangle are shown.'
            : 'Optional: drag a rectangle on the map to limit results.'}
        </p>
      </fieldset>

      <fieldset className="hut-filters__group">
        <legend className="hut-filters__legend">Availability</legend>
        {availabilityLoading && <p className="hut-filters__hint hut-filters__hint--loading">Loading availability…</p>}
        <label className="hut-filters__radio">
          <input
            type="radio"
            name="availability"
            checked={filters.availabilityMode === 'any'}
            onChange={() => setAvailabilityMode('any')}
          />
          Any
        </label>
        <label className="hut-filters__radio">
          <input
            type="radio"
            name="availability"
            checked={filters.availabilityMode === 'minBeds'}
            onChange={() => setAvailabilityMode('minBeds')}
          />
          At least
          <input
            type="number"
            className="hut-filters__number"
            min={0}
            max={99}
            value={filters.minFreeBeds}
            disabled={filters.availabilityMode !== 'minBeds'}
            onChange={(e) => patch({ minFreeBeds: Number(e.target.value) || 0 })}
          />
          free beds
        </label>
        <label className="hut-filters__radio">
          <input
            type="radio"
            name="availability"
            checked={filters.availabilityMode === 'fullyFree'}
            onChange={() => setAvailabilityMode('fullyFree')}
          />
          Completely free (all beds available)
        </label>
        <p className="hut-filters__hint">
          Bed filters use the date from the Date panel. Huts without data for that night or with 0 beds listed are
          hidden. Checks up to {availabilityTargetCount} huts already matching map / service / activity filters.
        </p>
        <div className="hut-filters__checks">
          <label className="hut-filters__check">
            <input
              type="checkbox"
              checked={filters.hideHutsWithoutReservationData}
              onChange={(e) => patch({ hideHutsWithoutReservationData: e.target.checked })}
            />
            Hide huts without reservation data
          </label>
        </div>
        <p className="hut-filters__hint">
          Uses the date from the Date panel. “With data” means beds listed for that night; huts still loading count as
          without data.
        </p>
      </fieldset>

      <fieldset className="hut-filters__group">
        <legend className="hut-filters__legend">Services</legend>
        <div className="hut-filters__checks">
          {SERVICE_KEYS.map((key) => (
            <label key={key} className="hut-filters__check">
              <input
                type="checkbox"
                checked={filters.requiredServices.includes(key)}
                onChange={() =>
                  patch({
                    requiredServices: toggleKey(filters.requiredServices, key as ServiceKey)
                  })
                }
              />
              {SERVICE_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="hut-filters__group">
        <legend className="hut-filters__legend">Good for</legend>
        <div className="hut-filters__checks">
          {SUITABILITY_KEYS.map((key) => (
            <label key={key} className="hut-filters__check">
              <input
                type="checkbox"
                checked={filters.requiredSuitable.includes(key)}
                onChange={() =>
                  patch({
                    requiredSuitable: toggleKey(filters.requiredSuitable, key as SuitabilityKey)
                  })
                }
              />
              {SUITABILITY_LABELS[key]}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        className="hut-filters__btn hut-filters__btn--ghost hut-filters__clear"
        onClick={onResetAll}
      >
        Reset all filters
      </button>
    </section>
  );
};
