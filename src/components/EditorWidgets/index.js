import { registerWidget } from 'Lib/registry';
import UnknownControl from './Unknown/UnknownControl';
import UnknownPreview from './Unknown/UnknownPreview';
import StringControl from './String/StringControl';
import StringPreview from './String/StringPreview';
import NumberControl from './Number/NumberControl';
import NumberPreview from './Number/NumberPreview';
import TextControl from './Text/TextControl';
import TextPreview from './Text/TextPreview';
import ImageControl from './Image/ImageControl';
import ImagePreview from './Image/ImagePreview';
import FileControl from './File/FileControl';
import FilePreview from './File/FilePreview';
import DateControl from './Date/DateControl';
import DatePreview from './Date/DatePreview';
import DateTimeControl from './DateTime/DateTimeControl';
import DateTimePreview from './DateTime/DateTimePreview';
import SelectControl from './Select/SelectControl';
import SelectPreview from './Select/SelectPreview';
import MarkdownControl from './Markdown/MarkdownControl';
import MarkdownPreview from './Markdown/MarkdownPreview';
import ListControl from './List/ListControl';
import ListPreview from './List/ListPreview';
import ObjectControl from './Object/ObjectControl';
import ObjectPreview from './Object/ObjectPreview';
import RelationControl from './Relation/RelationControl';
import RelationPreview from './Relation/RelationPreview';
import BooleanControl from './Boolean/BooleanControl';

import VimeoControl from './Vimeo/VimeoControl';
import VimeoPreview from './Vimeo/VimeoPreview';
//import GalleryControl from './Gallery/GalleryControl'
import GalleryPreview from './Gallery/GalleryPreview'
import PortfolioPreview from './Gallery/PortfolioPreview'


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
registerWidget('unknown', UnknownControl, UnknownPreview);

registerWidget('gallery', ListControl, GalleryPreview);
registerWidget('portfolios', ListControl, PortfolioPreview);
registerWidget('vimeo', VimeoControl, VimeoPreview);
