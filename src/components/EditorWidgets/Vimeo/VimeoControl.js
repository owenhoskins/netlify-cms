import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List, Map } from 'immutable';
import { partial } from 'lodash';
import c from 'classnames';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Icon, ListItemTopBar } from 'UI';
import ObjectControl from 'EditorWidgets/Object/ObjectControl';

const ACCESS_TOKEN = '3c67e5f3d4c0ec1382506774112cba7b'


function ListItem(props) {
  return <div {...props} className={`list-item ${ props.className || '' }`}>{props.children}</div>;
}
ListItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};
ListItem.displayName = 'list-item';

function valueToString(value) {
  return value ? value.join(',').replace(/,([^\s]|$)/g, ', $1') : '';
}

const SortableListItem = SortableElement(ListItem);

const TopBar = ({ onAdd, onUpdate, listLabel, onCollapseAllToggle, allItemsCollapsed, itemsCount, fetchingDetails }) => (
  <div className="nc-listControl-topBar">
    <div className="nc-listControl-listCollapseToggle">
      <button className="nc-listControl-listCollapseToggleButton" onClick={onCollapseAllToggle}>
        <Icon type="chevron" direction={allItemsCollapsed ? 'up' : 'down'} size="small" />
      </button>
      {itemsCount} {listLabel}
    </div>
    <button className="nc-listControl-addButton" onClick={onAdd}>
      Add {listLabel} <Icon type="add" size="xsmall" />
    </button>
    { itemsCount > 0 &&
      <button
        className="nc-listControl-addButton"
        onClick={onUpdate}
        disabled={ fetchingDetails ? true : false}
      >
        Get details from API <Icon type="add" size="xsmall" />
      </button>
    }
  </div>
);

const SortableList = SortableContainer(({ items, renderItem }) => {
  return <div>{items.map(renderItem)}</div>;
});

const valueTypes = {
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE',
};

