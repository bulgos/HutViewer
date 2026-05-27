import type { HutType } from './HutType';

type Props = {
  hut: HutType;
};

/** Lightweight shell shown until the card scrolls into view. */
export function HutCardPlaceholder({ hut }: Props) {
  return (
    <article className="hut-card hut-card--placeholder" aria-hidden>
      <header className="hut-card__header">
        <div className="hut-card__header-top">
          <h3 className="hut-card__title">{hut.geographical_name}</h3>
          <span
            className={`hut-card__badge ${hut.is_private ? 'hut-card__badge--private' : 'hut-card__badge--shared'}`}
          >
            {hut.is_private ? 'Private' : 'Shared'}
          </span>
        </div>
        <div className="hut-card__header-meta">
          <span className="hut-card__stat">
            <strong>{hut.sleeps}</strong> beds
          </span>
        </div>
      </header>
    </article>
  );
}
