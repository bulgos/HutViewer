import type { FC, ReactNode } from 'react';
import './HutDatePanel.css';

type Props = {
  value: string;
  onChange: (date: string) => void;
  trailing?: ReactNode;
};

export const HutDatePanel: FC<Props> = ({ value, onChange, trailing }) => (
  <>
    <label className="hut-date-panel__field">
      {trailing}
      <input type="date" className="hut-date-panel__input" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  </>
);
