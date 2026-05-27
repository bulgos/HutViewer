import type { FC } from 'react';
import { useHutHover } from './HutHoverContext';
import { HutCard } from './HutCard';
import type { HutType } from './HutType';

export type HutListProps = {
  huts: HutType[];
  onShowOnMap: (hut: HutType) => void;
  detailsOpenByHutId: Record<number, boolean>;
  onDetailsOpenChange: (hutId: number, open: boolean) => void;
};

export const HutList: FC<HutListProps> = ({
  huts,
  onShowOnMap,
  detailsOpenByHutId,
  onDetailsOpenChange,
}) => {
  const { hoveredHutId, hoverHut, unhoverHut } = useHutHover();

  return (
    <div className="hut-list">
      {huts.length === 0 && (
        <p className="hut-list__empty">No huts match the current filters.</p>
      )}
      {huts.map((hut) => (
        <HutCard
          key={hut.id}
          hut={hut}
          detailsOpen={detailsOpenByHutId[hut.id] ?? false}
          onDetailsOpenChange={(open) => onDetailsOpenChange(hut.id, open)}
          isHighlighted={hoveredHutId === hut.id}
          onHoverStart={() => hoverHut(hut.id)}
          onHoverEnd={() => unhoverHut()}
          onShowOnMap={() => onShowOnMap(hut)}
        />
      ))}
    </div>
  );
};
