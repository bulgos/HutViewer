import { memo } from 'react';
import { HutCardMinimal } from './HutCardMinimal';
import { HutCardPlaceholder } from './HutCardPlaceholder';
import { useHutHoverActions } from './HutHoverContext';
import type { HutType } from './HutType';
import { useInView } from './useInView';

export type HutListProps = {
  huts: HutType[];
  selectedHutId: number | null;
  onSelectHut: (hut: HutType) => void;
  onShowOnMap: (hut: HutType) => void;
};

const LazyHutCardMinimal = memo(function LazyHutCardMinimal({
  hut,
  selected,
  onSelect,
  onShowOnMap,
}: {
  hut: HutType;
  selected: boolean;
  onSelect: () => void;
  onShowOnMap: () => void;
}) {
  const { ref, inView } = useInView();
  const { hoverHut, unhoverHut } = useHutHoverActions();

  return (
    <div ref={ref} id={`hut-card-${hut.id}`} className="hut-list__item">
      {inView || selected ? (
        <HutCardMinimal
          hut={hut}
          selected={selected}
          onSelect={onSelect}
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
  selectedHutId,
  onSelectHut,
  onShowOnMap,
}: HutListProps) {
  return (
    <div className="hut-list">
      {huts.length === 0 && (
        <p className="hut-list__empty">No huts match the current filters.</p>
      )}
      {huts.map((hut) => (
        <LazyHutCardMinimal
          key={hut.id}
          hut={hut}
          selected={selectedHutId === hut.id}
          onSelect={() => onSelectHut(hut)}
          onShowOnMap={() => onShowOnMap(hut)}
        />
      ))}
    </div>
  );
}
