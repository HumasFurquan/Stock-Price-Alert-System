<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Connecting to MongoDB Compass Using a Connection String

This guide provides step-by-step instructions for connecting to MongoDB Compass using your connection string.

---

## Prerequisites
- Install MongoDB Compass: [Download MongoDB Compass](https://www.mongodb.com/try/download/compass)
- Ensure you have a valid MongoDB URI.
  
Example URI:
```
mongodb+srv://Humas:Humas%40123@cluster0.kl8lj.mongodb.net/auth0-demo?retryWrites=true&w=majority
```

---

## Steps to Connect

### 1. Open MongoDB Compass
- Launch the MongoDB Compass application on your computer.

### 2. Enter Connection Details
- In the "New Connection" window:
  - Locate the **URI** field.
  - Paste the provided MongoDB URI into the field:
    ```
    mongodb+srv://Humas:Humas%40123@cluster0.kl8lj.mongodb.net/auth0-demo?retryWrites=true&w=majority
    ```

### 3. Edit Connection Name (Optional)
- Optionally, you can:
  - Provide a **Name** for the connection (e.g., `Auth0 Demo`).
  - Assign a **Color** to differentiate this connection from others.

### 4. Save Connection (Optional)
- Check **"Favorite this connection"** if you want quick access to this connection in the future.

### 5. Connect
- Click the **"Connect"** button to establish the connection.

---

## Explore Your Database
- Once connected, you’ll see a list of available databases.
- Look for the database named `auth0-demo`.
- Click on the database to view its collections, such as `users`.

---

## Troubleshooting
- If the connection fails, verify the following:
  - The URI is correct and properly formatted.
  - You have an active internet connection.
  - Your IP address is whitelisted in the MongoDB Atlas security settings.
- Refer to the official MongoDB documentation for additional help: [MongoDB Documentation](https://docs.mongodb.com/).

---

You’re now ready to view and manage your data in MongoDB Compass!

>>>>>>> f86921252df74cf21ba01099c1214e2d68d2cd83
