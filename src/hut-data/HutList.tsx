import type { FC } from 'react';
import { HutCard } from './HutCard';
import type { HutType } from './HutType';

export type HutListProps = {
  huts: HutType[];
  hoveredHutId: number | null;
  onHoverHut: (id: number | null) => void;
  onShowOnMap: (hut: HutType) => void;
  detailsOpenByHutId: Record<number, boolean>;
  onDetailsOpenChange: (hutId: number, open: boolean) => void;
};

export const HutList: FC<HutListProps> = ({
  huts,
  hoveredHutId,
  onHoverHut,
  onShowOnMap,
  detailsOpenByHutId,
  onDetailsOpenChange,
}) => {
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
          onHoverStart={() => onHoverHut(hut.id)}
          onHoverEnd={() => onHoverHut(null)}
          onShowOnMap={() => onShowOnMap(hut)}
        />
      ))}
    </div>
  );
};
