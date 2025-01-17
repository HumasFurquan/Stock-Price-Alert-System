import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

// Replace with your Auth0 credentials
const domain = "dev-iw3p1g0scratskkw.us.auth0.com";  // Example: dev-1234abcd.us.auth0.com
const clientId = "BO5KiwQxsOg2BxvYOyXyN3dvm2d3k2lv";  // Example: 1234abcd1234abcd1234abcd1234abcd

ReactDOM.render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
