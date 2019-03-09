import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { List, isImmutable } from 'immutable';
import { WidgetPreviewContainer } from 'netlify-cms-ui-default';

const transformUrl = (obj, width) => {
  let url
  let name
  if (typeof obj.toJS === 'function') {
    url = obj.get('url')
    name = obj.get('name')
  } else {
    url = obj.url
    name = obj.name
  }
  return `${url}-/resize/x${width}/${name}`
}

const SingleImage = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
`;

const ImagePreviewContent = props => {
  const { value, getAsset } = props;
  // here we return a gallery format
  if (Array.isArray(value) || List.isList(value)) {
    console.log('Yo from ImagePreview')
    return value.map(val =>
      <SingleImage key={val} src={transformUrl(val, 1200)} role="presentation" />);
  }
  // here we return a full width image
  return <SingleImage key={value} src={transformUrl(value, 1600)} role="presentation" />;
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
