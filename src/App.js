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
  { name: "TSLA" },
  { name: "FB" },
  { name: "NFLX" },
  { name: "NVDA" },
  { name: "BABA" },
  { name: "V" },
  { name: "JPM" },
  { name: "JNJ" },
  { name: "WMT" },
  { name: "PG" },
  { name: "DIS" },
  { name: "MA" },
  { name: "HD" },
  { name: "PYPL" },
  { name: "BAC" },
  { name: "INTC" },
  { name: "CMCSA" },
  { name: "ADBE" },
  { name: "PFE" },
  { name: "KO" },
  { name: "PEP" },
  { name: "CSCO" },
  { name: "XOM" },
  { name: "T" },
  { name: "VZ" },
  { name: "ABT" },
  { name: "MRK" },
  { name: "NKE" },
  { name: "ORCL" },
  { name: "CRM" },
  { name: "MCD" },
  { name: "COST" },
  { name: "WFC" },
  { name: "MDT" },
  { name: "AMGN" },
  { name: "UNH" },
  { name: "TXN" },
  { name: "QCOM" },
  { name: "LLY" },
  { name: "HON" },
  { name: "IBM" },
  { name: "MMM" },
  { name: "GE" },
  { name: "BA" },
  { name: "CAT" },
  { name: "UPS" },
  { name: "FDX" },
  { name: "LMT" },
  { name: "GS" },
  { name: "MS" },
  { name: "BLK" },
  { name: "AXP" },
  { name: "SPGI" },
  { name: "PLD" },
  { name: "CB" },
  { name: "SCHW" },
  { name: "USB" },
  { name: "PNC" },
  { name: "TGT" },
  { name: "LOW" },
  { name: "BKNG" },
  { name: "ADP" },
  { name: "SYK" },
  { name: "ISRG" },
  { name: "CI" },
  { name: "ANTM" },
  { name: "CNC" },
  { name: "HUM" },
  { name: "CVS" },
  { name: "UNP" },
  { name: "CSX" },
  { name: "NSC" },
  { name: "KSU" },
  { name: "EXC" },
  { name: "DUK" },
  { name: "SO" },
  { name: "NEE" },
  { name: "D" },
  { name: "AEP" },
  { name: "SRE" },
  { name: "PEG" },
  { name: "ED" },
  { name: "XEL" },
  { name: "ES" },
  { name: "EIX" },
  { name: "PCG" },
  { name: "AEE" },
  { name: "CMS" },
  { name: "DTE" },
  { name: "ETR" },
  { name: "FE" },
  { name: "PPL" },
  { name: "WEC" },
  { name: "AWK" },
  { name: "CNP" },
  { name: "NI" },
  { name: "NRG" },
  { name: "AES" },
  { name: "LNT" },
  { name: "EVRG" },
  { name: "PNW" },
  { name: "AEP" },
  { name: "ATO" },
  { name: "OGE" },
  { name: "SWX" },
  { name: "UGI" },
  { name: "SJI" },
  { name: "NJR" },
  { name: "NWN" },
  { name: "AVA" },
  { name: "CWT" },
  { name: "AWR" },
  { name: "SJW" },
  { name: "YORW" },
  { name: "MSEX" },
  { name: "ARTNA" },
  { name: "CTWS" },
  { name: "CWCO" },
  { name: "WTRG" },
  { name: "AQUA" },
  { name: "XYL" },
  { name: "BMI" },
  { name: "DHR" },
  { name: "TMO" },
  { name: "BDX" },
  { name: "PKI" },
  { name: "WAT" },
  { name: "MTD" },
  { name: "A" },
  { name: "BIO" },
  { name: "TECH" },
  { name: "ILMN" },
  { name: "IQV" },
  { name: "LH" },
  { name: "DGX" },
  { name: "NEOG" },
  { name: "CRL" },
  { name: "PRGO" },
  { name: "PDCO" },
  { name: "HSIC" },
  { name: "XRAY" },
  { name: "ALGN" },
  { name: "STE" },
  { name: "ZBH" },
  { name: "SYK" },
  { name: "JNJ" },
  { name: "ABT" },
  { name: "MDT" },
  { name: "BSX" },
  { name: "EW" },
  { name: "HOLX" },
  { name: "VAR" },
  { name: "ISRG" },
  { name: "RMD" },
  { name: "GMED" },
  { name: "NUVA" },
  { name: "IART" },
  { name: "OFIX" },
  { name: "PODD" },
  { name: "TNDM" },
  { name: "DXCM" },
  { name: "MASI" },
  { name: "INSP" },
  { name: "NVCR" },
  { name: "PEN" },
  { name: "SILK" },
  { name: "AXNX" },
  { name: "CUTR" },
  { name: "IRTC" },
  { name: "LVGO" },
  { name: "NTRA" },
  { name: "GH" },
  { name: "EXAS" },
  { name: "FLGT" },
  { name: "CDNA" },
  { name: "NARI" },
  { name: "TXG" },
  { name: "TWST" },
  { name: "FATE" },
  { name: "EDIT" },
  { name: "CRSP" },
  { name: "NTLA" },
  { name: "BEAM" },
  { name: "SGMO" },
  { name: "BLUE" },
  { name: "CLLS" },
  { name: "ADPT" },
  { name: "GILD" },
  { name: "VRTX" },
  { name: "REGN" },
  { name: "BIIB" },
  { name: "AMGN" },
  { name: "INCY" },
  { name: "ALXN" },
  { name: "NBIX" },
  { name: "SAGE" },
  { name: "ACAD" },
  { name: "IONS" },
  { name: "SRPT" },
  { name: "VRTX" },
  { name: "BMRN" },
  { name: "ALNY" },
  { name: "ARWR" },
  { name: "MRTX" },
  { name: "EXEL" },
  { name: "KRTX" },
  { name: "IMMU" },
  { name: "GBT" },
  { name: "RARE" },
  { name: "PTCT" },
  { name: "FOLD" },
  { name: "CRSP" },
  { name: "EDIT" },
  { name: "NTLA" },
  { name: "BEAM" },
  { name: "SGMO" },
  { name: "BLUE" },
  { name: "CLLS" },
  { name: "ADPT" },
  { name: "GILD" },
  { name: "VRTX" },
  { name: "REGN" },
  { name: "BIIB" },
  { name: "AMGN" },
  { name: "INCY" },
  { name: "ALXN" },
  { name: "NBIX" },
  { name: "SAGE" },
  { name: "ACAD" },
  { name: "IONS" },
  { name: "SRPT" },
  { name: "VRTX" },
  { name: "BMRN" },
  { name: "ALNY" },
  { name: "ARWR" },
  { name: "MRTX" },
  { name: "EXEL" },
  { name: "KRTX" },
  { name: "IMMU" },
  { name: "GBT" },
  { name: "RARE" },
  { name: "PTCT" },
  { name: "FOLD" },
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
    onChange: onChange,
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        fetchStockPrice();
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
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
                />
                <button onClick={fetchStockPrice}>Show</button>
                {loading && <p>Loading...</p>}
                {error && <p>Error: {error}</p>}
                <ul className="stock-price-list" reversed>
                  {stockPrices.map((stock, index) => (
                    <li key={index}>
                      {index + 1}. Current price of {stock.name}: ${stock.price} USD / ₹{(stock.price * USD_TO_INR_CONVERSION_RATE).toFixed(2)} INR
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