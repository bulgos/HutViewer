import type { FC } from 'react';
import './AvailabilityLoadProgress.css';

type Props = {
  loaded: number;
  total: number;
};

export const AvailabilityLoadProgress: FC<Props> = ({ loaded, total }) => {
  if (total === 0) return null;

  const percent = Math.min(100, Math.round((100 * loaded) / total));

  return (
    <div
      className="availability-load"
      role="progressbar"
      aria-valuenow={loaded}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Availability loaded for ${loaded} of ${total} huts`}
    >
      <div className="availability-load__track">
        <div className="availability-load__bar" style={{ width: `${percent}%` }} />
      </div>
      <span className="availability-load__count" aria-hidden>
        {loaded}/{total}
      </span>
    </div>
  );
};
