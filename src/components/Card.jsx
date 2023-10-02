import React from 'react';
import './Card.css';

const Card = ({ item, onItemClick }) => {
  return (
    <div
      className="card"
      onClick={() => onItemClick(item.id)}
    >
      <img src={item.uri} alt={item.tags.title} width="200" />      
      <h3>{item.tags.title}</h3>
      <p>Brand: {item.tags.brand}</p>
      <p>Price: ${item.tags.price}</p>
      <p>
        Available Sizes:&nbsp;
        {item.tags.available_sizes.map((size) => (
          <span key={size}>{size}&nbsp;</span>
        ))}
      </p>
      <a href={item.tags.link} target="_blank" rel="noreferrer">
        View Item
        
      </a>
      </div>
  );
  
};

export default Card;
