import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import './App.css';
import GuestPage from './components/GuestPages'; // Updated import statement
import Autosuggest from 'react-autosuggest';

const stockSuggestions = [
  { name: "AAPL" },
  { name: "GOOGL" },
  { name: "MSFT" },
  { name: "AMZN" },
];

const USD_TO_INR_CONVERSION_RATE = 75;

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  const navigate = useNavigate();
  const [stockName, setStockName] = useState("");
  const [stockPrices, setStockPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`Sending request to save user login: ${user.name}, ${user.email}`);
      fetch('http://localhost:5002/api/users/login', { // Updated port to 5002
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: user.name, email: user.email }),
      })
      .then(response => response.json())
      .then(data => console.log('User login saved:', data))
      .catch(error => console.error('Error:', error));
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    if (user) {
      console.log(`Sending request to save user logout: ${user.email}`);
      fetch('http://localhost:5002/api/users/logout', { // Updated port to 5002
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })
      .then(response => response.json())
      .then(data => console.log('User logout saved:', data))
      .catch(error => console.error('Error:', error));
    }
    logout({ returnTo: window.location.origin });
  };

  const handleGuestLogin = () => {
    console.log('Guest user logged in');
    navigate('/guest?mode=guest');
  };

  const handleLogin = () => {
    loginWithRedirect();
  };

  const fetchStockPrice = async () => {
    if (!stockName) {
      setError("Stock name is required.");
      return;
    }

    // Check if the stock is already present
    if (stockPrices.some(stock => stock.name === stockName)) {
      setShowDuplicateMessage(true);
      setTimeout(() => setShowDuplicateMessage(false), 2000); // Hide message after 2 seconds
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.twelvedata.com/price?symbol=${stockName}&apikey=996517017fc341dc84037d571b92f61f`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }
      const data = await response.json();
      if (data.price) {
        const newStockPrice = {
          name: stockName,
          price: data.price,
          timestamp: new Date().toISOString()
        };
        setStockPrices([newStockPrice, ...stockPrices]);
      } else {
        setError("Invalid stock name or no data available.");
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : stockSuggestions.filter(stock =>
      stock.name.toLowerCase().slice(0, inputLength) === inputValue
    );
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setStockName(suggestion.name.toUpperCase())}
    >
      {suggestion.name}
    </div>
  );

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onChange = (event, { newValue }) => {
    setStockName(newValue.toUpperCase());
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setStockName(suggestion.name.toUpperCase());
  };

  const inputProps = {
    placeholder: "Enter stock name (e.g., AAPL)",
    value: stockName,
    onChange: onChange,
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        fetchStockPrice();
      }
    }
  };

  const handleTrigger = (stock) => {
    console.log(`Trigger alert for ${stock.name} at price ${stock.price}`);
    // Add your trigger alert logic here
  };

  const handleCurrencyChange = (stock, currency) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [stock.name]: { ...prevValues[stock.name], currency, showInput: true }
    }));
  };

  const handleInputChange = (stock, event) => {
    const value = event.target.value;
    if (!isNaN(value)) {
      setInputValues((prevValues) => ({
        ...prevValues,
        [stock.name]: { ...prevValues[stock.name], value }
      }));
    }
  };

  const handleDelete = (stockToDelete) => {
    setStockPrices((prevStockPrices) => prevStockPrices.filter(stock => stock.name !== stockToDelete.name));
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
    document.documentElement.classList.toggle('dark-mode');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <button onClick={toggleDarkMode} style={{ position: 'absolute', top: '10px', right: '10px' }}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <h1>Welcome to Stock Price Trigger Alert</h1>
      <Routes>
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/" element={
          isAuthenticated ? (
            <>
              <h2>Hello, {user.name}!</h2>
              <div className="stock-search-container">
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                  onSuggestionSelected={onSuggestionSelected}
                />
                <button onClick={fetchStockPrice}>Show</button>
                {showDuplicateMessage && <p className="duplicate-message">This Stock already added</p>}
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                <ul className="stock-price-list" reversed>
                  {stockPrices.map((stock, index) => (
                    <li key={index}>
                      {index + 1}. Current price of {stock.name}: ${stock.price} USD / ₹{(stock.price * USD_TO_INR_CONVERSION_RATE).toFixed(2)} INR
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <button onClick={() => handleCurrencyChange(stock, 'USD')} style={{ marginLeft: '10px' }}>Dollar</button>
                          <button onClick={() => handleCurrencyChange(stock, 'INR')} style={{ marginLeft: '10px' }}>Rupees</button>
                        </div>
                        <button onClick={() => handleDelete(stock)} style={{ marginLeft: '10px' }}>Delete</button>
                      </div>
                      {inputValues[stock.name]?.showInput && (
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder={`Enter amount in ${inputValues[stock.name].currency}`}
                            value={inputValues[stock.name].value || ''}
                            onChange={(event) => handleInputChange(stock, event)}
                            style={{ textAlign: 'center' }}
                          />
                        </div>
                      )}
                      {inputValues[stock.name]?.value && <span style={{ marginLeft: '10px' }}>{inputValues[stock.name].value} {inputValues[stock.name].currency}</span>}
                      <button onClick={() => handleTrigger(stock)} style={{ marginLeft: '10px' }}>Trigger</button>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <div>
              <button onClick={handleLogin}>Log in</button>
              <button onClick={handleGuestLogin} style={{ marginLeft: '10px' }}>Sign in as Guest User</button>
            </div>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;