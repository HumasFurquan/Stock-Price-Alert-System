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

