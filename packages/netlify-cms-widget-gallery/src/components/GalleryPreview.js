import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { List, isImmutable } from 'immutable';
import { WidgetPreviewContainer } from 'netlify-cms-ui-default';

const transform = (obj, width) => {
  let url
  let name
  let aspectRatio
  if (typeof obj.toJS === 'function') {
    url = obj.get('url')
    name = obj.get('name')
    aspectRatio = obj.get('aspectRatio')
  } else {
    url = obj.url
    name = obj.name
    aspectRatio = obj.aspectRatio
  }
  return {
    url: `${url}-/resize/x${width}/${name}`,
    aspectRatio
  }
}

const GalleryImage = styled.img`
  display: inline-block;
  height: 320px;
`;


const ImagePreviewContent = props => {
  const { value, getAsset } = props;
  // here we return a gallery format
  if (Array.isArray(value) || List.isList(value)) {
    return value.map(val => {
      const image = transform(val, 400)
      console.log('aspectRatio: ', image.aspectRatio)
      return <GalleryImage key={val} src={image.url} role="presentation" />
    });
  }
  // here we return a full width image
  return <GalleryImage key={value} src={transform(value, 1600).url} role="presentation" />;
};

const GalleryPreview = props => {
  return (
    <WidgetPreviewContainer>
      {props.value ? <ImagePreviewContent {...props} /> : null}
    </WidgetPreviewContainer>
  );
};

GalleryPreview.propTypes = {
  getAsset: PropTypes.func.isRequired,
  value: PropTypes.node,
};

export default GalleryPreview;
