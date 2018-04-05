import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Observer from 'react-intersection-observer'

// https://github.com/nodeca/pica
// const picaJs = require('pica')();

import CardImage from '../../MediaLibrary/CardImage'

/*
import picaImport from 'pica/dist/pica'
const pica = picaImport()

// https://stackoverflow.com/a/7557690

export class ImageCanvas extends Component {

  constructor(props) {
    super(props);

    this.state = {
      inView: false
    }
  }

  componentDidMount() {
    // this.prepareCanvas(this.props.src)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      // this.prepareCanvas(nextProps.src)
    }
  }

  prepareCanvas = (src) => {
    const self = this
    const canvas = this.canvas
    const ctx = canvas.getContext('2d')
    const image = new Image()
    image.src = src
    image.setAttribute('crossOrigin', '')
    image.onload = function(event){

      const aspectRatio = image.width / image.height
      canvas.width = aspectRatio * 210
      canvas.height = 210

      pica.resize(image, canvas, {
        unsharpAmount: 80,
        unsharpRadius: 0.6,
        unsharpThreshold: 2
      }).then(result => pica.toBlob(result, 'image/jpeg', 0.90))
      .then(blob => console.log('resized to canvas & created blob!', blob));
      //.then(result => console.log('resize done!', result));

      //console.log('aspectRatio, width: ', aspectRatio, ctx.width, ctx.height)
      //ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

  }

  handleInViewChange = (inView) => {
    if (inView && !this.state.inView) {
      this.setState({inView: true})
      this.prepareCanvas(this.props.src)
    }
  }

  render() {
    return (
      <Observer tag={`span`} onChange={this.handleInViewChange}>
        <canvas
          ref={ (ref) => this.canvas = ref }
          style={{
            ...this.props.style
          }}
          className={ this.props.className }
        />
      </Observer>
    )
  }
}

*/

class GalleryPreview extends Component {
  state = {
    show: false
  }

  toggleCollapse = () => this.setState({show: !this.state.show})

  get images() {
    const { value, getAsset } = this.props
    const images = []
    value.forEach(function(val, index) {
      const src = val.getIn(['image'])
      // console.log('valueMap: ', val);
      // console.log('imageMap src: ', src)
      const asset = getAsset(src)
      if (asset) {
        images.push('https://raw.githubusercontent.com/swartists/starworksartists.com/development/static/' + asset.path)
        //images.push(asset.path)
      }
    })
    return images
  }

  render() {
    return (
      <div
        style={{
          textAlign: 'left'
        }}
      >
        <button onClick={this.toggleCollapse}>
        { this.state.show ? 'Hide' : 'Show' }
        </button>
        <div
          style={{
            display: this.state.show ? 'block' : 'none',
            textAlign: 'center'
          }}
        >
        {
          this.images.length > 0 && this.images.map((image, index) =>
            <Observer key={index} tag={`span`} triggerOnce={true}>
              { (inView) =>
                <CardImage
                  style={{
                    display: 'inline-block',
                    margin: '15px',
                    cursor: 'pointer',
                    height: '320px'
                  }}
                  src={image}
                  isVisible={inView}
                />
              }
            </Observer>
          )
        }
        </div>
      </div>
    )
  }
}

/*
const GalleryPreview = ({ value, getAsset }) => {
  //console.log('GalleryPreview: field: ', field, field.get('fields'))
  //console.log('GalleryPreview: entry.getIn: ', entry, entry.getIn(['data', 'images']))

  const images = []
  value.forEach(function(val, index) {
    const src = val.getIn(['image'])
    // console.log('valueMap: ', val);
    // console.log('imageMap src: ', src)
    const asset = getAsset(src)
    if (asset) {
      //console.log('getAsset: ', asset, asset && asset.path)
      images.push('https://raw.githubusercontent.com/swartists/starworksartists.com/development/static/' + asset.path)
      // images.push(asset.path)
    }
  })

  // console.log('images: ', images)

  return (
    <div
      style={{
        textAlign: 'center'
      }}
    >
      {
        images.length > 0 && images.map(image =>
        <ImageCanvas
          key={ image }
          src={ image }
          style={{
            display: 'inline-block',
            margin: '15px',
            cursor: 'pointer'
          }}
        />
      )
    }
    </div>
  )
  // getIn data, images returns the List
  // return ( <div className="nc-widgetPreview">{(field && field.get('fields')) || null}</div>
}*/


GalleryPreview.propTypes = {
  value: PropTypes.node,
};
export default GalleryPreview;

