import cms from 'netlify-cms-core/src';
const { registerPreviewTemplate } = cms;
import React from "react"
import { renderToString } from "react-dom/server"
import { renderStylesToString } from "emotion-server"
import styled from 'react-emotion';

import withFileControl from './components/withFileControl';

import { ImagePreview } from 'netlify-cms-widget-image';

export const GalleryControl = withFileControl({ forImage: true });
export GalleryPreview from './components/GalleryPreview';

class CSSInjector extends React.Component {
  render() {
    return (
      <div
        ref={ref => {
          if (ref && !this.css) {
            this.css = renderStylesToString(renderToString(this.props.children))
            ref.ownerDocument.head.innerHTML += this.css
          }
        }}>
        {React.Children.only(this.props.children)}
      </div>
    )
  }
}

const PreviewContainer = styled.div`
  font-family: Roboto, 'Helvetica Neue', HelveticaNeue, Helvetica, Arial, sans-serif;
`;

function isVisible(field) {
  return field.get('widget') !== 'hidden';
}

class PagePreview extends React.Component {
  render() {
    const { collection, fields, widgetFor } = this.props;
    if (!collection || !fields) {
      return null;
    }
    return (
      <PreviewContainer>
        {fields.filter(isVisible).map(field => (
          <div key={field.get('name')}>{widgetFor(field.get('name'))}</div>
        ))}
      </PreviewContainer>
    );
  }
}

registerPreviewTemplate('page', props => {
  return (
  <CSSInjector>
    <PagePreview {...props} />
  </CSSInjector>
)})
