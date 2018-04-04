import React from 'react';
import { connect } from 'react-redux';
import { orderBy, get, isEmpty, map } from 'lodash';
import c from 'classnames';
import fuzzy from 'fuzzy';
import Waypoint from 'react-waypoint';
import { Modal, FileUploadButton } from 'UI';
import { resolvePath, fileExtension } from 'Lib/pathHelper';
import { changeDraftField } from 'Actions/entries';
import {
  loadMedia as loadMediaAction,
  persistMedia as persistMediaAction,
  deleteMedia as deleteMediaAction,
  insertMedia as insertMediaAction,
  closeMediaLibrary as closeMediaLibraryAction,
} from 'Actions/mediaLibrary';
import { Icon } from 'UI';

import CardImage from './CardImage'

import {
  Grid,
  AutoSizer
} from 'react-virtualized'
//import 'react-virtualized/styles.css'; // only needs to be imported once

/**
 * Extensions used to determine which files to show when the media library is
 * accessed from an image insertion field.
 */
const IMAGE_EXTENSIONS_VIEWABLE = [ 'jpg', 'jpeg', 'webp', 'gif', 'png', 'bmp', 'tiff', 'svg' ];
const IMAGE_EXTENSIONS = [ ...IMAGE_EXTENSIONS_VIEWABLE ];

class MediaLibrary extends React.Component {

  /**
   * The currently selected file and query are tracked in component state as
   * they do not impact the rest of the application.
   */
  state = {
    selectedFile: {},
    query: '',
    blobs: []
  };

  componentDidMount() {
    this.props.loadMedia();
  }

  componentWillReceiveProps(nextProps) {
    /**
     * We clear old state from the media library when it's being re-opened
     * because, when doing so on close, the state is cleared while the media
     * library is still fading away.
     */
    const isOpening = !this.props.isVisible && nextProps.isVisible;
    if (isOpening) {
      this.setState({ selectedFile: {}, query: '' });
    }

    if (isOpening && (this.props.privateUpload !== nextProps.privateUpload)) {
      this.props.loadMedia({ privateUpload: nextProps.privateUpload });
    }
  }

  /**
   * Filter an array of file data to include only images.
   */
  filterImages = (files = []) => {
    return files.filter(file => {
      const ext = fileExtension(file.name).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });
  };

  /**
   * Transform file data for table display.
   */
  toTableData = files => {
    const tableData = files && files.map(({ key, name, size, queryOrder, url, urlIsPublicPath }) => {
      const ext = fileExtension(name).toLowerCase();
      return {
        key,
        name,
        type: ext.toUpperCase(),
        size,
        queryOrder,
        url,
        urlIsPublicPath,
        isImage: IMAGE_EXTENSIONS.includes(ext),
        isViewableImage: IMAGE_EXTENSIONS_VIEWABLE.includes(ext),
      };
    });

    /**
     * Get the sort order for use with `lodash.orderBy`, and always add the
     * `queryOrder` sort as the lowest priority sort order.
     */
    const { sortFields } = this.state;
    const fieldNames = map(sortFields, 'fieldName').concat('queryOrder');
    const directions = map(sortFields, 'direction').concat('asc');

    const ordered = orderBy(tableData, fieldNames, directions);
    //return orderBy(tableData, fieldNames, directions);

    const rows = ordered.reduce((acc, cell, idx) => {
      const row = Math.floor(idx / 3);
      acc[row] = acc[row] ? [...acc[row], cell] : [cell]; // eslint-disable-line no-param-reassign
      return acc;
    }, []);

    return rows
  };

  handleClose = () => {
    this.props.closeMediaLibrary();
  };

  /**
   * Toggle asset selection on click.
   */
  handleAssetClick = asset => {
    const selectedFile = this.state.selectedFile.key === asset.key ? {} : asset;
    this.setState({ selectedFile });
  };

  /**
   * Upload a file.
   */
  handlePersist = async event => {
    /**
     * Stop the browser from automatically handling the file input click, and
     * get the file for upload, and retain the synthetic event for access after
     * the asynchronous persist operation.
     */
    event.stopPropagation();
    event.preventDefault();
    event.persist();
    const { persistMedia, privateUpload } = this.props;
    const { files: fileList } = event.dataTransfer || event.target;
    const files = [...fileList];
    const file = files[0];

    await persistMedia(file, { privateUpload });

    event.target.value = null;

    this.scrollToTop();
  };

  /**
   * Stores the public path of the file in the application store, where the
   * editor field that launched the media library can retrieve it.
   */
  handleInsert = () => {
    const { selectedFile } = this.state;
    const { name, url, urlIsPublicPath } = selectedFile;
    const { insertMedia, publicFolder } = this.props;
    const publicPath = urlIsPublicPath ? url : resolvePath(name, publicFolder);
    insertMedia(publicPath);
    this.handleClose();
  };