export default class VimeoControl extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onChangeObject: PropTypes.func.isRequired,
    value: ImmutablePropTypes.list,
    field: PropTypes.object,
    forID: PropTypes.string,
    mediaPaths: ImmutablePropTypes.map.isRequired,
    getAsset: PropTypes.func.isRequired,
    onOpenMediaLibrary: PropTypes.func.isRequired,
    onAddAsset: PropTypes.func.isRequired,
    onRemoveInsertedMedia: PropTypes.func.isRequired,
    classNameWrapper: PropTypes.string.isRequired,
    setActiveStyle: PropTypes.func.isRequired,
    setInactiveStyle: PropTypes.func.isRequired,
  };

  static defaultProps = {
    value: List(),
  };

  constructor(props) {
    super(props);
    const { field, value } = props;
    const allItemsCollapsed = field.get('collapsed', true);
    const itemsCollapsed = value && Array(value.size).fill(allItemsCollapsed);

    this.state = {
      itemsCollapsed: List(itemsCollapsed),
      value: valueToString(value),
    };

    this.valueType = null;
  }

  /**
   * Always update so that each nested widget has the option to update. This is
   * required because ControlHOC provides a default `shouldComponentUpdate`
   * which only updates if the value changes, but every widget must be allowed
   * to override this.
   */
  shouldComponentUpdate() {
    return true;
  }

  componentDidMount() {
    const { field } = this.props;

    if (field.get('fields')) {
      this.valueType = valueTypes.MULTIPLE;
    } else if (field.get('field')) {
      this.valueType = valueTypes.SINGLE;
    }
  }

  componentWillUpdate(nextProps) {
    if (this.props.field === nextProps.field) return;

    if (nextProps.field.get('fields')) {
      this.valueType = valueTypes.MULTIPLE;
    } else if (nextProps.field.get('field')) {
      this.valueType = valueTypes.SINGLE;
    }
  }

  handleChange = (e) => {
    const { onChange } = this.props;
    const oldValue = this.state.value;
    const newValue = e.target.value;
    const listValue = e.target.value.split(',');
    if (newValue.match(/,$/) && oldValue.match(/, $/)) {
      listValue.pop();
    }

    const parsedValue = valueToString(listValue);
    this.setState({ value: parsedValue });
    onChange(listValue.map(val => val.trim()));
  };

  handleFocus = () => {
    this.props.setActiveStyle();
  }

  handleBlur = (e) => {
    const listValue = e.target.value.split(',').map(el => el.trim()).filter(el => el);
    this.setState({ value: valueToString(listValue) });
    this.props.setInactiveStyle();
  };

  handleAdd = (e) => {
    e.preventDefault();
    const { value, onChange } = this.props;
    const parsedValue = (this.valueType === valueTypes.SINGLE) ? null : Map();
    this.setState({ itemsCollapsed: this.state.itemsCollapsed.push(false) });
    onChange((value || List()).push(parsedValue));
  };

  handleUpdate = () => {
    const { value, onChange } = this.props;

    this.setState({ fetchingDetails: true });

      const videos = value.map((item, index) => {
        return new Promise(resolve => {
          const url = item.get('name', item.get('url'))

          // ES6 Fetch docs
          // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

          /*
          https://stackoverflow.com/questions/46582015/vimeo-api-get-request-in-javascript
          d3.json("https://api.vimeo.com/videos/123456789/")
          .header("Authorization", "Bearer <YourPersonalAccessToken>")
          .get(function(error, data) {
            console.log(data);
          });

          fetch with headers
          https://stackoverflow.com/questions/30203044/using-an-authorization-header-with-fetch-in-react-native

           fetch('URL_GOES_HERE', {
               method: 'post',
               headers: new Headers({
                 'Authorization': 'Basic '+btoa('username:password'),
                 'Content-Type': 'application/x-www-form-urlencoded'
               }),
               body: 'A=1&B=2'
           });
          */

          fetch(`https://api.vimeo.com/videos/${url}/`, {
            method: 'get',
            headers: new Headers({
              'Authorization': `Bearer ${ACCESS_TOKEN}`
            })
          })
            .then(response => {
              if (response.ok) {
                return Promise.resolve(response);
              }
              else {
                return Promise.reject(new Error('Failed to load'));
              }
            })
            .then(response => response.json()) // parse response as JSON
            .then(data => {
              const { name, pictures } = data
              const { sizes } = pictures
              const biggest = sizes[sizes.length - 1]
              const poster = biggest.link
              const aspectRatio = biggest.width / biggest.height
              const ratio = `${1 / aspectRatio * 100}%`

              // this works if I nest the data.
              //const newValue = Map().set('title', name).set('poster', poster).set('ratio', ratio)
              //console.log(url, name, poster, ratio, newValue)
              //this.handleChangeForUpdate(index, 'video', newValue)

              this.handleChangeForUpdate(index, 'title', name)
              this.handleChangeForUpdate(index, 'poster', poster)
              this.handleChangeForUpdate(index, 'ratio', ratio)

              resolve({
                title: name,
                poster,
                ratio,
                id: url
              })
              // success
            })
            .catch(function(error) {
              console.log(`Error: ${error.message}`);
            });
        })
      })

      Promise.all(videos).then((res) => {
        this.setState({ fetchingDetails: false });
      })

  }

  handleChangeForUpdate(index, fieldName, newValue, newMetadata) {
    const { value, metadata, onChange, forID } = this.props;
    const newObjectValue = this.getObjectValue(index).set(fieldName, newValue);
    const parsedValue = (this.valueType === valueTypes.SINGLE) ? newObjectValue.first() : newObjectValue;
    const parsedMetadata = {
      [forID]: Object.assign(metadata ? metadata.toJS() : {}, newMetadata ? newMetadata[forID] : {}),
    };
    onChange(value.set(index, parsedValue), parsedMetadata);
  }

  /**
   * In case the `onChangeObject` function is frozen by a child widget implementation,
   * e.g. when debounced, always get the latest object value instead of using
   * `this.props.value` directly.
   */
  getObjectValue = idx => this.props.value.get(idx) || Map();

  handleChangeFor(index) {
    return (fieldName, newValue, newMetadata) => {
      const { value, metadata, onChange, forID } = this.props;
      const newObjectValue = this.getObjectValue(index).set(fieldName, newValue);
      const parsedValue = (this.valueType === valueTypes.SINGLE) ? newObjectValue.first() : newObjectValue;
      const parsedMetadata = {
        [forID]: Object.assign(metadata ? metadata.toJS() : {}, newMetadata ? newMetadata[forID] : {}),
      };
      onChange(value.set(index, parsedValue), parsedMetadata);
    };
  }

  handleRemove = (index, event) => {
    event.preventDefault();
    const { itemsCollapsed } = this.state;
    const { value, metadata, onChange, forID } = this.props;
    const parsedMetadata = metadata && { [forID]: metadata.removeIn(value.get(index).valueSeq()) };

    this.setState({ itemsCollapsed: itemsCollapsed.delete(index) });

    onChange(value.remove(index), parsedMetadata);
  }

  handleItemCollapseToggle = (index, event) => {
    event.preventDefault();
    const { itemsCollapsed } = this.state;
    const collapsed = itemsCollapsed.get(index);
    this.setState({ itemsCollapsed: itemsCollapsed.set(index, !collapsed) });
  }

  handleCollapseAllToggle = (e) => {
    e.preventDefault();
    const { value } = this.props;
    const { itemsCollapsed } = this.state;
    const allItemsCollapsed = itemsCollapsed.every(val => val === true);
    this.setState({ itemsCollapsed: List(Array(value.size).fill(!allItemsCollapsed)) });
  }

  objectLabel(item) {
    const { field } = this.props;
    const multiFields = field.get('fields');
    const singleField = field.get('field');
    const labelField = (multiFields && multiFields.first()) || singleField;
    const value = multiFields ? item.get(multiFields.first().get('name')) : singleField.get('label');
    return value || `No ${ labelField.get('name') }`;
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { value, onChange } = this.props;
    const { itemsCollapsed } = this.state;

    // Update value
    const item = value.get(oldIndex);
    const newValue = value.delete(oldIndex).insert(newIndex, item);
    this.props.onChange(newValue);

    // Update collapsing
    const collapsed = itemsCollapsed.get(oldIndex);
    const updatedItemsCollapsed = itemsCollapsed.delete(oldIndex).insert(newIndex, collapsed);
    this.setState({ itemsCollapsed: updatedItemsCollapsed });
  };

  renderItem = (item, index) => {
    const {
      field,
      getAsset,
      mediaPaths,
      onOpenMediaLibrary,
      onAddAsset,
      onRemoveInsertedMedia,
      classNameWrapper,
    } = this.props;
    const { itemsCollapsed } = this.state;
    const collapsed = itemsCollapsed.get(index);
    const classNames = ['nc-listControl-item', collapsed ? 'nc-listControl-collapsed' : ''];

    return (<SortableListItem className={classNames.join(' ')} index={index} key={`item-${ index }`}>
      <ListItemTopBar
        className="nc-listControl-itemTopBar"
        collapsed={collapsed}
        onCollapseToggle={partial(this.handleItemCollapseToggle, index)}
        onRemove={partial(this.handleRemove, index)}
        dragHandleHOC={SortableHandle}
      />
      <div className="nc-listControl-objectLabel">{this.objectLabel(item)}</div>
      <ObjectControl
        value={item}
        field={field}
        onChangeObject={this.handleChangeFor(index)}
        getAsset={getAsset}
        onOpenMediaLibrary={onOpenMediaLibrary}
        mediaPaths={mediaPaths}
        onAddAsset={onAddAsset}
        onRemoveInsertedMedia={onRemoveInsertedMedia}
        classNameWrapper={`${classNameWrapper} nc-listControl-objectControl`}
        forList
      />
    </SortableListItem>);
  };

  renderVimeoControl() {
    const { value, forID, field, classNameWrapper } = this.props;
    const { itemsCollapsed } = this.state;
    const items = value || List();
    return (
      <div id={forID} className={c(classNameWrapper, 'nc-listControl')}>
        <TopBar
          fetchingDetails={this.state.fetchingDetails}
          onAdd={this.handleAdd}
          onUpdate={this.handleUpdate}
          listLabel={field.get('label').toLowerCase()}
          onCollapseAllToggle={this.handleCollapseAllToggle}
          allItemsCollapsed={itemsCollapsed.every(val => val === true)}
          itemsCount={items.size}
        />
        <SortableList
          items={items}
          renderItem={this.renderItem}
          onSortEnd={this.onSortEnd}
          useDragHandle
          lockAxis="y"
        />
      </div>
    );
  }

  render() {
    const { field, forID, classNameWrapper } = this.props;
    const { value } = this.state;

    if (field.get('field') || field.get('fields')) {
      return this.renderVimeoControl();
    }

    return (<input
      type="text"
      id={forID}
      value={value}
      onChange={this.handleChange}
      onFocus={this.handleFocus}
      onBlur={this.handleBlur}
      className={classNameWrapper}
    />);
  }
};
