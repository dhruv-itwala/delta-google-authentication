# delta-google-authentication

Google Sign-In authentication package for Express.js.

## 🚀 Installation

```sh
npm install delta-google-authentication
```

## 📌 Setup

Create a `.env` file and add:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
JWT_SECRET=your_jwt_secret
```

## 🔹 Usage

```javascript
import express from "express";
import { googleAuth, verifyToken } from "delta-google-authentication";

const app = express();

// Example function for user database handling
const findOrCreateUser = async (userData) => {
  // Your database logic goes here (MongoDB, PostgreSQL, MySQL, etc.)
};

googleAuth.init(app, {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  jwtSecret: process.env.JWT_SECRET,
  redirectURL: process.env.FRONTEND_DASHBOARD_URL,
  findOrCreateUser, // Passing custom DB function
});

// Example Protected Route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected Route Accessed", user: req.user });
});

app.listen(5000, () => console.log("Server running on port 5000"));
```

## 🔹 Routes

| Method | Route                   | Description                                |
| ------ | ----------------------- | ------------------------------------------ |
| GET    | `/auth/google`          | Redirects user to Google Sign-In           |
| GET    | `/auth/google/callback` | Handles Google OAuth response, returns JWT |
| GET    | `/protected`            | Example protected route (requires JWT)     |

## 🔹 Logout

To log out, simply remove the JWT token from local storage or cookies:

```javascript
localStorage.removeItem("token");
window.location.href = "/";
```

## 📜 License

This project is licensed under the **MIT License**.

## 💻 Contributing

Feel free to submit issues and pull requests on GitHub.

---

Happy coding! 🚀
