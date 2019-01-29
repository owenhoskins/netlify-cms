import React from 'react';
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { colors, colorsRaw, borders, lengths } from 'netlify-cms-ui-default';

const Card = styled.div`
  width: ${props => props.width};
  padding: ${props => props.padding};
  height: 200px;
  cursor: pointer;
  overflow: hidden;
  background-color: ${props => props.isPrivate && colors.textFieldBorder};

  &:focus {
    outline: none;
  }
`;

const CardInner = styled.div`
  border: ${borders.textField};
  border-color: ${props => props.isSelected && colors.active};
  border-radius: ${lengths.borderRadius};
  background-color: ${colorsRaw.blueLight};
`;

const CardImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: contain;
  border-radius: 2px 2px 0 0;
`;

const CardImagePlaceholder = CardImage.withComponent(`div`);

const CardText = styled.p`
  color: ${colors.text};
  padding: 2px 8px;
  margin: 0;
  overflow-wrap: break-word;
  line-height: 1.3 !important;
  text-align: left;
  font-size: 10px;
`;

const MediaLibraryCard = ({ style, imageUrl, text, onClick, isSelected }) => (
  <Card
    style={style}
    width={`200px`}
    //margin={`10px`}
    tabIndex="-1"
    isPrivate={false}
    padding={`10px 5px`}
  >
    <CardInner isSelected={isSelected}>
      {imageUrl ? (
        <CardImage onClick={onClick} src={`${imageUrl}-/resize/x300/`} />
      ) : (
        <CardImagePlaceholder onClick={onClick} />
      )}
      <CardText>{text}</CardText>
    </CardInner>
  </Card>
);

MediaLibraryCard.propTypes = {
  isSelected: PropTypes.bool,
  imageUrl: PropTypes.string,
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  width: PropTypes.string.isRequired,
  margin: PropTypes.string.isRequired,
  isPrivate: PropTypes.bool,
  style: PropTypes.object,
};

export default MediaLibraryCard;
