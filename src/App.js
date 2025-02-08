import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes } from "react-router-dom";
import './App.css';
import GuestPage from './components/GuestPages';
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

  const [stockName, setStockName] = useState("");
  const [stockPrices, setStockPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertPopupMessage, setAlertPopupMessage] = useState("");
  const [triggeredStocks, setTriggeredStocks] = useState({});
  const [guestUser, setGuestUser] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`http://localhost:5000/api/users/${user.email}`)
        .then(response => response.json())
        .then(async data => {
          if (data && data.stocks) {
            const updatedStocks = await Promise.all(data.stocks.map(async stock => {
              const response = await fetch(`https://api.twelvedata.com/price?symbol=${stock.name}&apikey=996517017fc341dc84037d571b92f61f`);
              const stockData = await response.json();
              return {
                ...stock,
                price: stockData.price
              };
            }));
            setStockPrices(updatedStocks);
            const inputValues = {};
            const triggeredStocks = {};
            updatedStocks.forEach(stock => {
              inputValues[stock.name] = {
                value: stock.triggeredPrice,
                currency: 'USD', // Assuming default currency is USD
                showInput: false,
              };
              triggeredStocks[stock.name] = true;
            });
            setInputValues(inputValues);
            setTriggeredStocks(triggeredStocks);
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const stocks = stockPrices.map(stock => ({
        name: stock.name,
        currentPrice: stock.price,
        triggeredPrice: inputValues[stock.name]?.value || 0,
      }));

      fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: user.name, email: user.email, stocks }),
      })
      .then(response => response.json())
      .then(data => console.log('User login saved:', data))
      .catch(error => console.error('Error:', error));
    }
  }, [isAuthenticated, user, stockPrices, inputValues]);

  const handleLogout = () => {
    if (user) {
      fetch('http://localhost:5000/api/users/logout', {
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
    setGuestUser(true);
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
      setDuplicateMessage(`${stockName} Stock already added`);
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
    if (guestUser) {
      setAlertPopupMessage('Email required');
      setShowAlertPopup(true);
      setTimeout(() => {
        setShowAlertPopup(false);
        setShowLoginButton(true);
      }, 4000); // Clear message after 4 seconds
      return;
    }

    const inputValue = inputValues[stock.name]?.value;
    const currency = inputValues[stock.name]?.currency;

    if (inputValue && currency) {
      const message = currency === 'USD'
        ? `You will be alerted at ${inputValue} dollars.`
        : `You will be alerted at ${inputValue} rupees.`;
      setAlertPopupMessage(message);
      setShowAlertPopup(true);
      setTimeout(() => {
        setShowAlertPopup(false);
      }, 4000); // Clear message after 4 seconds

      // Mark the stock as triggered
      setTriggeredStocks((prev) => ({
        ...prev,
        [stock.name]: true,
      }));
    } else {
      setAlertPopupMessage('Please enter a valid amount.');
      setShowAlertPopup(true);
      setTimeout(() => {
        setShowAlertPopup(false);
      }, 4000); // Clear message after 4 seconds
    }
  };

  const handleEdit = (stock) => {
    // Mark the stock as not triggered to show the input box and trigger button again
    setTriggeredStocks((prev) => ({
      ...prev,
      [stock.name]: false,
    }));
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
    setTriggeredStocks((prev) => {
      const newState = { ...prev };
      delete newState[stockToDelete.name];
      return newState;
    });
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
          isAuthenticated || guestUser ? (
            <>
              <h2>Hello, {guestUser ? 'Guest User' : user.name}!</h2>
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
                {showDuplicateMessage && <p className="duplicate-message">{duplicateMessage}</p>}
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                <ul className="stock-price-list" reversed>
                  {stockPrices.map((stock, index) => (
                    <li key={index} className="stock-item">
                      {index + 1}. Current price of {stock.name}: ${stock.price} USD / ₹{(stock.price * USD_TO_INR_CONVERSION_RATE).toFixed(2)} INR
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <button onClick={() => handleCurrencyChange(stock, 'USD')} style={{ marginLeft: '10px' }}>Dollar</button>
                          <button className="rupees-button" onClick={() => handleCurrencyChange(stock, 'INR')} style={{ marginLeft: '10px' }}>Rupees</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <button className="delete-button" onClick={() => handleDelete(stock)} style={{ marginLeft: '10px' }}>Delete</button>
                          {triggeredStocks[stock.name] && (
                            <button className="edit-button" onClick={() => handleEdit(stock)} style={{ marginLeft: '10px', marginTop: '5px' }}>
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      {inputValues[stock.name]?.showInput && !triggeredStocks[stock.name] && (
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
                      {triggeredStocks[stock.name] && (
                        <div className="alert-message">
                          <p>You have set alert at {inputValues[stock.name].value} {inputValues[stock.name].currency}</p>
                        </div>
                      )}
                      {!triggeredStocks[stock.name] && inputValues[stock.name]?.showInput && (
                        <div className="trigger-button-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                          {showLoginButton && guestUser ? (
                            <button onClick={handleLogin} style={{ marginBottom: '10px' }}>Log in</button>
                          ) : (
                            <button onClick={() => handleTrigger(stock)}>
                              Trigger
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer">
                <button className="logout-button" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div>
              <button onClick={handleLogin}>Log in</button>
              <button onClick={handleGuestLogin} style={{ marginLeft: '10px' }}>Sign in as Guest User</button>
            </div>
          )
        } />
      </Routes>
      {showAlertPopup && (
        <div className="alert-popup">
          <p>{alertPopupMessage}</p>
          <div className="alert-popup-line"></div>
        </div>
      )}
    </div>
  );
}

export default App;