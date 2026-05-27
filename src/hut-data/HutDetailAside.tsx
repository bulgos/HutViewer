import type { FC } from 'react';
import { getHutAvailability, type AvailabilityByHutId } from './availabilityStore';
import type { HutAvailability } from './hut-availability';
import { HutCardDetails } from './HutCardDetails';
import type { HutType } from './HutType';
import './HutCard.css';

export type HutDetailAsideProps = {
  hut: HutType;
  availability: HutAvailability[];
  availabilityDate: string;
};

export const HutDetailAside: FC<HutDetailAsideProps> = ({ hut, availability, availabilityDate }) => {
  return (
    <article className="hut-card hut-card--detail-panel">
      <HutCardDetails hut={hut} availability={availability} availabilityDate={availabilityDate} />
    </article>
  );
};

export type HutDetailAsidePanelProps = {
  hut: HutType | null;
  availabilityByHutId: AvailabilityByHutId;
  availabilityDate: string;
  onClose: () => void;
};

export const HutDetailAsidePanel: FC<HutDetailAsidePanelProps> = ({
  hut,
  availabilityByHutId,
  availabilityDate,
  onClose,
}) => {
  const visible = hut !== null;

  return (
    <aside
      className={`hut-panel hut-panel--detail${visible ? ' hut-panel--detail-visible' : ''}`}
      aria-label="Hut details"
      aria-hidden={!visible}
    >
      <div className="hut-panel__chrome">
        <button
          type="button"
          className="hut-panel__toggle"
          onClick={onClose}
          aria-label="Close hut details"
          title="Close hut details"
        >
          ×
        </button>
        <span className="hut-panel__rail-label hut-panel__rail-label--truncate">
          {hut?.geographical_name ?? 'Details'}
        </span>
      </div>
      <div className="hut-panel__expandable hut-panel__expandable--always-open">
        <div className="hut-panel__expandable-inner">
          {hut && (
            <HutDetailAside
              hut={hut}
              availability={getHutAvailability(hut.id, availabilityByHutId)}
              availabilityDate={availabilityDate}
            />
          )}
        </div>
      </div>
    </aside>
  );
};
