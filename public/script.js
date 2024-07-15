const API_KEY = "fca_live_M55NdsQ8sPOJW9rhgY40rANbEJ2y7lU0aZmQIspR";
const BASE_URL = "https://api.freecurrencyapi.com/v1";

// Fetch supported currencies and populate dropdowns
function populateCurrencyDropdowns() {
  fetch(`${BASE_URL}/latest?apikey=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => {
      const symbols = data.data;
      const baseCurrencyDropdown = document.getElementById("base-currency");
      const targetCurrencyDropdown = document.getElementById("target-currency");

      for (const currencyCode of Object.keys(symbols)) {
        const option = document.createElement("option");
        option.value = currencyCode;
        option.textContent = currencyCode;

        baseCurrencyDropdown.appendChild(option.cloneNode(true));
        targetCurrencyDropdown.appendChild(option);
      }
    })
    .catch((error) => console.error("Error fetching currencies:", error));
}

// Fetch exchange rate and perform conversion
function fetchExchangeRate(baseCurrency, targetCurrency) {
  return fetch(
    `${BASE_URL}/latest?apikey=${API_KEY}&base_currency=${baseCurrency}&currencies=${targetCurrency}`
  )
    .then((response) => response.json())
    .then((data) => data.data[targetCurrency])
    .catch((error) => {
      console.error("Error fetching exchange rate:", error);
      return null;
    });
}

function convertCurrency() {
  const baseCurrency = document.getElementById("base-currency").value;
  const targetCurrency = document.getElementById("target-currency").value;
  const amount = document.getElementById("amount").value;

  if (amount <= 0 || isNaN(amount)) {
    alert("Please enter a valid amount.");
    return;
  }

  fetchExchangeRate(baseCurrency, targetCurrency).then((exchangeRate) => {
    if (exchangeRate) {
      const convertedAmount = amount * exchangeRate;
      document.getElementById("converted-amount").textContent =
        convertedAmount.toFixed(2);
    }
  });
}

function fetchHistoricalRates() {
  const baseCurrency = document.getElementById("base-currency").value;
  const targetCurrency = document.getElementById("target-currency").value;
  const date = "2023-01-01"; // Hardcoded date for simplicity

  fetch(
    `${BASE_URL}/historical?apikey=${API_KEY}&base_currency=${baseCurrency}&currencies=${targetCurrency}&date=${date}`
  )
    .then((response) => response.json())
    .then((data) => {
      const rate = data.data[date][targetCurrency];
      document.getElementById(
        "historical-rates-container"
      ).textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
    })
    .catch((error) => console.error("Error fetching historical rates:", error));
}

function saveFavoritePair() {
  const baseCurrency = document.getElementById("base-currency").value;
  const targetCurrency = document.getElementById("target-currency").value;

  fetch("http://localhost:3000/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseCurrency, targetCurrency }),
  })
    .then((response) => response.json())
    .then((favorite) => {
      const favoritePairsContainer = document.getElementById(
        "favorite-currency-pairs"
      );
      const favoriteButton = document.createElement("button");
      favoriteButton.textContent = `${favorite.baseCurrency}/${favorite.targetCurrency}`;
      favoriteButton.addEventListener("click", () => {
        document.getElementById("base-currency").value = favorite.baseCurrency;
        document.getElementById("target-currency").value =
          favorite.targetCurrency;
        convertCurrency();
      });
      favoritePairsContainer.appendChild(favoriteButton);
    })
    .catch((error) => console.error("Error saving favorite pair:", error));
}

function fetchFavorites() {
  fetch("http://localhost:3000/favorites")
    .then((response) => response.json())
    .then((favorites) => {
      const favoritePairsContainer = document.getElementById(
        "favorite-currency-pairs"
      );
      favoritePairsContainer.innerHTML = "";

      favorites.forEach((favorite) => {
        const button = document.createElement("button");
        button.textContent = `${favorite.baseCurrency} - ${favorite.targetCurrency}`;
        button.addEventListener("click", () => {
          document.getElementById("base-currency").value =
            favorite.baseCurrency;
          document.getElementById("target-currency").value =
            favorite.targetCurrency;
          convertCurrency();
        });
        favoritePairsContainer.appendChild(button);
      });
    })
    .catch((error) => console.error("Error fetching favorites:", error));
}

document.getElementById("amount").addEventListener("input", convertCurrency);
document
  .getElementById("base-currency")
  .addEventListener("change", convertCurrency);
document
  .getElementById("target-currency")
  .addEventListener("change", convertCurrency);
document
  .getElementById("historical-rates")
  .addEventListener("click", fetchHistoricalRates);
document
  .getElementById("save-favorite")
  .addEventListener("click", saveFavoritePair);

// Call the function to populate the dropdowns when the page loads
document.addEventListener("DOMContentLoaded", () => {
  populateCurrencyDropdowns();
  fetchFavorites();
});
