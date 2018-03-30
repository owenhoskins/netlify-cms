import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ObjectPreview from 'EditorWidgets/Object/ObjectPreview';

const VimeoPreview = ObjectPreview;

VimeoPreview.propTypes = {
  field: PropTypes.node,
};

export default VimeoPreview;
