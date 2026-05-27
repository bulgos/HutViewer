import type { FC, ReactNode } from 'react';
import './HutDatePanel.css';

type Props = {
  value: string;
  onChange: (date: string) => void;
  trailing?: ReactNode;
};

export const HutDatePanel: FC<Props> = ({ value, onChange, trailing }) => (
  <div className="hut-date-panel">
    <label className="hut-date-panel__field">
      {trailing}
      <span className="hut-date-panel__label">Day</span>
      <input type="date" className="hut-date-panel__input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </div>
);
