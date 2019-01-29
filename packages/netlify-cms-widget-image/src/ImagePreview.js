import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { List, isImmutable } from 'immutable';
import { WidgetPreviewContainer } from 'netlify-cms-ui-default';

console.log('isImmutable: ', isImmutable);

const transformUrl = (obj) => {
  let url
  let name
  if (typeof obj.toJS === 'function') {
    url = obj.get('url')
    name = obj.get('name')
  } else {
    url = obj.url
    name = obj.name
  }
  return `${url}-/resize/x600/${name}`
}

const StyledImage = styled(({ getAsset, value }) => {
  console.log('StyledImage value: ', value, value.toJS === 'function')
  return (
  <img src={transformUrl(value)} role="presentation" />
)
})`
  display: block;
  max-width: 100%;
  height: auto;
`;

const ImagePreviewContent = props => {
  const { value, getAsset } = props;
  if (Array.isArray(value) || List.isList(value)) {
    return value.map(val => <StyledImage key={val} value={val} getAsset={getAsset} />);
  }
  return <StyledImage {...props} />;
};

const ImagePreview = props => {
  return (
    <WidgetPreviewContainer>
      {props.value ? <ImagePreviewContent {...props} /> : null}
    </WidgetPreviewContainer>
  );
};

ImagePreview.propTypes = {
  getAsset: PropTypes.func.isRequired,
  value: PropTypes.node,
};

export default ImagePreview;
