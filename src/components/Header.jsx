import React from 'react';
import './components.css'; // Import the CSS file
import envy from '../envy.svg'
import cart from '../cart.svg'
import search from '../Search.svg'

const Header = () => {
  return (
    <div className="Header">
      <div className="HeaderLeft">
        <div className="ImageRemovebgPreview1">
      
            <img src = {envy}></img>
          
         
        </div>
        <div className="InputText">
          <div className="PlaceholderWrapper">
            <div className="Placeholder">Search for...</div>
          </div>
          <div className="LineRoundedSearch">
           
              <img src={search}></img>
          
          </div>
        </div>
      </div>
      <div className="ButtonRow">
        <div className="NavList">
          <div className="Link">
            <div className="LinkItem">Men</div>
          </div>
          <div className="Link">
            <div className="LinkItem">Women</div>
          </div>
          <div className="Link">
            <div className="LinkItem">Kids</div>
          </div>
          <div className="LineRoundedShoppingCart">
            <div className="ShoppingCart">
             <img src={cart}></img>
            </div>
          </div>
        </div>
        <div className="PrimaryButton">
          <div className="ButtonText">Login</div>
        </div>
      </div>
    </div>
  );
};

export default Header;


