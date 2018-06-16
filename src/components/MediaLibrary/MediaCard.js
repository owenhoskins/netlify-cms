import React from 'react'
import c from 'classnames';

export const MediaCard = ({handleAssetClick, file, selectedFiles}) => {

  const handleClick = () => {
    if (handleAssetClick) handleAssetClick(file);
  }

  const isSelected = () => {
    const key = file.key;
    return selectedFiles.findIndex(file => file.key === key ) !== -1;
  }

  return (
    <div
      className={c('nc-mediaLibrary-card', { 'nc-mediaLibrary-card-selected': isSelected() })}
      onClick={handleClick}
      tabIndex="-1"
    >
      <div className="nc-mediaLibrary-cardImage-container">
        {
          file.isViewableImage
            ? <img src={file.url} className="nc-mediaLibrary-cardImage"/>
            : <div className="nc-mediaLibrary-cardImage"/>
        }
      </div>
      <p className="nc-mediaLibrary-cardText">{file.name}</p>
    </div>
  )
}
