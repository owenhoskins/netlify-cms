import cms from 'netlify-cms-core/src';
import { StringControl, StringPreview } from 'netlify-cms-widget-string/src';
import { NumberControl, NumberPreview } from 'netlify-cms-widget-number/src';
import { TextControl, TextPreview } from 'netlify-cms-widget-text/src';
import { ImageControl, ImagePreview } from 'netlify-cms-widget-image/src';
import { FileControl, FilePreview } from 'netlify-cms-widget-file/src';
import { DateControl, DatePreview } from 'netlify-cms-widget-date/src';
import { DateTimeControl, DateTimePreview } from 'netlify-cms-widget-datetime/src';
import { SelectControl, SelectPreview } from 'netlify-cms-widget-select/src';
import { MarkdownControl, MarkdownPreview } from 'netlify-cms-widget-markdown/src';
import { ListControl, ListPreview } from 'netlify-cms-widget-list/src';
import { ObjectControl, ObjectPreview } from 'netlify-cms-widget-object/src';
import { RelationControl, RelationPreview } from 'netlify-cms-widget-relation/src';
import { BooleanControl } from 'netlify-cms-widget-boolean/src';

const { registerWidget } = cms;

import { GalleryControl, GalleryPreview } from '../../netlify-cms-widget-gallery/src';
registerWidget('gallery', GalleryControl, GalleryPreview);

import { VimeoControl, VimeoPreview } from '../../netlify-cms-widget-vimeo/src';
registerWidget('vimeo', VimeoControl, VimeoPreview);


registerWidget('string', StringControl, StringPreview);
registerWidget('text', TextControl, TextPreview);
registerWidget('number', NumberControl, NumberPreview);
registerWidget('list', ListControl, ListPreview);
registerWidget('markdown', MarkdownControl, MarkdownPreview);
registerWidget('image', ImageControl, ImagePreview);
registerWidget('file', FileControl, FilePreview);
registerWidget('date', DateControl, DatePreview);
registerWidget('datetime', DateTimeControl, DateTimePreview);
registerWidget('select', SelectControl, SelectPreview);
registerWidget('object', ObjectControl, ObjectPreview);
registerWidget('relation', RelationControl, RelationPreview);
registerWidget('boolean', BooleanControl);




const { registerPreviewTemplate } = cms;

import React from "react"
import { renderToString } from "react-dom/server"
import { renderStylesToString } from "emotion-server"
import styled from 'react-emotion';

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

