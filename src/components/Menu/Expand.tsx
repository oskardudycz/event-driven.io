import * as styles from './Expand.module.css';
import { FaAngleDown } from 'react-icons/fa';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Expand = (props: {
  onClick: () => void;
  open: boolean;
  ref: React.Ref<HTMLButtonElement>;
  controls: string;
}) => {
  const { onClick, open, ref, controls } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <button
        className={styles.more}
        type="button"
        onClick={onClick}
        ref={ref}
        aria-label={t('menu.more')}
        aria-expanded={open}
        aria-controls={controls}
      >
        <FaAngleDown size={20} />
      </button>
    </React.Fragment>
  );
};

export default Expand;
