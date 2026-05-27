import type { FC } from 'react';
import './HutDatePanel.css';

type Props = {
  value: string;
  onChange: (date: string) => void;
};

export const HutDatePanel: FC<Props> = ({ value, onChange }) => (
  <label className="hut-date-panel__field">
    <span className="hut-date-panel__label">Day</span>
    <input type="date" className="hut-date-panel__input" value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);
