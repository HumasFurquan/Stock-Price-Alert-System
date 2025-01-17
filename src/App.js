import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import './App.css';

function App() {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
  } = useAuth0();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(`Sending request to save user login: ${user.name}, ${user.email}`);
      fetch('http://localhost:5000/api/users/login', { // Updated port to 5002
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
      fetch('http://localhost:5000/api/users/logout', { // Updated port to 5002
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
    // Handle guest login logic here
    console.log('Guest user logged in');
    fetch('http://localhost:5000/api/users/login', { // Updated port to 5002
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Guest User', email: 'guest@example.com' }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Guest user login saved:', data);
      navigate('/guest');
    })
    .catch(error => console.error('Error:', error));
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/" element={
          <>
            <h1>Welcome to Auth0 React Demo</h1>
            {isAuthenticated ? (
              <div>
                <h2>Hello, {user.name}!</h2>
                <button onClick={handleLogout}>
                  Log out
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => loginWithRedirect()}>Log in</button>
                <button onClick={handleGuestLogin} style={{ marginLeft: '10px' }}>Sign in as Guest User</button>
              </div>
            )}
          </>
        } />
      </Routes>
    </div>
  );
}

function GuestPage() {
  return (
    <div>
      <h1>Welcome Guest</h1>
    </div>
  );
}

export default App;