const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const { sequelize, FavoritePair } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use CORS middleware

// Middleware to serve static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the index.html file when accessing the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to fetch exchange rates from the external API
app.get("/api/exchange-rate", async (req, res) => {
  const { baseCurrency, targetCurrency } = req.query;
  const apiKey = "fca_live_M55NdsQ8sPOJW9rhgY40rANbEJ2y7lU0aZmQIspR";
  const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving data from API:", error);
    res.status(500).send("Error retrieving data from API");
  }
});

// Route to fetch historical exchange rates from the external API
app.get("/api/historical-rates", async (req, res) => {
  const { baseCurrency, targetCurrency, date } = req.query;
  const apiKey = "fca_live_M55NdsQ8sPOJW9rhgY40rANbEJ2y7lU0aZmQIspR";
  const apiUrl = `https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Error retrieving data from API:", error);
    res.status(500).send("Error retrieving data from API");
  }
});

// Route to handle saving favorite currency pairs
app.post("/favorites", async (req, res) => {
  const { baseCurrency, targetCurrency } = req.body;
  try {
    const favorite = await FavoritePair.create({
      baseCurrency,
      targetCurrency,
    });
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch favorite currency pairs
app.get("/favorites", async (req, res) => {
  try {
    const favorites = await FavoritePair.findAll();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server and sync the database
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  sequelize
    .sync()
    .then(() => {
      console.log("Database synced");
    })
    .catch((err) => {
      console.error("Error syncing database:", err);
    });
});
