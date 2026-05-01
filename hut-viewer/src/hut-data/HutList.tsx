import type { FC } from 'react';
import { HutCard } from './HutCard';
import type { HutType } from './HutType';

export const HutList: FC<{ huts: HutType[] }> = ({ huts }) => {
  return (
    <div className="hut-list">
      {huts.map((hut) => (
        <HutCard key={hut.id} hut={hut} />
      ))}
    </div>
  );
};
