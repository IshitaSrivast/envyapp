import React, { useState, useEffect, useRef } from "react";
import "./components.css";
import axios from "axios";

import "rc-slider/assets/index.css";


const Main = () => {
  const APIKEY = "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";
  const [searchTerm, setSearchTerm] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [filtered , setFiltered] = useState("")


  const [messages, setMessages] = useState(JSON.parse(sessionStorage.getItem('messages')) || []);  const [newMessage, setNewMessage] = useState("");
  const chatScreenRef = useRef(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [sliderValue, setSliderValue] = useState([0, 100]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [key, setKey] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);

  const rangeMin = 100;

  const [minRange, setMinRange] = useState(0);
  const [maxRange, setMaxRange] = useState(0);

  useEffect(() => {
    updateSlider();
  }, [minRange]);
  useEffect(() => {
    updateSlider();
  }, [maxRange]);

  const updateSlider = () => {
    const range = document.querySelector(".range-selected");
    const rangeInput = document.querySelectorAll(".range-input input");
    const rangePrice = document.querySelectorAll(".range-price input");

    rangeInput.forEach((input) => {
      input.addEventListener("input", (e) => {
        let newMinRange = rangeInput[0].value;
        let newMaxRange = rangeInput[1].value;
        if (newMaxRange - newMinRange < rangeMin) {
          if (e.target.className === "min") {
            rangeInput[0].value = newMaxRange - rangeMin;
          } else {
            rangeInput[1].value = newMinRange + rangeMin;
          }
        } else {
          setMinRange(newMinRange);
          setMaxRange(newMaxRange);
          range.style.left = (newMinRange / rangeInput[0].max) * 100 + "%";
          range.style.right =
            100 - (newMaxRange / rangeInput[1].max) * 100 + "%";
        }
      });
    });

    rangePrice.forEach((input) => {
      input.addEventListener("input", (e) => {
        let newMinPrice = rangePrice[0].value;
        let newMaxPrice = rangePrice[1].value;
        if (
          newMaxPrice - newMinPrice >= rangeMin &&
          newMaxPrice <= rangeInput[1].max
        ) {
          if (e.target.className === "min") {
            setMinRange(newMinPrice);
            rangeInput[0].value = newMinPrice;
            range.style.left = (newMinPrice / rangeInput[0].max) * 100 + "%";
          } else {
            setMaxRange(newMaxPrice);
            rangeInput[1].value = newMaxPrice;
            range.style.right =
              100 - (newMaxPrice / rangeInput[1].max) * 100 + "%";
          }
        }
      });
    });
  };

 
  const handleOptionChange = (event) => {
    let sizes = [...selectedSizes];
    setSelectedSize(event.target.value);
    if (!sizes.includes(event.target.value)) {
      sizes.push(event.target.value);
    }
    setSelectedSizes(sizes);
    console.log(sizes);
  };

 
  const handleOptionChange2 = (event) => {
    let brands = [...selectedBrands];
    setSelectedBrand(event.target.value);
    if (!brands.includes(event.target.value)) {
      brands.push(event.target.value);
    }
    setSelectedBrands(brands);
    console.log(brands);
  };

  useEffect(() => {
    chatScreenRef.current.scrollTop = chatScreenRef.current.scrollHeight;
  }, [messages]);

  const api = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APIKEY}`,
    },
  });

  const [botMessages, setBotMessages] = useState([]);

  const fetchItems = async (payload) => {
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = "https://envy-api-8de862be6724.herokuapp.com/proxy";
  
    try {
      const response = await axios.post(apiUrl, payload);
  
      console.log(response.data);
  
      let result = [];
  
      response.data.map((dress) => {
        let obj = {
          id: dress.id,
          uri: dress.uri,
          title: dress.title,
          price: dress.price,
          brand: dress.brand.toUpperCase(),
          link: dress.link,
          size: dress.size,
          hovered: false,
        };
  
        result.push(obj);
      });
  
      console.log("printing result");
      console.log(result);
      setSearchResults(result);
  
      // Store search results in local storage
      localStorage.setItem("searchResults", JSON.stringify(result));
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() !== "") {
      const userMessage = "YOU: " + newMessage;
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      let content = newMessage;
      setNewMessage("");

      try {
        const corsProxy = "https://cors-anywhere.herokuapp.com/";
        axios
          .post("https://envy-api-8de862be6724.herokuapp.com/api", {
            input: content,
          })
          .then((response) => {
            console.log(response);

            const assistantResponse = "BOT: " + response.data.response;
            setMessages((prevMessages) => [...prevMessages, assistantResponse]);

            setBotMessages((prevMessages) => [
              ...prevMessages,
              response.data.keywords,
            ]);

            setKey(response.data.keywords);

            if(response.data.filters.price){
              let min= response.data.filters.price[0]
              let max = response.data.filters.price[1]

              let pricess = [];
    for (
      let price = parseFloat(min);
      price <= parseFloat(max);
      price += 1
    ) {
      pricess.push(price.toFixed(1));
    }

    console.log(pricess)
    response.data.filters.price = pricess
    setFiltered(JSON.stringify(response.data.filters))




           

            }
            else{

              setFiltered(JSON.stringify(response.data.filters))


            }

            console.log(response.data.filters)

            console.log(localStorage.getItem("keyword"));
            localStorage.setItem("keyword", response.data.keywords);
            console.log("Bot msgs", botMessages);
          })
          .catch((error) => {
            return;
          });

        //console.log("hi", extractedKeywords); // Do whatever you want with the keywords
      } catch (error) {
        // Handle error
      }
    }
  };

  const Change = (e) => {
    setNewMessage(e.target.value);
  };
  const handleMouseEnter = (index) => {
    setHoveredItem(index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

 
  const removeSize = (sizeToRemove) => {
    setSelectedSizes(selectedSizes.filter((size) => size !== sizeToRemove));
  };

  // New method to remove brand filter
  const removeBrand = (brandToRemove) => {
    setSelectedBrands(
      selectedBrands.filter((brand) => brand !== brandToRemove)
    );
  };

  const handleButtonClick = () => {
    console.log(selectedBrands);
    console.log(selectedSizes);
    console.log(minRange);
    console.log(maxRange);

    let prices = [];
    for (
      let price = parseFloat(minRange);
      price <= parseFloat(maxRange);
      price += 1
    ) {
      prices.push(price.toFixed(1));
    }

    let filter = {};

    if (selectedSizes.length > 0) {
      filter.available_sizes = selectedSizes;
    }

    if (selectedBrands.length > 0) {
      filter.brand = selectedBrands;
    }

    if (maxRange > 0 || minRange < 0) {
      filter.price = prices;
    }

    console.log(filter);

    fetchItems({
      text: key,
      filter: JSON.stringify(filter), // Converting to json
    });
  };

  

  const handleShowSuggestions = (event) => {
    event.preventDefault();
    console.log(key);

    fetchItems({
      text: key,
      top_a: 32,
      top_b: 256,
      filter: filtered,
    });

    setSearchTerm("");
  };

  return (
    <>
      <div className="screen-complete" style={{}}>
        <div className="frame-44">
          <div className="frame-43">
            <div className="frame-45">
              <p className="text-45"> ENVY.AI </p>
            </div>

            <div className="chat">
              <div className="chat-screen" ref={chatScreenRef}>
                {messages.map((message, index) => {
                  if (message.startsWith("YOU: ")) {
                    return (
                      <div key={index} className="chat-message user-message">
                        <div className="mess-user">{message.slice(5)}</div>
                      </div>
                    );
                  } else if (message.startsWith("BOT: ")) {
                    return (
                      <div key={index} className="chat-message bot-message">
                        <div className="mess-bot">{message.slice(5)}</div>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
              <div className="divider">
                <form onSubmit={handleMessageSubmit}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={Change}
                    className="chat-input"
                    placeholder="What do you want to shop for today?"
                  />
                  <div className="button" style={{}}>
                    <button type="submit" className="chat-send-button-white">
                      Chat
                    </button>
                    <button
                      onClick={handleShowSuggestions}
                      className="chat-send-button"
                    >
                      Search
                    </button>
                  </div>
                </form>{" "}
              </div>{" "}
            </div>

            <div>
              <div className="filter-box">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowResults(!showResults)}
                >
                  Filters
                </div>

                {showResults && (
                  <>
                    <div className="horizontal-list">
                      {selectedSizes.map((size, index) => (
                        <li className="list-item" key={"size" + index}>
                          {size}
                          <span
                            className="cross-button"
                            onClick={() => removeSize(size)}
                          >
                            x
                          </span>
                        </li>
                      ))}
                      {selectedBrands.map((brand, index) => (
                        <li className="list-item" key={"brand" + index}>
                          {brand}
                          <span
                            className="cross-button"
                            onClick={() => removeBrand(brand)}
                          >
                            x
                          </span>
                        </li>
                      ))}
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <label>Size:</label>

                        <select
                          style={{
                            borderRadius: "8px",
                            width: "250px",
                            height: "40px",
                            border: "1px solid var(--gray-300, #D0D5DD)",
                            background: "var(--base-white, #FFF)",
                            /* Shadow/xs */
                            boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                            padding: "10px",
                            marginLeft: "20px",
                          }}
                          value={selectedSize}
                          onChange={handleOptionChange}
                        >
                          <option value="AU 10">AU 10</option>
                          <option value="AU 12">AU 12</option>
                          <option value="AU 6">AU 6</option>
                          <option value="AU 8">AU 8</option>
                          <option value="EU 32">EU 32</option>
                          <option value="EU 35">EU 35</option>
                          <option value="EU 36">EU 36</option>
                          <option value="EU 37">EU 37</option>
                          <option value="EU 38">EU 38</option>
                          <option value="EU 39">EU 39</option>
                          <option value="EU 40">EU 40</option>
                          <option value="EU 41">EU 41</option>
                          <option value="EU 42">EU 42</option>
                          <option value="EU 44">EU 44</option>
                          <option value="EU 46">EU 46</option>
                          <option value="FR 34">FR 34</option>
                          <option value="FR 36">FR 36</option>
                          <option value="FR 37">FR 37</option>
                          <option value="FR 38">FR 38</option>
                          <option value="FR 39">FR 39</option>
                          <option value="FR 40">FR 40</option>
                          <option value="FR 41">FR 41</option>
                          <option value="FR 42">FR 42</option>
                          <option value="FR 44">FR 44</option>
                          <option value="FR 46">FR 46</option>
                          <option value="IT 34">IT 34</option>
                          <option value="IT 35">IT 35</option>
                          <option value="IT 35.5">IT 35.5</option>
                          <option value="IT 36">IT 36</option>
                          <option value="IT 36.5">IT 36.5</option>
                          <option value="IT 37">IT 37</option>
                          <option value="IT 37.5">IT 37.5</option>
                          <option value="IT 38">IT 38</option>
                          <option value="IT 38.5">IT 38.5</option>
                          <option value="IT 39">IT 39</option>
                          <option value="IT 39.5">IT 39.5</option>
                          <option value="IT 40">IT 40</option>
                          <option value="IT 41">IT 41</option>
                          <option value="IT 41.5">IT 41.5</option>
                          <option value="IT 42">IT 42</option>
                          <option value="IT 44">IT 44</option>
                          <option value="IT 46">IT 46</option>
                          <option value="IT 48">IT 48</option>
                          <option value="IT34.5">IT34.5</option>
                          <option value="L">L</option>
                          <option value="L/XL">L/XL</option>
                          <option value="M">M</option>
                          <option value="M/L">M/L</option>
                          <option value="ONE SIZE">ONE SIZE</option>
                          <option value="S">S</option>
                          <option value="S/M">S/M</option>
                          <option value="UK 10">UK 10</option>
                          <option value="UK 12">UK 12</option>
                          <option value="UK 14">UK 14</option>
                          <option value="UK 4">UK 4</option>
                          <option value="UK 5">UK 5</option>
                          <option value="UK 5.5">UK 5.5</option>
                          <option value="UK 6">UK 6</option>
                          <option value="UK 6.5">UK 6.5</option>
                          <option value="UK 7">UK 7</option>
                          <option value="UK 7.5">UK 7.5</option>
                          <option value="UK 8">UK 8</option>
                          <option value="US 0">US 0</option>
                          <option value="US 10">US 10</option>
                          <option value="US 10.5">US 10.5</option>
                          <option value="US 11">US 11</option>
                          <option value="US 12">US 12</option>
                          <option value="US 13">US 13</option>
                          <option value="US 14">US 14</option>
                          <option value="US 2">US 2</option>
                          <option value="US 4">US 4</option>
                          <option value="US 5">US 5</option>
                          <option value="US 6">US 6</option>
                          <option value="US 6.5">US 6.5</option>
                          <option value="US 7">US 7</option>
                          <option value="US 7.5">US 7.5</option>
                          <option value="US 8">US 8</option>
                          <option value="US 8.5">US 8.5</option>
                          <option value="US 9">US 9</option>
                          <option value="US 9.5">US 9.5</option>
                          <option value="XL">XL</option>
                          <option value="XS">XS</option>
                          <option value="XS/S">XS/S</option>
                          <option value="XXL">XXL</option>
                          <option value="XXS">XXS</option>
                          <option value="XXXS">XXXS</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "10px" }}>
                        <label>Brand:</label>

                        <select
                          style={{
                            borderRadius: "8px",
                            width: "250px",
                            height: "40px",
                            border: "1px solid var(--gray-300, #D0D5DD)",
                            background: "var(--base-white, #FFF)",
                            /* Shadow/xs */
                            boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                            padding: "10px",
                            marginLeft: "6px",
                          }}
                          value={selectedBrand}
                          onChange={handleOptionChange2}
                        >
                          <option value="1017">1017</option>
                          <option value="16Arlington">16Arlington</option>
                          <option value="360Cashmere">360Cashmere</option>
                          <option value="3JUIN">3JUIN</option>
                          <option value="7">7</option>
                          <option value="813">813</option>
                          <option value="A">A</option>
                          <option value="ALEXANDER WANG">ALEXANDER WANG</option>
                          <option value="AMIRI">AMIRI</option>
                          <option value="AREA">AREA</option>
                          <option value="Abysse">Abysse</option>
                          <option value="Ac9">Ac9</option>
                          <option value="Ack">Ack</option>
                          <option value="Acler">Acler</option>
                          <option value="Acne Studios">Acne Studios</option>
                          <option value="Adam Lippes">Adam Lippes</option>
                          <option value="Adidas">Adidas</option>
                          <option value="Adidas By Stella Mccartney">
                            Adidas By Stella Mccartney
                          </option>
                          <option value="Adidas Originals">
                            Adidas Originals
                          </option>
                          <option value="Adriana Degreas">
                            Adriana Degreas
                          </option>
                          <option value="Aeron">Aeron</option>
                          <option value="Aganovich">Aganovich</option>
                          <option value="Agent Provocateur">
                            Agent Provocateur
                          </option>
                          <option value="Agl">Agl</option>
                          <option value="Agnona">Agnona</option>
                          <option value="Agolde">Agolde</option>
                          <option value="Agr">Agr</option>
                          <option value="Agua">Agua</option>
                          <option value="Ahluwalia">Ahluwalia</option>
                          <option value="Aje">Aje</option>
                          <option value="Akoia Swim">Akoia Swim</option>
                          <option value="Akris Punto">Akris Punto</option>
                          <option value="Alabama Muse">Alabama Muse</option>
                          <option value="Alanui">Alanui</option>
                          <option value="Alberta Ferretti">
                            Alberta Ferretti
                          </option>
                          <option value="Alberto Biani">Alberto Biani</option>
                          <option value="Alchemy">Alchemy</option>
                          <option value="Aleksandre Akhalkatsishvili">
                            Aleksandre Akhalkatsishvili
                          </option>
                          <option value="Alemais">Alemais</option>
                          <option value="Alessandra Rich">
                            Alessandra Rich
                          </option>
                          <option value="Alessandro Enriquez">
                            Alessandro Enriquez
                          </option>
                          <option value="Alessandro Vigilante">
                            Alessandro Vigilante
                          </option>
                          <option value="Alex Perry">Alex Perry</option>
                          <option value="Alexander McQueen">
                            Alexander McQueen
                          </option>
                          <option value="Alexander Mcqueen">
                            Alexander Mcqueen
                          </option>
                          <option value="Alexander Wang">Alexander Wang</option>
                          <option value="Alexandra Miro">Alexandra Miro</option>
                          <option value="Alexandre Vauthier">
                            Alexandre Vauthier
                          </option>
                          <option value="Alexis">Alexis</option>
                          <option value="Alice Mccall">Alice Mccall</option>
                          <option value="Alighieri">Alighieri</option>
                          <option value="Alix Nyc">Alix Nyc</option>
                          <option value="Allude">Allude</option>
                          <option value="Almaz">Almaz</option>
                          <option value="Alo Yoga">Alo Yoga</option>
                          <option value="Alpha Industries">
                            Alpha Industries
                          </option>
                          <option value="Altra">Altra</option>
                          <option value="Altuzarra">Altuzarra</option>
                          <option value="Alysi">Alysi</option>
                          <option value="Ambra Maddalena">
                            Ambra Maddalena
                          </option>
                          <option value="Ambush">Ambush</option>
                          <option value="Amen">Amen</option>
                          <option value="Ami Amalia">Ami Amalia</option>
                          <option value="Ami Paris">Ami Paris</option>
                          <option value="Amina Muaddi">Amina Muaddi</option>
                          <option value="Amir Slama">Amir Slama</option>
                          <option value="Amiri">Amiri</option>
                          <option value="Amouage">Amouage</option>
                          <option value="Amy Crookes">Amy Crookes</option>
                          <option value="Anaak">Anaak</option>
                          <option value="Andersson Bell">Andersson Bell</option>
                          <option value="Andrea Bogosian">
                            Andrea Bogosian
                          </option>
                          <option value="Andrew Gn">Andrew Gn</option>
                          <option value="Anemos">Anemos</option>
                          <option value="Anine Bing">Anine Bing</option>
                          <option value="Anjuna">Anjuna</option>
                          <option value="Ann Demeulemeester">
                            Ann Demeulemeester
                          </option>
                          <option value="Anna Quan">Anna Quan</option>
                          <option value="Anna Sui">Anna Sui</option>
                          <option value="Anouki">Anouki</option>
                          <option value="Antonelli">Antonelli</option>
                          <option value="Antonino Valenti">
                            Antonino Valenti
                          </option>
                          <option value="Antonio Marras">Antonio Marras</option>
                          <option value="Apiece Apart">Apiece Apart</option>
                          <option value="Apparis">Apparis</option>
                          <option value="Arch4">Arch4</option>
                          <option value="Area">Area</option>
                          <option value="Arma">Arma</option>
                          <option value="Armani Exchange">
                            Armani Exchange
                          </option>
                          <option value="Art Dealer">Art Dealer</option>
                          <option value="Asceno">Asceno</option>
                          <option value="Ash">Ash</option>
                          <option value="Asics">Asics</option>
                          <option value="Aspesi">Aspesi</option>
                          <option value="Assouline">Assouline</option>
                          <option value="Atlein">Atlein</option>
                          <option value="Atu">Atu</option>
                          <option value="Aurelie Bidermann">
                            Aurelie Bidermann
                          </option>
                          <option value="Autry">Autry</option>
                          <option value="Avant Toi">Avant Toi</option>
                          <option value="Axel Arigato">Axel Arigato</option>
                          <option value="Aya Muse">Aya Muse</option>
                          <option value="Az Factory">Az Factory</option>
                          <option value="Aztech Mountain">
                            Aztech Mountain
                          </option>
                          <option value="Azzalia">Azzalia</option>
                          <option value="Bacon">Bacon</option>
                          <option value="Badgley Mischka">
                            Badgley Mischka
                          </option>
                          <option value="Baldinini">Baldinini</option>
                          <option value="Balenciaga">Balenciaga</option>
                          <option value="Balenciaga Eyewear">
                            Balenciaga Eyewear
                          </option>
                          <option value="Balenciaga Pre Owned">
                            Balenciaga Pre Owned
                          </option>
                          <option value="Bally">Bally</option>
                          <option value="Balmain">Balmain</option>
                          <option value="Balmain Eyewear">
                            Balmain Eyewear
                          </option>
                          <option value="Bambah">Bambah</option>
                          <option value="Bao">Bao</option>
                          <option value="Barbara Bologna">
                            Barbara Bologna
                          </option>
                          <option value="Barbara Bui">Barbara Bui</option>
                          <option value="Barbour">Barbour</option>
                          <option value="Barbour International">
                            Barbour International
                          </option>
                          <option value="Barena">Barena</option>
                          <option value="Barrie">Barrie</option>
                          <option value="Barrow">Barrow</option>
                          <option value="Baruni">Baruni</option>
                          <option value="Baserange">Baserange</option>
                          <option value="Batsheva">Batsheva</option>
                          <option value="Baum">Baum</option>
                          <option value="Bazza Alzouman">Bazza Alzouman</option>
                          <option value="Bcbg">Bcbg</option>
                          <option value="Belstaff">Belstaff</option>
                          <option value="Benedetta Bruzziches">
                            Benedetta Bruzziches
                          </option>
                          <option value="Benjamin Benmoyal">
                            Benjamin Benmoyal
                          </option>
                          <option value="Bernadette">Bernadette</option>
                          <option value="Bevza">Bevza</option>
                          <option value="Beyond Yoga">Beyond Yoga</option>
                          <option value="Bimba">Bimba</option>
                          <option value="Bite Studios">Bite Studios</option>
                          <option value="Black Coral">Black Coral</option>
                          <option value="Blanca Vita">Blanca Vita</option>
                          <option value="Blancha">Blancha</option>
                          <option value="Blauer">Blauer</option>
                          <option value="Blue">Blue</option>
                          <option value="Blugirl">Blugirl</option>
                          <option value="Blumarine">Blumarine</option>
                          <option value="Bogner">Bogner</option>
                          <option value="Bond Eye">Bond Eye</option>
                          <option value="Bondi Born">Bondi Born</option>
                          <option value="Bonpoint">Bonpoint</option>
                          <option value="Borgo">Borgo</option>
                          <option value="Boss">Boss</option>
                          <option value="Boteh">Boteh</option>
                          <option value="Bottega Veneta">Bottega Veneta</option>
                          <option value="Bottega Veneta Eyewear">
                            Bottega Veneta Eyewear
                          </option>
                          <option value="Botter">Botter</option>
                          <option value="Boutique Moschino">
                            Boutique Moschino
                          </option>
                          <option value="Boyarovskaya">Boyarovskaya</option>
                          <option value="Brand Black">Brand Black</option>
                          <option value="Brigitte">Brigitte</option>
                          <option value="Brunello Cucinelli">
                            Brunello Cucinelli
                          </option>
                          <option value="Burberry">Burberry</option>
                          <option value="Burberry Pre Owned">
                            Burberry Pre Owned
                          </option>
                          <option value="Buttero">Buttero</option>
                          <option value="By">By</option>
                          <option value="By Far">By Far</option>
                          <option value="Bytimo">Bytimo</option>
                          <option value="COMME DES GARÇONS X NIKE">
                            COMME DES GARÇONS X NIKE
                          </option>
                          <option value="COMME des GARÇONS PLAY x Converse">
                            COMME des GARÇONS PLAY x Converse
                          </option>
                          <option value="Cala">Cala</option>
                          <option value="Calvin Klein">Calvin Klein</option>
                          <option value="Camilla">Camilla</option>
                          <option value="Camper">Camper</option>
                          <option value="Camperlab">Camperlab</option>
                          <option value="Canada Goose">Canada Goose</option>
                          <option value="Canadian Club">Canadian Club</option>
                          <option value="Canessa">Canessa</option>
                          <option value="Cara Cara">Cara Cara</option>
                          <option value="Caravana">Caravana</option>
                          <option value="Carhartt Wip">Carhartt Wip</option>
                          <option value="Carine Gilson">Carine Gilson</option>
                          <option value="Cariuma">Cariuma</option>
                          <option value="Carolina Herrera">
                            Carolina Herrera
                          </option>
                          <option value="Caroline Constas">
                            Caroline Constas
                          </option>
                          <option value="Cartier Eyewear">
                            Cartier Eyewear
                          </option>
                          <option value="Casablanca">Casablanca</option>
                          <option value="Casadei">Casadei</option>
                          <option value="Cashmere">Cashmere</option>
                          <option value="Cecilia Prado">Cecilia Prado</option>
                          <option value="Cecilie Bahnsen">
                            Cecilie Bahnsen
                          </option>
                          <option value="Celia B">Celia B</option>
                          <option value="Cenere Gb">Cenere Gb</option>
                          <option value="Cesare">Cesare</option>
                          <option value="Chanel Pre Owned">
                            Chanel Pre Owned
                          </option>
                          <option value="Chantelle">Chantelle</option>
                          <option value="Charles">Charles</option>
                          <option value="Charlott">Charlott</option>
                          <option value="Charo">Charo</option>
                          <option value="Chen Peng">Chen Peng</option>
                          <option value="Chet Lo">Chet Lo</option>
                          <option value="Chiara">Chiara</option>
                          <option value="Chiara Ferragni">
                            Chiara Ferragni
                          </option>
                          <option value="Chinti">Chinti</option>
                          <option value="Chocoolate">Chocoolate</option>
                          <option value="Chopova Lowena">Chopova Lowena</option>
                          <option value="Christian Dior">Christian Dior</option>
                          <option value="Christian Wijnants">
                            Christian Wijnants
                          </option>
                          <option value="Christopher">Christopher</option>
                          <option value="Christopher Esber">
                            Christopher Esber
                          </option>
                          <option value="Christopher Kane">
                            Christopher Kane
                          </option>
                          <option value="Chufy">Chufy</option>
                          <option value="Cinq">Cinq</option>
                          <option value="Circolo 1901">Circolo 1901</option>
                          <option value="Citizens">Citizens</option>
                          <option value="Claudie Pierlot">
                            Claudie Pierlot
                          </option>
                          <option value="Claus Porto">Claus Porto</option>
                          <option value="Clive Christian">
                            Clive Christian
                          </option>
                          <option value="Closed">Closed</option>
                          <option value="Clube Bossa">Clube Bossa</option>
                          <option value="Coach">Coach</option>
                          <option value="Collina Strada">Collina Strada</option>
                          <option value="Colmar">Colmar</option>
                          <option value="Colville">Colville</option>
                          <option value="Comme Des Garçons">
                            Comme Des Garçons
                          </option>
                          <option value="Comme des Garçons Play">
                            Comme des Garçons Play
                          </option>
                          <option value="Commission">Commission</option>
                          <option value="Common Projects">
                            Common Projects
                          </option>
                          <option value="Concepto">Concepto</option>
                          <option value="Conner Ives">Conner Ives</option>
                          <option value="Converse">Converse</option>
                          <option value="Coperni">Coperni</option>
                          <option value="Cordova">Cordova</option>
                          <option value="Cormio">Cormio</option>
                          <option value="Costarellos">Costarellos</option>
                          <option value="Costume">Costume</option>
                          <option value="Cotton Citizen">Cotton Citizen</option>
                          <option value="Creed">Creed</option>
                          <option value="Cult Gaia">Cult Gaia</option>
                          <option value="Curionoir">Curionoir</option>
                          <option value="Cynthia Rowley">Cynthia Rowley</option>
                          <option value="Daily Paper">Daily Paper</option>
                          <option value="Dancassab">Dancassab</option>
                          <option value="Danielle Guizio">
                            Danielle Guizio
                          </option>
                          <option value="Darkpark">Darkpark</option>
                          <option value="David Koma">David Koma</option>
                          <option value="David Yurman">David Yurman</option>
                          <option value="De">De</option>
                          <option value="Dee Ocleppo">Dee Ocleppo</option>
                          <option value="Deiji Studios">Deiji Studios</option>
                          <option value="Del Core">Del Core</option>
                          <option value="Delada">Delada</option>
                          <option value="Des Phemmes">Des Phemmes</option>
                          <option value="Desa 1972">Desa 1972</option>
                          <option value="Deus">Deus</option>
                          <option value="Deveaux">Deveaux</option>
                          <option value="Devotion">Devotion</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Dina Melwani">Dina Melwani</option>
                          <option value="Dinny Hall">Dinny Hall</option>
                          <option value="Dion Lee">Dion Lee</option>
                          <option value="Discord">Discord</option>
                          <option value="District Vision">
                            District Vision
                          </option>
                          <option value="Dkny">Dkny</option>
                          <option value="Dodo">Dodo</option>
                          <option value="Dondup">Dondup</option>
                          <option value="Dorothee Schumacher">
                            Dorothee Schumacher
                          </option>
                          <option value="Dries">Dries</option>
                          <option value="Drome">Drome</option>
                          <option value="Dsquared2">Dsquared2</option>
                          <option value="Dundas">Dundas</option>
                          <option value="Durazzi Milano">Durazzi Milano</option>
                          <option value="Dusan">Dusan</option>
                          <option value="Dusen Dusen">Dusen Dusen</option>
                          <option value="Duskii">Duskii</option>
                          <option value="Duvetica">Duvetica</option>
                          <option value="Ea7">Ea7</option>
                          <option value="Each">Each</option>
                          <option value="Eckhaus Latta">Eckhaus Latta</option>
                          <option value="Edward">Edward</option>
                          <option value="Eileen Fisher">Eileen Fisher</option>
                          <option value="Eleventy">Eleventy</option>
                          <option value="Elie Saab">Elie Saab</option>
                          <option value="Elisabetta Franchi">
                            Elisabetta Franchi
                          </option>
                          <option value="Elleme">Elleme</option>
                          <option value="Emilia Wickstead">
                            Emilia Wickstead
                          </option>
                          <option value="Emporio Armani">Emporio Armani</option>
                          <option value="Emporio Sirenuse">
                            Emporio Sirenuse
                          </option>
                          <option value="Enterprise Japan">
                            Enterprise Japan
                          </option>
                          <option value="Ephemera">Ephemera</option>
                          <option value="Equipment">Equipment</option>
                          <option value="Erdem">Erdem</option>
                          <option value="Eres">Eres</option>
                          <option value="Erika Cavallini">
                            Erika Cavallini
                          </option>
                          <option value="Erl">Erl</option>
                          <option value="Ermanno Firenze">
                            Ermanno Firenze
                          </option>
                          <option value="Ermanno Scervino">
                            Ermanno Scervino
                          </option>
                          <option value="Escvdo">Escvdo</option>
                          <option value="Essentiel Antwerp">
                            Essentiel Antwerp
                          </option>
                          <option value="Esteban Cortazar">
                            Esteban Cortazar
                          </option>
                          <option value="Etro">Etro</option>
                          <option value="Evarae">Evarae</option>
                          <option value="Evi Grintela">Evi Grintela</option>
                          <option value="Extreme Cashmere">
                            Extreme Cashmere
                          </option>
                          <option value="Fabiana Filippi">
                            Fabiana Filippi
                          </option>
                          <option value="Faith Connexion">
                            Faith Connexion
                          </option>
                          <option value="Faithfull">Faithfull</option>
                          <option value="Faliero Sarti">Faliero Sarti</option>
                          <option value="Farm Rio">Farm Rio</option>
                          <option value="Fay">Fay</option>
                          <option value="Fear">Fear</option>
                          <option value="Fear of God">Fear of God</option>
                          <option value="Federica Tosi">Federica Tosi</option>
                          <option value="Fely Campo">Fely Campo</option>
                          <option value="Fendi Pre Owned">
                            Fendi Pre Owned
                          </option>
                          <option value="Feng">Feng</option>
                          <option value="Feng Chen Wang">Feng Chen Wang</option>
                          <option value="Ferragamo">Ferragamo</option>
                          <option value="Ferrari">Ferrari</option>
                          <option value="Fila">Fila</option>
                          <option value="Filippa K">Filippa K</option>
                          <option value="Fiorucci">Fiorucci</option>
                          <option value="Fisico">Fisico</option>
                          <option value="Fleur">Fleur</option>
                          <option value="Folies">Folies</option>
                          <option value="For">For</option>
                          <option value="Form">Form</option>
                          <option value="Forte Forte">Forte Forte</option>
                          <option value="Fortela">Fortela</option>
                          <option value="Frame">Frame</option>
                          <option value="Framed">Framed</option>
                          <option value="Frankies Bikinis">
                            Frankies Bikinis
                          </option>
                          <option value="Fratelli Rossetti">
                            Fratelli Rossetti
                          </option>
                          <option value="Furla">Furla</option>
                          <option value="Fusalp">Fusalp</option>
                          <option value="GmbH">GmbH</option>
                          <option value="GRLFRND">GRLFRND</option>
                          <option value="Gabriela">Gabriela</option>
                          <option value="Gaiam">Gaiam</option>
                          <option value="Galvan">Galvan</option>
                          <option value="Ganni">Ganni</option>
                          <option value="Gareth Pugh">Gareth Pugh</option>
                          <option value="Garrett">Garrett</option>
                          <option value="Garrett Leight">Garrett Leight</option>
                          <option value="Gcds">Gcds</option>
                          <option value="Georges Hobeika">
                            Georges Hobeika
                          </option>
                          <option value="Geox">Geox</option>
                          <option value="Giada Benincasa">
                            Giada Benincasa
                          </option>
                          <option value="Giada Forte">Giada Forte</option>
                          <option value="Giaquinto">Giaquinto</option>
                          <option value="Giorgio Armani">Giorgio Armani</option>
                          <option value="Giorgio Brato">Giorgio Brato</option>
                          <option value="Giuseppe Zanotti">
                            Giuseppe Zanotti
                          </option>
                          <option value="Givenchy">Givenchy</option>
                          <option value="Givenchy Pre Owned">
                            Givenchy Pre Owned
                          </option>
                          <option value="Go">Go</option>
                          <option value="Goat">Goat</option>
                          <option value="God Save Queens">
                            God Save Queens
                          </option>
                          <option value="Golden">Golden</option>
                          <option value="Golden Goose">Golden Goose</option>
                          <option value="Gothic">Gothic</option>
                          <option value="Gozzip">Gozzip</option>
                          <option value="Grace">Grace</option>
                          <option value="Grazia">Grazia</option>
                          <option value="Grenson">Grenson</option>
                          <option value="Grlfrnd">Grlfrnd</option>
                          <option value="Gucci Pre Owned">
                            Gucci Pre Owned
                          </option>
                          <option value="Gucci Sunglasses">
                            Gucci Sunglasses
                          </option>
                          <option value="Gucci Watches">Gucci Watches</option>
                          <option value="Guelma">Guelma</option>
                          <option value="Guidi">Guidi</option>
                          <option value="Guild Prime">Guild Prime</option>
                          <option value="Gustavo Lins">Gustavo Lins</option>
                          <option value="Haider">Haider</option>
                          <option value="Haider Ackermann">
                            Haider Ackermann
                          </option>
                          <option value="Halpern">Halpern</option>
                          <option value="Hampden">Hampden</option>
                          <option value="Han">Han</option>
                          <option value="Hannes Roether">Hannes Roether</option>
                          <option value="Hannoh Wessel">Hannoh Wessel</option>
                          <option value="Hanro">Hanro</option>
                          <option value="Harris Wharf">Harris Wharf</option>
                          <option value="Harrys">Harrys</option>
                          <option value="Harvey Faircloth">
                            Harvey Faircloth
                          </option>
                          <option value="Hatton Labs">Hatton Labs</option>
                          <option value="Helena Rohner">Helena Rohner</option>
                          <option value="Hellessy">Hellessy</option>
                          <option value="Helmstedt">Helmstedt</option>
                          <option value="Helmut Lang">Helmut Lang</option>
                          <option value="Hemant And Nandita">
                            Hemant And Nandita
                          </option>
                          <option value="Henrik Vibskov">Henrik Vibskov</option>
                          <option value="Herno">Herno</option>
                          <option value="Heron">Heron</option>
                          <option value="Heron Preston">Heron Preston</option>
                          <option value="Heschung">Heschung</option>
                          <option value="Hey">Hey</option>
                          <option value="Hi">Hi</option>
                          <option value="Hillier Bartley">
                            Hillier Bartley
                          </option>
                          <option value="Hogan">Hogan</option>
                          <option value="Holiday">Holiday</option>
                          <option value="Holzweiler">Holzweiler</option>
                          <option value="Homme">Homme</option>
                          <option value="Hope">Hope</option>
                          <option value="Huishan Zhang">Huishan Zhang</option>
                          <option value="Hunting">Hunting</option>
                          <option value="Hyke">Hyke</option>
                          <option value="Hype">Hype</option>
                          <option value="Iceberg">Iceberg</option>
                          <option value="Icona">Icona</option>
                          <option value="Ienki Ienki">Ienki Ienki</option>
                          <option value="Il Bisonte">Il Bisonte</option>
                          <option value="Il Gufo">Il Gufo</option>
                          <option value="Illesteva">Illesteva</option>
                          <option value="Imoga">Imoga</option>
                          <option value="Imonni">Imonni</option>
                          <option value="In Your Arms">In Your Arms</option>
                          <option value="Incotex">Incotex</option>
                          <option value="Indira">Indira</option>
                          <option value="Indress">Indress</option>
                          <option value="Innika">Innika</option>
                          <option value="Innis">Innis</option>
                          <option value="Intimissimi">Intimissimi</option>
                          <option value="Inuikii">Inuikii</option>
                          <option value="Inverni">Inverni</option>
                          <option value="Iro">Iro</option>
                          <option value="Isa Boulder">Isa Boulder</option>
                          <option value="Isabel Benenato">
                            Isabel Benenato
                          </option>
                          <option value="Isabel Marant">Isabel Marant</option>
                          <option value="Isabel Marant Etoile">
                            Isabel Marant Etoile
                          </option>
                          <option value="Isabel Marant Étoile">
                            Isabel Marant Étoile
                          </option>
                          <option value="Isabel Sanchis">Isabel Sanchis</option>
                          <option value="Isaia">Isaia</option>
                          <option value="Issey">Issey</option>
                          <option value="Iuter">Iuter</option>
                          <option value="Izabel">Izabel</option>
                          <option value="J Brand">J Brand</option>
                          <option value="J Lindeberg">J Lindeberg</option>
                          <option value="J.">J.</option>
                          <option value="J.O.A.">J.O.A.</option>
                          <option value="JW Anderson">JW Anderson</option>
                          <option value="Jacquemus">Jacquemus</option>
                          <option value="Jacquie Aiche">Jacquie Aiche</option>
                          <option value="Jaded London">Jaded London</option>
                          <option value="Jaggar">Jaggar</option>
                          <option value="Jakke">Jakke</option>
                          <option value="James">James</option>
                          <option value="James Perse">James Perse</option>
                          <option value="Jamie Wei Huang">
                            Jamie Wei Huang
                          </option>
                          <option value="Janavi">Janavi</option>
                          <option value="Jane Post">Jane Post</option>
                          <option value="Jason Wu">Jason Wu</option>
                          <option value="Jean">Jean</option>
                          <option value="Jean Atelier">Jean Atelier</option>
                          <option value="Jean Louis Scherrer Pre Owned">
                            Jean Louis Scherrer Pre Owned
                          </option>
                          <option value="Jean Michel Cazabat">
                            Jean Michel Cazabat
                          </option>
                          <option value="Jean Paul Gaultier Pre Owned">
                            Jean Paul Gaultier Pre Owned
                          </option>
                          <option value="Jean Paul Gaultier Vintage">
                            Jean Paul Gaultier Vintage
                          </option>
                          <option value="Jeannot">Jeannot</option>
                          <option value="Jejia">Jejia</option>
                          <option value="Jennifer">Jennifer</option>
                          <option value="Jennifer Chamandi">
                            Jennifer Chamandi
                          </option>
                          <option value="Jennifer Zeuner Jewelry">
                            Jennifer Zeuner Jewelry
                          </option>
                          <option value="Jenny">Jenny</option>
                          <option value="Jenny Packham">Jenny Packham</option>
                          <option value="Jil Sander">Jil Sander</option>
                          <option value="Jil Sander Navy">
                            Jil Sander Navy
                          </option>
                          <option value="Jim Rickey">Jim Rickey</option>
                          <option value="Jimmy">Jimmy</option>
                          <option value="Jimmy Choo Pre Owned">
                            Jimmy Choo Pre Owned
                          </option>
                          <option value="Jimmy Choo Sunglasses">
                            Jimmy Choo Sunglasses
                          </option>
                          <option value="Jimmy Choo X Timberland">
                            Jimmy Choo X Timberland
                          </option>
                          <option value="Jo No Fui">Jo No Fui</option>
                          <option value="Joie">Joie</option>
                          <option value="Jonathan Simkhai">
                            Jonathan Simkhai
                          </option>
                          <option value="Jones New York">Jones New York</option>
                          <option value="Jordan">Jordan</option>
                          <option value="Josef Seibel">Josef Seibel</option>
                          <option value="Joseph">Joseph</option>
                          <option value="Joshua">Joshua</option>
                          <option value="Joshua Sanders">Joshua Sanders</option>
                          <option value="Jourden">Jourden</option>
                          <option value="Jovonna">Jovonna</option>
                          <option value="Joy">Joy</option>
                          <option value="Judith Leiber">Judith Leiber</option>
                          <option value="Jujumade">Jujumade</option>
                          <option value="Julianna Bass">Julianna Bass</option>
                          <option value="Junarose">Junarose</option>
                          <option value="Junya Watanabe">Junya Watanabe</option>
                          <option value="Jupe">Jupe</option>
                          <option value="Just">Just</option>
                          <option value="Just Cavalli">Just Cavalli</option>
                          <option value="Just Don">Just Don</option>
                          <option value="Juun">Juun</option>
                          <option value="Jw">Jw</option>
                          <option value="Jw Anderson">Jw Anderson</option>
                          <option value="KALDA">KALDA</option>
                          <option value="Kacey">Kacey</option>
                          <option value="Kahindo">Kahindo</option>
                          <option value="Kalda">Kalda</option>
                          <option value="Kali">Kali</option>
                          <option value="Kamushki">Kamushki</option>
                          <option value="Kaos">Kaos</option>
                          <option value="Karen Walker">Karen Walker</option>
                          <option value="Karl">Karl</option>
                          <option value="Karl Lagerfeld">Karl Lagerfeld</option>
                          <option value="Karla">Karla</option>
                          <option value="Kassl Editions">Kassl Editions</option>
                          <option value="Katerina Makriyianni">
                            Katerina Makriyianni
                          </option>
                          <option value="Katharine Hamnett London">
                            Katharine Hamnett London
                          </option>
                          <option value="Katie Eary">Katie Eary</option>
                          <option value="Katya Dobryakova">
                            Katya Dobryakova
                          </option>
                          <option value="Kavala">Kavala</option>
                          <option value="Kaviar Gauche">Kaviar Gauche</option>
                          <option value="Keepsake">Keepsake</option>
                          <option value="Keith">Keith</option>
                          <option value="Kendall">Kendall</option>
                          <option value="Kenneth Jay Lane">
                            Kenneth Jay Lane
                          </option>
                          <option value="Kenzo">Kenzo</option>
                          <option value="Kenzo Kids">Kenzo Kids</option>
                          <option value="Khaite">Khaite</option>
                          <option value="Ki6">Ki6</option>
                          <option value="Kiko">Kiko</option>
                          <option value="Kim">Kim</option>
                          <option value="Kimberly Mcdonald">
                            Kimberly Mcdonald
                          </option>
                          <option value="Kimhekim">Kimhekim</option>
                          <option value="Kingdom">Kingdom</option>
                          <option value="Kingsley">Kingsley</option>
                          <option value="Kisskill">Kisskill</option>
                          <option value="Klokers">Klokers</option>
                          <option value="Knw">Knw</option>
                          <option value="Koche">Koche</option>
                          <option value="Koio">Koio</option>
                          <option value="Kolor">Kolor</option>
                          <option value="Komono">Komono</option>
                          <option value="Korea">Korea</option>
                          <option value="Kotur">Kotur</option>
                          <option value="Ksubi">Ksubi</option>
                          <option value="Kuboraum">Kuboraum</option>
                          <option value="Kwaidan">Kwaidan</option>
                          <option value="Kwaidan Editions">
                            Kwaidan Editions
                          </option>
                          <option value="L'Academie">L'Academie</option>
                          <option value="L'Agence">L'Agence</option>
                          <option value="L'Autre">L'Autre</option>
                          <option value="L'Aventure">L'Aventure</option>
                          <option value="L'Impermeabile">L'Impermeabile</option>
                          <option value="L'Intervalle">L'Intervalle</option>
                          <option value="L'Objet">L'Objet</option>
                          <option value="L'Orla">L'Orla</option>
                          <option value="L'ov>Me">L'ovMe</option>
                          <option value="L.">L.</option>
                          <option value="L.K.">L.K.</option>
                          <option value="LA">LA</option>
                          <option value="LA Bruket">LA Bruket</option>
                          <option value="LAutre">LAutre</option>
                          <option value="LAAIN">LAAIN</option>
                          <option value="LARDINI">LARDINI</option>
                          <option value="LELET NY">LELET NY</option>
                          <option value="LF">LF</option>
                          <option value="LNDR">LNDR</option>
                          <option value="LOU">LOU</option>
                          <option value="LSpace">LSpace</option>
                          <option value="La">La</option>
                          <option value="La Doublej">La Doublej</option>
                          <option value="La Fille Do">La Fille Do</option>
                          <option value="La Ligne">La Ligne</option>
                          <option value="La Perla">La Perla</option>
                          <option value="La Reveche">La Reveche</option>
                          <option value="La Seine">La Seine</option>
                          <option value="La Veste">La Veste</option>
                          <option value="Laain">Laain</option>
                          <option value="Lab">Lab</option>
                          <option value="Labo">Labo</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Lacoste">Lacoste</option>
                          <option value="Lacoste Sunglasses">
                            Lacoste Sunglasses
                          </option>
                          <option value="Lacoste Watches">
                            Lacoste Watches
                          </option>
                          <option value="Lafayette">Lafayette</option>
                          <option value="Lal">Lal</option>
                          <option value="Lalique">Lalique</option>
                          <option value="Lala">Lala</option>
                          <option value="Lala Berlin">Lala Berlin</option>
                          <option value="Lanvin">Lanvin</option>
                          <option value="Lara">Lara</option>
                          <option value="Lardini">Lardini</option>
                          <option value="Larry">Larry</option>
                          <option value="Las Bayadas">Las Bayadas</option>
                          <option value="Latelita">Latelita</option>
                          <option value="Laura Biagiotti">
                            Laura Biagiotti
                          </option>
                          <option value="Laura Lombardi">Laura Lombardi</option>
                          <option value="Laura Urbinati">Laura Urbinati</option>
                          <option value="Lauren">Lauren</option>
                          <option value="Lauren Klassen">Lauren Klassen</option>
                          <option value="Laurence Dacade">
                            Laurence Dacade
                          </option>
                          <option value="Laurence Tavernier">
                            Laurence Tavernier
                          </option>
                          <option value="Laviniaturra">Laviniaturra</option>
                          <option value="Layeur">Layeur</option>
                          <option value="Le">Le</option>
                          <option value="Le Kasha">Le Kasha</option>                         
                          <option value="Le Monde Beryl">Le Monde Beryl</option>
                          <option value="Le Ninè">Le Ninè</option>
                          <option value="Le Petit Trou">Le Petit Trou</option>
                          <option value="Le Sirenuse">Le Sirenuse</option>
                          <option value="Le Sirenuse Positano">
                            Le Sirenuse Positano
                          </option>
                          <option value="Le Sirenuse x Nikes">
                            Le Sirenuse x Nikes
                          </option>
                          <option value="Le Specs">Le Specs</option>
                          <option value="Le Superbe">Le Superbe</option>
                          <option value="Lea">Lea</option>
                          <option value="Leal">Leal</option>
                          <option value="Leather">Leather</option>
                          <option value="Leather Crown">Leather Crown</option>
                          <option value="Leather And Pearl">
                            Leather And Pearl
                          </option>
                          <option value="Leather Crown">Leather Crown</option>
                          <option value="Lee">Lee</option>
                          <option value="Leigh Miller">Leigh Miller</option>
                          <option value="Leisure">Leisure</option>
                          <option value="Leith">Leith</option>
                          <option value="Lemaire">Lemaire</option>
                          <option value="Lenora Dame">Lenora Dame</option>
                          <option value="Leopard">Leopard</option>
                          <option value="Les">Les</option>
                          <option value="Les Animaux">Les Animaux</option>
                          <option value="Les Chaussons De La Belle">
                            Les Chaussons De La Belle
                          </option>
                          <option value="Les Coyotes De Paris">
                            Les Coyotes De Paris
                          </option>
                          <option value="Les Girls Les Boys">
                            Les Girls Les Boys
                          </option>
                          <option value="Les Hommes">Les Hommes</option>
                          <option value="Les Reveries">Les Reveries</option>
                          <option value="Lesca">Lesca</option>
                          <option value="Lesca Lunetier">Lesca Lunetier</option>
                          <option value="Lespecs">Lespecs</option>
                          <option value="Lesyanebo">Lesyanebo</option>
                          <option value="Letasca">Letasca</option>
                          <option value="Levi's">Levi's</option>
                          <option value="Levi's Vintage Clothing">
                            Levi's Vintage Clothing
                          </option>
                          <option value="Levi's x Off-White">
                            Levi's x Off-White
                          </option>
                          <option value="Levis">Levis</option>
                          <option value="Levon">Levon</option>
                          <option value="Levius">Levius</option>
                          <option value="Levis Made And Crafted">
                            Levis Made And Crafted
                          </option>
                          <option value="Lhd">Lhd</option>
                          <option value="Liars">Liars</option>
                          <option value="Liebermann">Liebermann</option>
                          <option value="Liebeskind">Liebeskind</option>
                          <option value="Life">Life</option>
                          <option value="Life On">Life On</option>
                          <option value="Lifestride">Lifestride</option>
                          <option value="Lili">Lili</option>
                          <option value="Lili Radu">Lili Radu</option>
                          <option value="Lilies">Lilies</option>
                          <option value="Lillian">Lillian</option>
                          <option value="Lily">Lily</option>
                          <option value="Lily And Lionel">
                            Lily And Lionel
                          </option>
                          <option value="Linda">Linda</option>
                          <option value="Linda Farrow">Linda Farrow</option>
                          <option value="Linda Farrow Gallery">
                            Linda Farrow Gallery
                          </option>
                          <option value="Lioness">Lioness</option>
                          <option value="Lionette">Lionette</option>
                          <option value="Lisa">Lisa</option>
                          <option value="Lisa Marie Fernandez">
                            Lisa Marie Fernandez
                          </option>
                          <option value="Lisou">Lisou</option>
                          <option value="Little">Little</option>
                          <option value="Little Liffner">Little Liffner</option>
                          <option value="Little Marc Jacobs">
                            Little Marc Jacobs
                          </option>
                          <option value="Little Remix">Little Remix</option>
                          <option value="Little Studio">Little Studio</option>
                          <option value="Liu">Liu</option>
                          <option value="Live">Live</option>
                          <option value="Liviana">Liviana</option>
                          <option value="Liviana Conti">Liviana Conti</option>
                          <option value="Livio">Livio</option>
                          <option value="Lizzie Fortunato">
                            Lizzie Fortunato
                          </option>
                          <option value="Lkbennett">Lkbennett</option>
                          <option value="Lloyd">Lloyd</option>
                          <option value="Ln">Ln</option>
                          <option value="Lo">Lo</option>
                          <option value="Loake">Loake</option>
                          <option value="Loewe">Loewe</option>
                          <option value="Lofina">Lofina</option>
                          <option value="Lola">Lola</option>
                          <option value="Lola Cruz">Lola Cruz</option>
                          <option value="Lolitta">Lolitta</option>
                          <option value="Lollys Laundry">Lollys Laundry</option>
                          <option value="Lomonosov">Lomonosov</option>
                          <option value="Lond>Me">Lond Me</option>
                          <option value="London">London</option>
                          <option value="London Fog">London Fog</option>
                          <option value="London Rebel">London Rebel</option>
                          <option value="Longchamp">Longchamp</option>
                          <option value="Longjourney">Longjourney</option>
                          <option value="Loose">Loose</option>
                          <option value="Lora">Lora</option>
                          <option value="Loriblu">Loriblu</option>
                          <option value="Lorna Murray">Lorna Murray</option>
                          <option value="Loro">Loro</option>
                          <option value="Loro Piana">Loro Piana</option>
                          <option value="Lost">Lost</option>
                          <option value="Lost & Found Rooms">
                            Lost & Found Rooms
                          </option>
                          <option value="Lost & Found Ria Dunn">
                            Lost & Found Ria Dunn
                          </option>
                          <option value="Lost Property Of London">
                            Lost Property Of London
                          </option>
                          <option value="Lost Found">Lost Found</option>
                          <option value="Lost Ink">Lost Ink</option>
                          <option value="Lotus">Lotus</option>
                          <option value="Lou">Lou</option>
                          <option value="Louche">Louche</option>
                          <option value="Loudmouth Golf">Loudmouth Golf</option>
                          <option value="Louis">Louis</option>
                          <option value="Louis Feraud Pre Owned">
                            Louis Feraud Pre Owned
                          </option>
                          <option value="Louis Leeman">Louis Leeman</option>
                          <option value="Louis Vuitton Pre Owned">
                            Louis Vuitton Pre Owned
                          </option>
                          <option value="Louis Vuitton Sunglasses">
                            Louis Vuitton Sunglasses
                          </option>
                          <option value="Louis Vuitton Vintage">
                            Louis Vuitton Vintage
                          </option>
                          <option value="Louis Vuitton X Supreme">
                            Louis Vuitton X Supreme
                          </option>
                          <option value="Louisa">Louisa</option>
                          <option value="Louise">Louise</option>
                          <option value="Louise Et Cie">Louise Et Cie</option>
                          <option value="Love">Love</option>
                          <option value="Love Moschino">Love Moschino</option>
                          <option value="Love Shack Fancy">
                            Love Shack Fancy
                          </option>
                          <option value="Love Stories">Love Stories</option>
                          <option value="Love x Mimi">Love x Mimi</option>
                          <option value="Love, Bonito">Love, Bonito</option>
                          <option value="Lovechild 1979">Lovechild 1979</option>
                          <option value="Lovely">Lovely</option>
                          <option value="Lovers">Lovers</option>
                          <option value="Lovers + Friends">
                            Lovers + Friends
                          </option>
                          <option value="Lovers + Friends x REVOLVE">
                            Lovers + Friends x REVOLVE
                          </option>
                          <option value="Lovers Friends">Lovers Friends</option>
                          <option value="Low">Low</option>
                          <option value="Loxley">Loxley</option>
                          <option value="Lozza">Lozza</option>
                          <option value="Lucas">Lucas</option>
                          <option value="Lucia">Lucia</option>
                          <option value="Luciano">Luciano</option>
                          <option value="Luciano Barachini">
                            Luciano Barachini
                          </option>
                          <option value="Lucien">Lucien</option>
                          <option value="Lucien Pellat Finet">
                            Lucien Pellat Finet
                          </option>
                          <option value="Lucille">Lucille</option>
                          <option value="Lucio">Lucio</option>
                          <option value="Lucluc">Lucluc</option>
                          <option value="Luigi">Luigi</option>
                          <option value="Luigi Borrelli">Luigi Borrelli</option>
                          <option value="Luisa">Luisa</option>
                          <option value="Luisa Beccaria">Luisa Beccaria</option>
                          <option value="Luisa Cerano">Luisa Cerano</option>
                          <option value="Luke">Luke</option>
                          <option value="Lulu">Lulu</option>
                          <option value="Lulu Guinness">Lulu Guinness</option>
                          <option value="Lulus">Lulus</option>
                          <option value="Lumene">Lumene</option>
                          <option value="Luminox">Luminox</option>
                          <option value="Luna">Luna</option>
                          <option value="Lunatic">Lunatic</option>
                          <option value="Lunettos">Lunettos</option>
                          <option value="Lustro">Lustro</option>
                          <option value="Lux">Lux</option>
                          <option value="Luxenter">Luxenter</option>
                          <option value="Lygia & Nanny">Lygia & Nanny</option>
                          <option value="Lyle">Lyle</option>
                          <option value="Lyle & Scott">Lyle & Scott</option>
                          <option value="Lyly">Lyly</option>
                          <option value="Lysse">Lysse</option>
                          <option value="Lytess">Lytess</option>
                          <option value="M Missoni">M Missoni</option>
                          <option value="M.">M.</option>
                          <option value="M. Cohen">M. Cohen</option>
                          <option value="M. Grifoni Denim">
                            M. Grifoni Denim
                          </option>
                          <option value="M. I. H. Jeans">M. I. H. Jeans</option>
                          <option value="M2">M2</option>
                          <option value="M2malletier">M2malletier</option>
                          <option value="Maa">Maa</option>
                          <option value="Maanesten">Maanesten</option>
                          <option value="Mabu">Mabu</option>
                          <option value="Mabu By Maria Bk">
                            Mabu By Maria Bk
                          </option>
                          <option value="Mackintosh">Mackintosh</option>
                          <option value="Macmillan">Macmillan</option>
                          <option value="Made">Made</option>
                          <option value="Made In">Made In</option>
                          <option value="Madewell">Madewell</option>
                          <option value="Madison">Madison</option>
                          <option value="Madison The Label">
                            Madison The Label
                          </option>
                          <option value="Mads">Mads</option>
                          <option value="Maeve">Maeve</option>
                          <option value="Magda Butrym">Magda Butrym</option>
                          <option value="Maggie">Maggie</option>
                          <option value="Maggie Marilyn">Maggie Marilyn</option>
                          <option value="Magic">Magic</option>
                          <option value="Magnanni">Magnanni</option>
                          <option value="Magnolia">Magnolia</option>
                          <option value="Maharishi">Maharishi</option>
                          <option value="Maison">Maison</option>
                          <option value="Maison Cléo">Maison Cléo</option>
                          <option value="Maison Close">Maison Close</option>
                          <option value="Maison Ernest">Maison Ernest</option>
                          <option value="Maison Flaneur">Maison Flaneur</option>
                          <option value="Maison Kitsune">Maison Kitsune</option>
                          <option value="Maison Labiche">Maison Labiche</option>
                          <option value="Maison Lejaby">Maison Lejaby</option>
                          <option value="Maison Margiela">
                            Maison Margiela
                          </option>
                          <option value="Maison Margiela Pre Owned">
                            Maison Margiela Pre Owned
                          </option>
                          <option value="Maison Michel">Maison Michel</option>
                          <option value="Maison Michel Pre Owned">
                            Maison Michel Pre Owned
                          </option>
                          <option value="Maison Michel Vintage">
                            Maison Michel Vintage
                          </option>
                          <option value="Maison Mihara Yasuhiro">
                            Maison Mihara Yasuhiro
                          </option>
                          <option value="Maison Rabih Kayrouz">
                            Maison Rabih Kayrouz
                          </option>
                          <option value="Maison Scotch">Maison Scotch</option>
                          <option value="Maison Ullens">Maison Ullens</option>
                          <option value="Maisonette">Maisonette</option>
                          <option value="Majestic">Majestic</option>
                          <option value="Majorelle">Majorelle</option>
                          <option value="Maje">Maje</option>
                          <option value="Majestic Filatures">
                            Majestic Filatures
                          </option>
                          <option value="Makara">Makara</option>
                          <option value="Make">Make</option>
                          <option value="Make Your">Make Your</option>
                          <option value="Makr">Makr</option>
                          <option value="Malene Birger">Malene Birger</option>
                          <option value="Malgosia">Malgosia</option>
                          <option value="Maliparmi">Maliparmi</option>
                          <option value="Malone">Malone</option>
                          <option value="Malone Souliers">
                            Malone Souliers
                          </option>
                          <option value="Malone Souliers By Roy Luwolt">
                            Malone Souliers By Roy Luwolt
                          </option>
                          <option value="Malìparmi">Malìparmi</option>
                          <option value="Mammut">Mammut</option>
                          <option value="Manas">Manas</option>
                          <option value="Mancera">Mancera</option>
                          <option value="Manebi">Manebi</option>
                          <option value="Mango">Mango</option>
                          <option value="Manila">Manila</option>
                          <option value="Manila Grace">Manila Grace</option>
                          <option value="Manish Arora">Manish Arora</option>
                          <option value="Manito">Manito</option>
                          <option value="Manolo">Manolo</option>
                          <option value="Manolo Blahnik">Manolo Blahnik</option>
                          <option value="Manoush">Manoush</option>
                          <option value="Mansur">Mansur</option>
                          <option value="Mansur Gavriel">Mansur Gavriel</option>
                          <option value="Manuel Barceló">Manuel Barceló</option>
                          <option value="Manuel Ritz">Manuel Ritz</option>
                          <option value="Many">Many</option>
                          <option value="Marbek">Marbek</option>
                          <option value="Marc">Marc</option>
                          <option value="Marc Alary">Marc Alary</option>
                          <option value="Marc By">Marc By</option>
                          <option value="Marc By Marc Jacobs">
                            Marc By Marc Jacobs
                          </option>
                          <option value="Marc Cain">Marc Cain</option>
                          <option value="Marc Ellis">Marc Ellis</option>
                          <option value="Marc Jacobs">Marc Jacobs</option>
                          <option value="Marc O'Polo">Marc O'Polo</option>
                          <option value="Marc Opolo">Marc Opolo</option>
                          <option value="Marcasite">Marcasite</option>
                          <option value="Marcel">Marcel</option>
                          <option value="Marcel Martillo">
                            Marcel Martillo
                          </option>
                          <option value="Marcelo">Marcelo</option>
                          <option value="Marcelo Burlon">Marcelo Burlon</option>
                          <option value="Marcia">Marcia</option>
                          <option value="Marco">Marco</option>
                          <option value="Marco De Vincenzo">
                            Marco De Vincenzo
                          </option>
                          <option value="Marco De Vincenzo Pre Owned">
                            Marco De Vincenzo Pre Owned
                          </option>
                          <option value="Marco De Vincenzo X">
                            Marco De Vincenzo X
                          </option>
                          <option value="Marco De Vincenzo X Woolmark">
                            Marco De Vincenzo X Woolmark
                          </option>
                          <option value="Marco Proietti Design">
                            Marco Proietti Design
                          </option>
                          <option value="Marco Tozzi">Marco Tozzi</option>
                          <option value="Marco Visconti">Marco Visconti</option>
                          <option value="Marcus">Marcus</option>
                          <option value="Marella">Marella</option>
                          <option value="Marge">Marge</option>
                          <option value="Maria">Maria</option>
                          <option value="Maria Calderara">
                            Maria Calderara
                          </option>
                          <option value="Maria Francesca">
                            Maria Francesca
                          </option>
                          <option value="Maria Francesca Pepe">
                            Maria Francesca Pepe
                          </option>
                          <option value="Maria La Rosa">Maria La Rosa</option>
                          <option value="Maria Lucia Hohan">
                            Maria Lucia Hohan
                          </option>
                          <option value="Maria Sole">Maria Sole</option>
                          <option value="Maria Stanley">Maria Stanley</option>
                          <option value="Mariamare">Mariamare</option>
                          <option value="Marian">Marian</option>
                          <option value="Mariana">Mariana</option>
                          <option value="Marianne">Marianne</option>
                          <option value="Mariano">Mariano</option>
                          <option value="Marie">Marie</option>
                          <option value="Marie Laure Chamorel">
                            Marie Laure Chamorel
                          </option>
                          <option value="Marie Méro">Marie Méro</option>
                          <option value="Marie Méro x Isabeau">
                            Marie Méro x Isabeau
                          </option>
                          <option value="Mariella">Mariella</option>
                          <option value="Marietta">Marietta</option>
                          <option value="Marijuana">Marijuana</option>
                          <option value="Marikai">Marikai</option>
                          <option value="Marina">Marina</option>
                          <option value="Marina Hoermanseder">
                            Marina Hoermanseder
                          </option>
                          <option value="Marina Moscone">Marina Moscone</option>
                          <option value="Marina Rinaldi">Marina Rinaldi</option>
                          <option value="Marina Yachting">
                            Marina Yachting
                          </option>
                          <option value="Marine">Marine</option>
                          <option value="Marine Serre">Marine Serre</option>
                          <option value="Marion">Marion</option>
                          <option value="Marion Parke">Marion Parke</option>
                          <option value="Maripé">Maripé</option>
                          <option value="Marjolaine">Marjolaine</option>
                          <option value="Mark">Mark</option>
                          <option value="Mark Cross">Mark Cross</option>
                          <option value="Markus">Markus</option>
                          <option value="Markus Lupfer">Markus Lupfer</option>
                          <option value="Marni">Marni</option>
                          <option value="Marni Pre Owned">
                            Marni Pre Owned
                          </option>
                          <option value="Marni Vintage">Marni Vintage</option>
                          <option value="Marques">Marques</option>
                          <option value="Marques Almeida">
                            Marques Almeida
                          </option>
                          <option value="Marques Almeida Pre Owned">
                            Marques Almeida Pre Owned
                          </option>
                          <option value="Marques'">Marques'</option>
                          <option value="Marquis">Marquis</option>
                          <option value="Marrakech">Marrakech</option>
                          <option value="Marsèll">Marsèll</option>
                          <option value="Marskinryyppy">Marskinryyppy</option>
                          <option value="Martine">Martine</option>
                          <option value="Martine Rose">Martine Rose</option>
                          <option value="Martinelli">Martinelli</option>
                          <option value="Martino">Martino</option>
                          <option value="Martirio's">Martirio's</option>
                          <option value="Martyre">Martyre</option>
                          <option value="Mary">Mary</option>
                          <option value="Maryam">Maryam</option>
                          <option value="Maryam Nassir Zadeh">
                            Maryam Nassir Zadeh
                          </option>
                          <option value="Maryan Mehlhorn">
                            Maryan Mehlhorn
                          </option>
                          <option value="Marysia">Marysia</option>
                          <option value="Marzi">Marzi</option>
                          <option value="Masahiro">Masahiro</option>
                          <option value="Masai">Masai</option>
                          <option value="Maserati">Maserati</option>
                          <option value="Mason">Mason</option>
                          <option value="Mason Garments">Mason Garments</option>
                          <option value="Mass">Mass</option>
                          <option value="Massada">Massada</option>
                          <option value="Masscob">Masscob</option>
                          <option value="Massimo">Massimo</option>
                          <option value="Massimo Alba">Massimo Alba</option>
                          <option value="Massimo Dutti">Massimo Dutti</option>
                          <option value="Massimo Rebecchi">
                            Massimo Rebecchi
                          </option>
                          <option value="Master">Master</option>
                          <option value="Master And">Master And</option>
                          <option value="Master Piece">Master Piece</option>
                          <option value="Master-Piece">Master-Piece</option>
                          <option value="Mastermind">Mastermind</option>
                          <option value="Mastermind Japan">
                            Mastermind Japan
                          </option>
                          <option value="Mastermind World">
                            Mastermind World
                          </option>
                          <option value="Masterpeace">Masterpeace</option>
                          <option value="Masters">Masters</option>
                          <option value="Matchbox">Matchbox</option>
                          <option value="Mathias">Mathias</option>
                          <option value="Maticevski">Maticevski</option>
                          <option value="Matin">Matin</option>
                          <option value="Matisse">Matisse</option>
                          <option value="Matsuda">Matsuda</option>
                          <option value="Matter Matters">Matter Matters</option>
                          <option value="Matthew">Matthew</option>
                          <option value="Matthew Adams Dolan">
                            Matthew Adams Dolan
                          </option>
                          <option value="Matthew Williamson">
                            Matthew Williamson
                          </option>
                          <option value="Maui">Maui</option>
                          <option value="Maui Jim">Maui Jim</option>
                          <option value="Maurer">Maurer</option>
                          <option value="Maurer + Wirtz">Maurer + Wirtz</option>
                          <option value="Mauro">Mauro</option>
                          <option value="Mauro Grifoni">Mauro Grifoni</option>
                          <option value="Max">Max</option>
                          <option value="Max & Co.">Max & Co.</option>
                          <option value="Max & Moi">Max & Moi</option>
                          <option value="Max Mara">Max Mara</option>
                          <option value="Max Mara Elegante">
                            Max Mara Elegante
                          </option>
                          <option value="Max Mara Pre Owned">
                            Max Mara Pre Owned
                          </option>
                          <option value="Max Mara Studio">
                            Max Mara Studio
                          </option>
                          <option value="Max Mara Weekend">
                            Max Mara Weekend
                          </option>
                          <option value="Max Mara x Renzo Piano Building Workshop">
                            Max Mara x Renzo Piano Building Workshop
                          </option>
                          <option value="Max V Koenig">Max V Koenig</option>
                          <option value="Maximilian">Maximilian</option>
                          <option value="Maximilian Furs">
                            Maximilian Furs
                          </option>
                          <option value="Maxmara">Maxmara</option>
                          <option value="Maxwell">Maxwell</option>
                          <option value="Maxwell Scott Bags">
                            Maxwell Scott Bags
                          </option>
                          <option value="May">May</option>
                          <option value="Maya">Maya</option>
                          <option value="Maya Magal">Maya Magal</option>
                          <option value="Maz">Maz</option>
                          <option value="Mazbot">Mazbot</option>
                          <option value="Mc2 Saint">Mc2 Saint</option>
                          <option value="Mc2 Saint Barth">
                            Mc2 Saint Barth
                          </option>
                          <option value="Mcgregor">Mcgregor</option>
                          <option value="Mcguire">Mcguire</option>
                          <option value="Mcinty">Mcinty</option>
                          <option value="Mcintyre">Mcintyre</option>
                          <option value="Mcq">Mcq</option>
                          <option value="Mcq Alexander">Mcq Alexander</option>
                          <option value="Mcq Alexander Mcqueen">
                            Mcq Alexander Mcqueen
                          </option>
                          <option value="Mcq By Alexander Mcqueen">
                            Mcq By Alexander Mcqueen
                          </option>
                          <option value="Mcrae">Mcrae</option>
                          <option value="Mcs">Mcs</option>
                          <option value="Md">Md</option>
                          <option value="Mdk">Mdk</option>
                          <option value="Meadow">Meadow</option>
                          <option value="Meadowlark">Meadowlark</option>
                          <option value="Medea">Medea</option>
                          <option value="Medicom">Medicom</option>
                          <option value="Mehry">Mehry</option>
                          <option value="Mehry Mu">Mehry Mu</option>
                          <option value="Meister">Meister</option>
                          <option value="Melania">Melania</option>
                          <option value="Melania - Hair">Melania - Hair</option>
                          <option value="Melanie">Melanie</option>
                          <option value="Melania Trump">Melania Trump</option>
                          <option value="Melflex">Melflex</option>
                          <option value="Melie Bianco">Melie Bianco</option>
                          <option value="Meline">Meline</option>
                          <option value="Meli">Meli</option>
                          <option value="Meli Melo">Meli Melo</option>
                          <option value="Melissa">Melissa</option>
                          <option value="Melissa Joy Manning">
                            Melissa Joy Manning
                          </option>
                          <option value="Melissa Kaye">Melissa Kaye</option>
                          <option value="Melissa Odabash">
                            Melissa Odabash
                          </option>
                          <option value="Melissa Shoes">Melissa Shoes</option>
                          <option value="Melitta">Melitta</option>
                          <option value="Mellow Yellow">Mellow Yellow</option>
                          <option value="Meltin'pot">Meltin'pot</option>
                          <option value="Melvin">Melvin</option>
                          <option value="Melvin & Hamilton">
                            Melvin & Hamilton
                          </option>
                          <option value="Menbur">Menbur</option>
                          <option value="Meng">Meng</option>
                          <option value="Mens">Mens</option>
                          <option value="Mercedes">Mercedes</option>
                          <option value="Mercedes Castillo">
                            Mercedes Castillo
                          </option>
                          <option value="Mercury">Mercury</option>
                          <option value="Mere">Mere</option>
                          <option value="Meri">Meri</option>
                          <option value="Meri Meri">Meri Meri</option>
                          <option value="Mermaid">Mermaid</option>
                          <option value="Merrell">Merrell</option>
                          <option value="Mes Demoiselles">
                            Mes Demoiselles
                          </option>
                          <option value="Messagerie">Messagerie</option>
                          <option value="Messes">Messes</option>
                          <option value="Meta">Meta</option>
                          <option value="Metafora">Metafora</option>
                          <option value="Méthode">Méthode</option>
                          <option value="Metisse">Metisse</option>
                          <option value="Metradamo">Metradamo</option>
                          <option value="Metropolitan">Metropolitan</option>
                          <option value="Mexicana">Mexicana</option>
                          <option value="Mia">Mia</option>
                          <option value="Mia Bag">Mia Bag</option>
                          <option value="Miaou">Miaou</option>
                          <option value="Miaoran">Miaoran</option>
                          <option value="Miansai">Miansai</option>
                          <option value="Miareal">Miareal</option>
                          <option value="Miashoes">Miashoes</option>
                          <option value="Miasuki">Miasuki</option>
                          <option value="Michael">Michael</option>
                          <option value="Michael By Michael Kors">
                            Michael By Michael Kors
                          </option>
                          <option value="Michael Kors">Michael Kors</option>
                          <option value="Michael Kors Collection">
                            Michael Kors Collection
                          </option>
                          <option value="Michael Kors Pre Owned">
                            Michael Kors Pre Owned
                          </option>
                          <option value="Michael Kors Vintage">
                            Michael Kors Vintage
                          </option>
                          <option value="Michael Lo Sordo">
                            Michael Lo Sordo
                          </option>
                          <option value="Michaël Rys">Michaël Rys</option>
                          <option value="Michela">Michela</option>
                          <option value="Michelangelo">Michelangelo</option>
                          <option value="Michelino">Michelino</option>
                          <option value="Michele">Michele</option>
                          <option value="Michele Lopriore">
                            Michele Lopriore
                          </option>
                          <option value="Michelle">Michelle</option>
                          <option value="Michelle Mason">Michelle Mason</option>
                          <option value="Mickey">Mickey</option>
                          <option value="Mickey Mouse">Mickey Mouse</option>
                          <option value="Mickey Mouse X Keith Haring">
                            Mickey Mouse X Keith Haring
                          </option>
                          <option value="Mickey X Keith Haring">
                            Mickey X Keith Haring
                          </option>
                          <option value="Micky">Micky</option>
                          <option value="Miharayasuhiro">Miharayasuhiro</option>
                          <option value="Miista">Miista</option>
                          <option value="Mikey">Mikey</option>
                          <option value="Mila">Mila</option>
                          <option value="Mila Louise">Mila Louise</option>
                          <option value="Mila Schön">Mila Schön</option>
                          <option value="Milan">Milan</option>
                          <option value="Milano">Milano</option>
                          <option value="Mild">Mild</option>
                          <option value="Milestone">Milestone</option>
                          <option value="Milk It">Milk It</option>
                          <option value="Millie">Millie</option>
                          <option value="Millie Mackintosh">
                            Millie Mackintosh
                          </option>
                          <option value="Milly">Milly</option>
                          <option value="Mimi">Mimi</option>
                          <option value="Mimi Holliday">Mimi Holliday</option>
                          <option value="Mimi et Toi">Mimi et Toi</option>
                          <option value="Mimisol">Mimisol</option>
                          <option value="Mims">Mims</option>
                          <option value="Mina">Mina</option>
                          <option value="Minä Perhonen">Minä Perhonen</option>
                          <option value="Minelli">Minelli</option>
                          <option value="Ming">Ming</option>
                          <option value="Mink">Mink</option>
                          <option value="Minkpink">Minkpink</option>
                          <option value="Minna">Minna</option>
                          <option value="Minna Parikka">Minna Parikka</option>
                          <option value="Minnie">Minnie</option>
                          <option value="Minnie Rose">Minnie Rose</option>
                          <option value="Minoronzoni 1953">
                            Minoronzoni 1953
                          </option>
                          <option value="Mint">Mint</option>
                          <option value="Mint Velvet">Mint Velvet</option>
                          <option value="Mint&berry">Mint&berry</option>
                          <option value="Minuet">Minuet</option>
                          <option value="Miqura">Miqura</option>
                          <option value="Miraclesuit">Miraclesuit</option>
                          <option value="Mirage">Mirage</option>
                          <option value="Miraikanai">Miraikanai</option>
                          <option value="Miranda">Miranda</option>
                          <option value="Mishky">Mishky</option>
                          <option value="Miso">Miso</option>
                          <option value="Miss">Miss</option>
                          <option value="Miss Blumarine">Miss Blumarine</option>
                          <option value="Miss Kg">Miss Kg</option>
                          <option value="Miss Mary Of">Miss Mary Of</option>
                          <option value="Miss Me">Miss Me</option>
                          <option value="Miss Perla">Miss Perla</option>
                          <option value="Miss Selfridge">Miss Selfridge</option>
                          <option value="Miss Sixty">Miss Sixty</option>
                          <option value="Missguided">Missguided</option>
                          <option value="Missoni">Missoni</option>
                          <option value="Missoni Mare">Missoni Mare</option>
                          <option value="Missoni Pre Owned">
                            Missoni Pre Owned
                          </option>
                          <option value="Missoni Vintage">
                            Missoni Vintage
                          </option>
                          <option value="Miu">Miu</option>
                          <option value="Miu Miu">Miu Miu</option>
                          <option value="Miu Miu Eyewear">
                            Miu Miu Eyewear
                          </option>
                          <option value="Miu Miu Vintage">
                            Miu Miu Vintage
                          </option>
                          <option value="Mivida">Mivida</option>
                          <option value="Mix">Mix</option>
                          <option value="Mixxmix">Mixxmix</option>
                          <option value="Mizuno">Mizuno</option>
                          <option value="Mj">Mj</option>
                          <option value="Mjus">Mjus</option>
                          <option value="Mk">Mk</option>
                          <option value="Mks">Mks</option>
                          <option value="Mkt">Mkt</option>
                          <option value="Ml">Ml</option>
                          <option value="Mlle">Mlle</option>
                          <option value="Mm6">Mm6</option>
                          <option value="Mm6 Maison Margiela">
                            Mm6 Maison Margiela
                          </option>
                          <option value="Mms">Mms</option>
                          <option value="Mo&amp;co">Mo&amp;co</option>
                          <option value="Mo&amp;co.">Mo&amp;co.</option>
                          <option value="Moa">Moa</option>
                          <option value="Moa Master Of Arts">
                            Moa Master Of Arts
                          </option>
                          <option value="Moas">Moas</option>
                          <option value="Mobils">Mobils</option>
                          <option value="Mochi">Mochi</option>
                          <option value="Mode">Mode</option>
                          <option value="Modeka">Modeka</option>
                          <option value="Modelco">Modelco</option>
                          <option value="Modelle">Modelle</option>
                          <option value="Moderno">Moderno</option>
                          <option value="Modestie">Modestie</option>
                          <option value="Modewerk">Modewerk</option>
                          <option value="Modfitters">Modfitters</option>
                          <option value="Modström">Modström</option>
                          <option value="Moe">Moe</option>
                          <option value="Moeva">Moeva</option>
                          <option value="Moffat">Moffat</option>
                          <option value="Mogul">Mogul</option>
                          <option value="Mohair">Mohair</option>
                          <option value="Moheda">Moheda</option>
                        </select>
                      </div>

                      <div className="range">
                        <div className="range-slider">
                          <span
                            className="range-selected"
                            style={{
                              left: (minRange / 2000) * 100 + "%",
                              right: 100 - (maxRange / 2000) * 100 + "%",
                            }}
                          ></span>
                        </div>
                        <div className="range-input">
                          <input
                            type="range"
                            className="min"
                            min="0"
                            max="2000"
                            value={minRange}
                            step="10"
                            onChange={(e) => {
                              setMinRange(Number(e.target.value));
                            }}
                          />
                          <input
                            type="range"
                            className="max"
                            min="0"
                            max="2000"
                            value={maxRange}
                            step="10"
                            onChange={(e) => {
                              setMaxRange(Number(e.target.value));
                            }}
                          />
                        </div>
                        <div className="range-price">
                          <label htmlFor="min">Min</label>
                          <input
                            type="number"
                            name="min"
                            value={minRange}
                            onChange={(e) => setMinRange(e.target.value)}
                          />
                          <label htmlFor="max">Max</label>
                          <input
                            type="number"
                            name="max"
                            value={maxRange}
                            onChange={(e) => setMaxRange(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        className="buy-button"
                        onClick={handleButtonClick}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="search-results">
          {searchResults.map((result, index) => {
            const handleClick = () => {
              fetchItems({
                id: result.id,
                filter: "{}",
              });
              console.log("Clicked on item:", result);
            };
            return (
              <div
                className="outer"
                key={index}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div className="inner-1" onClick={handleClick}>
                  <div className="image-wrapper">
                    <img
                      style={{ width: "100%", height: "100%" }}
                      src={result.uri}
                    />
                    <div className="explore-now">EXPLORE MORE</div>
                  </div>
                </div>
                <div className="inner-2">
                  <div className="para-inner">{result.brand}</div>
                  <div className="para-inner2">{result.title}</div>
                  <div className="para-inner3">
                    <div>${result.price}</div>
                    {hoveredItem === index && (
                      <div>
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="buy-button">Buy</button>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Main;
