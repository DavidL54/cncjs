import PropTypes from 'prop-types';
import React from 'react';
import RepeatableButton from '@app/components/RepeatableButton';
import controller from '@app/lib/controller';
import DigitalReadout from './DigitalReadout';
import styles from './index.styl';

function Overrides(props) {
  const { ovF, ovS } = props;

  if (!ovF && !ovS) {
    return null;
  }

  return (
    <div className={styles.overrides}>
      {!!ovF && (
        <DigitalReadout label="F" value={ovF + '%'}>
          <RepeatableButton
            onClick={() => {
              controller.command('feed_override', -10);
            }}
          >
            <i className="fa fa-arrow-down" style={{ fontSize: 14 }} />
            <span style={{ marginLeft: 5 }}>
              -10%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('feed_override', -1);
            }}
          >
            <i className="fa fa-arrow-down" style={{ fontSize: 10 }} />
            <span style={{ marginLeft: 5 }}>
              -1%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('feed_override', 1);
            }}
          >
            <i className="fa fa-arrow-up" style={{ fontSize: 10 }} />
            <span style={{ marginLeft: 5 }}>
              1%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('feed_override', 10);
            }}
          >
            <i className="fa fa-arrow-up" style={{ fontSize: 14 }} />
            <span style={{ marginLeft: 5 }}>
              10%
            </span>
          </RepeatableButton>
          <button
            type="button"
            className="btn btn-default"
            style={{ padding: 5 }}
            onClick={() => {
              controller.command('feed_override', 0);
            }}
          >
            <i className="fa fa-undo fa-fw" />
          </button>
        </DigitalReadout>
      )}
      {!!ovS && (
        <DigitalReadout label="S" value={ovS + '%'}>
          <RepeatableButton
            onClick={() => {
              controller.command('spindle_override', -10);
            }}
          >
            <i className="fa fa-arrow-down" style={{ fontSize: 14 }} />
            <span style={{ marginLeft: 5 }}>
              -10%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('spindle_override', -1);
            }}
          >
            <i className="fa fa-arrow-down" style={{ fontSize: 10 }} />
            <span style={{ marginLeft: 5 }}>
              -1%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('spindle_override', 1);
            }}
          >
            <i className="fa fa-arrow-up" style={{ fontSize: 10 }} />
            <span style={{ marginLeft: 5 }}>
              1%
            </span>
          </RepeatableButton>
          <RepeatableButton
            onClick={() => {
              controller.command('spindle_override', 10);
            }}
          >
            <i className="fa fa-arrow-up" style={{ fontSize: 14 }} />
            <span style={{ marginLeft: 5 }}>
              10%
            </span>
          </RepeatableButton>
          <button
            type="button"
            className="btn btn-default"
            style={{ padding: 5 }}
            onClick={() => {
              controller.command('spindle_override', 0);
            }}
          >
            <i className="fa fa-undo fa-fw" />
          </button>
        </DigitalReadout>
      )}
    </div>
  );
}

Overrides.propTypes = {
  ovF: PropTypes.number,
  ovS: PropTypes.number
};

export default Overrides;