  /**
   * Removes the selected file from the backend.
   */
  handleDelete = () => {
    const { selectedFile } = this.state;
    const { files, deleteMedia, privateUpload } = this.props;
    if (!window.confirm('Are you sure you want to delete selected media?')) {
      return;
    }
    const file = files.find(file => selectedFile.key === file.key);
    deleteMedia(file, { privateUpload })
      .then(() => {
        this.setState({ selectedFile: {} });
      });
  };

  handleLoadMore = () => {
    const { loadMedia, dynamicSearchQuery, page, privateUpload } = this.props;
    loadMedia({ query: dynamicSearchQuery, page: page + 1, privateUpload });
  };

  /**
   * Executes media library search for implementations that support dynamic
   * search via request. For these implementations, the Enter key must be
   * pressed to execute search. If assets are being stored directly through
   * the GitHub backend, search is in-memory and occurs as the query is typed,
   * so this handler has no impact.
   */
  handleSearchKeyDown = async (event) => {
    const { dynamicSearch, loadMedia, privateUpload } = this.props;
    if (event.key === 'Enter' && dynamicSearch) {
      await loadMedia({ query: this.state.query, privateUpload })
      this.scrollToTop();
    }
  };

  scrollToTop = () => {
    this.scrollContainerRef.scrollTop = 0;
  }

  /**
   * Updates query state as the user types in the search field.
   */
  handleSearchChange = event => {
    this.setState({ query: event.target.value });
  };

  /**
   * Filters files that do not match the query. Not used for dynamic search.
   */
  queryFilter = (query, files) => {
    /**
     * Because file names don't have spaces, typing a space eliminates all
     * potential matches, so we strip them all out internally before running the
     * query.
     */
    const strippedQuery = query.replace(/ /g, '');
    const matches = fuzzy.filter(strippedQuery, files, { extract: file => file.name });
    const matchFiles = matches.map((match, queryIndex) => {
      const file = files[match.index];
      return { ...file, queryIndex };
    });
    return matchFiles;
  };

  getDatum = (rowIndex, columnIndex) => {
    const {
      files,
      dynamicSearch,
      forImage
    } = this.props;
    const { query, selectedFile } = this.state;
    const filteredFiles = forImage ? this.filterImages(files) : files;
    const queriedFiles = (!dynamicSearch && query) ? this.queryFilter(query, filteredFiles) : filteredFiles;
    const tableData = this.toTableData(queriedFiles);

    if (tableData && tableData.length > 0) {
      if (tableData[rowIndex] && tableData[rowIndex].length > 0) {
        if (tableData[rowIndex][columnIndex]) {
          return tableData[rowIndex][columnIndex]
        }
      }
    }

    return null

    //return tableData ? tableData[rowIndex][columnIndex] : null

  }

  saveBlob = (fileId, blob) => {
    // console.log('saveBlob: ', fileId, blob)
    const object = {
      key: fileId,
      blob: blob
    }
    this.setState({ blobs: [...this.state.blobs, object]})
  }

  cellRenderer = ({columnIndex, key, rowIndex, style, isVisible}) => {

    const { selectedFile } = this.state;

    const file = this.getDatum(rowIndex, columnIndex)

    if (file) {
      const savedBlob = this.state.blobs.find(blob => {
        return blob.key === file.key
      })
      // console.log('cellRenderer savedBlob: ', savedBlob)
      //console.log('cellRenderer: ', rowIndex, columnIndex, file.key)
      return (
        <div
          key={file.key}
          onClick={() => this.handleAssetClick(file)}
          tabIndex="-1"
          style={style}
          className={'nc-mediaLibrary-card-wrapper'}
        >
          <div
            className={c('nc-mediaLibrary-card', { 'nc-mediaLibrary-card-selected': selectedFile.key === file.key })}
          >
            <div className="nc-mediaLibrary-cardImage-container">
              {
                file.isViewableImage
                  ? (
                    <CardImage
                      className="nc-mediaLibrary-cardImage"
                      src={file.url}
                      saveBlob={this.saveBlob}
                      blob={savedBlob && savedBlob.blob}
                      fileId={file.key}
                      isVisible={true}
                    />
                    )
                  : <div className="nc-mediaLibrary-cardImage"/>
              }
              {/*<img src={file.url} className="nc-mediaLibrary-cardImage"/>*/}
            </div>
            <p className="nc-mediaLibrary-cardText">{file.name}</p>
          </div>
        </div>
      )
    } else {
      return <div/>
    }

  }

