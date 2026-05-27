import { memo } from 'react';
import { getHutAvailability, type AvailabilityByHutId } from './availabilityStore';
import type { HutAvailability } from './hut-availability';
import { HutCard } from './HutCard';
import { HutCardPlaceholder } from './HutCardPlaceholder';
import { useHutHoverActions } from './HutHoverContext';
import type { HutType } from './HutType';
import { useInView } from './useInView';

export type HutListProps = {
  huts: HutType[];
  availabilityByHutId: AvailabilityByHutId;
  onShowOnMap: (hut: HutType) => void;
  detailsOpenByHutId: Record<number, boolean>;
  onDetailsOpenChange: (hutId: number, open: boolean) => void;
};

const LazyHutCard = memo(function LazyHutCard({
  hut,
  availability,
  detailsOpen,
  onDetailsOpenChange,
  onShowOnMap,
}: {
  hut: HutType;
  availability: HutAvailability[];
  detailsOpen: boolean;
  onDetailsOpenChange: (open: boolean) => void;
  onShowOnMap: () => void;
}) {
  const { ref, inView } = useInView();
  const { hoverHut, unhoverHut } = useHutHoverActions();

  return (
    <div ref={ref} id={`hut-card-${hut.id}`} className="hut-list__item">
      {inView || detailsOpen ? (
        <HutCard
          hut={hut}
          availability={availability}
          detailsOpen={detailsOpen}
          onDetailsOpenChange={onDetailsOpenChange}
          onHoverStart={() => hoverHut(hut.id)}
          onHoverEnd={() => unhoverHut()}
          onShowOnMap={onShowOnMap}
        />
      ) : (
        <HutCardPlaceholder hut={hut} />
      )}
    </div>
  );
});

export function HutList({
  huts,
  availabilityByHutId,
  onShowOnMap,
  detailsOpenByHutId,
  onDetailsOpenChange,
}: HutListProps) {
  return (
    <div className="hut-list">
      {huts.length === 0 && (
        <p className="hut-list__empty">No huts match the current filters.</p>
      )}
      {huts.map((hut) => (
        <LazyHutCard
          key={hut.id}
          hut={hut}
          availability={getHutAvailability(hut.id, availabilityByHutId)}
          detailsOpen={detailsOpenByHutId[hut.id] ?? false}
          onDetailsOpenChange={(open) => onDetailsOpenChange(hut.id, open)}
          onShowOnMap={() => onShowOnMap(hut)}
        />
      ))}
    </div>
  );
}
