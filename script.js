const apiKey = "7bca8ed057f47f46338959ac48b50404";
let favorites = JSON.parse(localStorage.getItem("favoriteCities") || "[]");
let searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");

function getWeather(cityName) {
  const city = cityName || document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  saveSearch(city);
  localStorage.setItem("lastCity", city);
  document.getElementById("weather").innerHTML = "Loading...";
  document.getElementById("forecast").innerHTML = "Loading forecast...";
  document.getElementById("history").innerHTML = "";
  
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  // Current Weather
  fetch(currentUrl)
    .then(res => res.json())
    .then(data => {
      const { name, main, weather, timezone } = data;
      const temp = main.temp;
      const desc = weather[0].description;
      const icon = weather[0].icon;
      const localTime = new Date(new Date().getTime() + timezone * 1000);
      const timeStr = localTime.toUTCString().slice(-12, -4);

      document.getElementById("weather").innerHTML = `
        <h2>${name}</h2>
        <p>Local Time: ${timeStr}</p>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
        <p><strong>${temp}°C</strong></p>
        <p>${desc}</p>
        <button onclick="saveFavorite('${name}')">⭐ Add to Favorites</button>
      `;
    });

  // 5-Day Forecast
  fetch(forecastUrl)
    .then(res => res.json())
    .then(data => {
      const list = data.list.filter(i => i.dt_txt.includes("12:00:00"));
      let html = `<h3>📅 5-Day Forecast</h3>`;
      list.forEach(f => {
        const date = new Date(f.dt_txt).toLocaleDateString();
        const temp = f.main.temp;
        const icon = f.weather[0].icon;
        const desc = f.weather[0].description;
        html += `
          <div class="forecast-item">
            <p><strong>${date}</strong></p>
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
            <p>${temp}°C</p>
            <p>${desc}</p>
          </div>
        `;
      });
      document.getElementById("forecast").innerHTML = html;
    });

  renderSearchHistory();
}

function saveSearch(city) {
  if (searchHistory.includes(city)) {
    searchHistory = searchHistory.filter(c => c !== city);
  }
  searchHistory.unshift(city);
  if (searchHistory.length > 5) searchHistory.pop();
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function saveFavorite(city) {
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favoriteCities", JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  let html = `<h3>⭐ Favorite Cities</h3>`;
  if (favorites.length === 0) {
    html += `<p>No favorites yet</p>`;
  } else {
    html += `<ul>`;
    favorites.forEach(city => {
      html += `<li><button onclick="getWeather('${city}')">${city}</button></li>`;
    });
    html += `</ul>`;
  }
  document.getElementById("favorites").innerHTML = html;
}

function renderSearchHistory() {
  const container = document.getElementById("history");
  if (searchHistory.length === 0) {
    container.innerHTML = "<h3>🕒 Search History</h3><p>No recent searches</p>";
    return;
  }

  let html = `<h3>🕒 Search History Forecast</h3>`;
  const fetches = searchHistory.map(city =>
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
      .then(res => res.json())
      .then(data => {
        const temp = data.main.temp;
        const icon = data.weather[0].icon;
        const desc = data.weather[0].description;
        return `
          <div class="forecast-item">
            <p><strong>${data.name}</strong></p>
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" />
            <p>${temp}°C</p>
            <p>${desc}</p>
          </div>
        `;
      })
  );

  Promise.all(fetches).then(items => {
    container.innerHTML = html + items.join("");
  });
}

function detectLocation() {
  if (!navigator.geolocation) return getWeather("London");

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => getWeather(data.name))
      .catch(() => getWeather("London"));
  }, () => getWeather("London"));
}

window.onload = () => {
  renderFavorites();
  renderSearchHistory();
  detectLocation();
};
