import * as styles from './Talks.module.css';
import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

const Talks = (props) => {
  const { talks } = props;
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div>
        <ul className={styles.elementUl}>
          {talks.map((talk) => {
            return (
              <li key={`${talk.Date}-${talk.Title}`} className={styles.elementLi}>
                <p className={`date-container ${styles.dateContainer}`}>
                  <span className={`date ${styles.date}`}>📅 {talk.Date}</span> -{' '}
                  <span className={`where ${styles.where}`}>
                    {talk.Link ? (
                      <a href={talk.Link} target="_blank" rel="noopener noreferrer">
                        {talk.Where}
                      </a>
                    ) : (
                      talk.Where
                    )}
                  </span>
                </p>
                <p className={`title-container ${styles.titleContainer}`}>
                  <label className={`title-label ${styles.titleLabel}`}>
                    {t('talks.titleLabel')}:
                  </label>{' '}
                  <span className={`title ${styles.title}`}>{talk.Title}</span>
                </p>
                {talk.Description && (
                  <p className={`description-container ${styles.descriptionContainer}`}>
                    <label className={`description-label ${styles.descriptionLabel}`}>
                      {t('talks.descriptionLabel')}:
                    </label>{' '}
                    <span className={'description'}>{talk.Description}</span>
                  </p>
                )}
                {talk.Video && !talk.HideVideo && talk.Video.includes('youtube') && (
                  <p>
                    <a href={talk.Video} target="_blank" rel="noopener noreferrer">
                      {t('talks.watch')} →
                    </a>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </React.Fragment>
  );
};

Talks.propTypes = {
  talks: PropTypes.array,
};

export default Talks;
