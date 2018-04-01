import PropTypes from 'prop-types';
import React, { Component } from 'react';

const VimeoPreview = ({ field, value }) => {

  const getObjectValue = idx => value.get(idx) || Map();

  //console.log('value idx 0: ', getObjectValue(0))

  const videos = value.map((item, idx) => {

    const title = item.get('title')
    const id = item.get('url')
    const poster = item.get('poster')
    const ratio = item.get('ratio')
    //console.log('item props: ', title, id, poster, ratio)

    return {
     title,
     id,
     poster,
     ratio
    }
  })


  return (
    <div>
      <h1>Videos</h1>
      { videos && videos.map(video => {
        return (
          <div>
            <h2>{video.title}</h2>
            <img src={video.poster} />
          </div>
        )
      }) }
    </div>
  )
};

VimeoPreview.propTypes = {
  field: PropTypes.node,
};

export default VimeoPreview;
