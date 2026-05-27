import { memo, type FC } from 'react';
import { useIsHutHovered } from './useIsHutHovered';
import type { HutType } from './HutType';
import { HutCardHeader } from './HutCardHeader';
import './HutCard.css';

export type HutCardMinimalProps = {
  hut: HutType;
  selected: boolean;
  onSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onShowOnMap: () => void;
};

export const HutCardMinimal: FC<HutCardMinimalProps> = memo(function HutCardMinimal({
  hut,
  selected,
  onSelect,
  onHoverStart,
  onHoverEnd,
  onShowOnMap,
}) {
  const isHighlighted = useIsHutHovered(hut.id);

  return (
    <article
      className={[
        'hut-card',
        'hut-card--minimal',
        isHighlighted ? 'hut-card--highlighted' : '',
        selected ? 'hut-card--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <HutCardHeader hut={hut} onShowOnMap={onShowOnMap} />
    </article>
  );
});