  render() {
    const {
      isVisible,
      canInsert,
      files,
      dynamicSearch,
      dynamicSearchActive,
      forImage,
      isLoading,
      isPersisting,
      isDeleting,
      hasNextPage,
      page,
      isPaginating,
      privateUpload,
    } = this.props;
    const { query, selectedFile } = this.state;
    const filteredFiles = forImage ? this.filterImages(files) : files;
    const queriedFiles = (!dynamicSearch && query) ? this.queryFilter(query, filteredFiles) : filteredFiles;
    const tableData = this.toTableData(queriedFiles);
    const hasFiles = files && !!files.length;
    const hasFilteredFiles = filteredFiles && !!filteredFiles.length;
    const hasSearchResults = queriedFiles && !!queriedFiles.length;
    const hasMedia = hasSearchResults;
    const shouldShowEmptyMessage = !hasMedia;
    const emptyMessage = (isLoading && !hasMedia && 'Loading...')
      || (dynamicSearchActive && 'No results.')
      || (!hasFiles && 'No assets found.')
      || (!hasFilteredFiles && 'No images found.')
      || (!hasSearchResults && 'No results.');
    const hasSelection = hasMedia && !isEmpty(selectedFile);
    const shouldShowButtonLoader = isPersisting || isDeleting;

    console.log('tableData: ', tableData)

    return (
      <Modal
        isOpen={isVisible}
        onClose={this.handleClose}
        className={c('nc-mediaLibrary-dialog', { 'nc-mediaLibrary-dialogPrivate': privateUpload })}
      >
        <div className="nc-mediaLibrary-top">
          <div>
            <div className="nc-mediaLibrary-header">
              <button className="nc-mediaLibrary-close" onClick={this.handleClose}>
                <Icon type="close"/>
              </button>
              <h1 className="nc-mediaLibrary-title">
                {privateUpload ? 'Private ' : null}
                {forImage ? 'Images' : 'Media assets'}
              </h1>
            </div>
            <div className="nc-mediaLibrary-search">
              <Icon type="search" size="small"/>
              <input
                className=""
                value={query}
                onChange={this.handleSearchChange}
                onKeyDown={event => this.handleSearchKeyDown(event)}
                placeholder="Search..."
                disabled={!dynamicSearchActive && !hasFilteredFiles}
              />
            </div>
          </div>
          <div className="nc-mediaLibrary-actionContainer">
            <FileUploadButton
              className={`nc-mediaLibrary-uploadButton ${shouldShowButtonLoader ? 'nc-mediaLibrary-uploadButton-disabled' : ''}`}
              label={isPersisting ? 'Uploading...' : 'Upload new'}
              imagesOnly={forImage}
              onChange={this.handlePersist}
              disabled={shouldShowButtonLoader}
            />
            <div className="nc-mediaLibrary-lowerActionContainer">
              <button
                className="nc-mediaLibrary-deleteButton"
                onClick={this.handleDelete}
                disabled={shouldShowButtonLoader || !hasSelection}
              >
                {isDeleting ? 'Deleting...' : 'Delete selected'}
              </button>
              { !canInsert ? null :
                <button
                  onClick={this.handleInsert}
                  disabled={!hasSelection}
                  className="nc-mediaLibrary-insertButton"
                >
                  Choose selected
                </button>
              }
            </div>
          </div>
        </div>
        {
          shouldShowEmptyMessage
            ? <div className="nc-mediaLibrary-emptyMessage"><h1>{emptyMessage}</h1></div>
            : null
        }
        <div>
          <AutoSizer>
            {({width, height}) => (
              <Grid
                className="nc-mediaLibrary-cardGrid-container"
                ref={ref => (this.scrollContainerRef = ref)}
                cellRenderer={this.cellRenderer}
                height={height}
                width={width}
                overscanRowCount={3}
                columnWidth={290}
                rowHeight={240}
                rowCount={hasFiles ? tableData.length : 0}
                //columnCount={hasFiles ? this.props.files.length : 0}
                columnCount={3}
                scrollToColumn={0}
                scrollToRow={0}
              />
            )}
          </AutoSizer>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  const { config, mediaLibrary } = state;
  const configProps = {
    publicFolder: config.get('public_folder'),
  };
  const mediaLibraryProps = {
    isVisible: mediaLibrary.get('isVisible'),
    canInsert: mediaLibrary.get('canInsert'),
    files: mediaLibrary.get('files'),
    dynamicSearch: mediaLibrary.get('dynamicSearch'),
    dynamicSearchActive: mediaLibrary.get('dynamicSearchActive'),
    dynamicSearchQuery: mediaLibrary.get('dynamicSearchQuery'),
    forImage: mediaLibrary.get('forImage'),
    isLoading: mediaLibrary.get('isLoading'),
    isPersisting: mediaLibrary.get('isPersisting'),
    isDeleting: mediaLibrary.get('isDeleting'),
    privateUpload: mediaLibrary.get('privateUpload'),
    page: mediaLibrary.get('page'),
    hasNextPage: mediaLibrary.get('hasNextPage'),
    isPaginating: mediaLibrary.get('isPaginating'),
  };
  return { ...configProps, ...mediaLibraryProps };
};

const mapDispatchToProps = {
  loadMedia: loadMediaAction,
  persistMedia: persistMediaAction,
  deleteMedia: deleteMediaAction,
  insertMedia: insertMediaAction,
  closeMediaLibrary: closeMediaLibraryAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(MediaLibrary);
