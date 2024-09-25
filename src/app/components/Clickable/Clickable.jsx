import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import Hoverable from '@app/components/Hoverable';

const Component = styled(Hoverable)`
    &:hover {
        cursor: ${props => (props.disabled ? 'default' : 'pointer')};
    }
`;

function Clickable(props) {
  return <Component role="presentation" {...props} />;
}

Clickable.propTypes = {
  disabled: PropTypes.bool,
};

export default Clickable;
