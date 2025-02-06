import React, { useState } from "react";
import Autosuggest from 'react-autosuggest';
import { useAuth0 } from "@auth0/auth0-react";

const stockSuggestions = [
  { name: "AAPL" },
  { name: "GOOGL" },
  { name: "MSFT" },
  { name: "AMZN" },
  { name: "TSLA" },
  // Add more stock symbols as needed
];

const USD_TO_INR_CONVERSION_RATE = 75;

function GuestPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const [stockName, setStockName] = useState("");
  const [stockPrice, setStockPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searchCount, setSearchCount] = useState(0);

  const fetchStockPrice = async () => {
    if (!stockName) {
      setError("Stock name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setStockPrice(null);

    try {
      const response = await fetch(`https://api.twelvedata.com/price?symbol=${stockName}&apikey=996517017fc341dc84037d571b92f61f`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock price');
      }
      const data = await response.json();
      if (data.price) {
        setStockPrice(data.price);
        setSearchCount(searchCount + 1);
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
    <div>
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
    setStockName(newValue);
  };

  const inputProps = {
    placeholder: "Enter stock name (e.g., AAPL)",
    value: stockName,
    onChange: onChange
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Welcome</h1>
      {searchCount === 0 || isAuthenticated ? (
        <>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
          />
          <button onClick={fetchStockPrice}>Show</button>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {stockPrice && (
            <p>
              Current price of {stockName}: ${stockPrice} USD / ₹{(stockPrice * USD_TO_INR_CONVERSION_RATE).toFixed(2)} INR
            </p>
          )}
        </>
      ) : (
        <div style={{ border: '1px solid black', padding: '20px', textAlign: 'center' }}>
          <p>Please log in to continue searching for stock prices.</p>
          <button onClick={() => loginWithRedirect()}>Log in with Auth0</button>
        </div>
      )}
    </div>
  );
}

export default GuestPage;