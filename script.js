const apiKey = "7bca8ed057f47f46338959ac48b50404";
const geoApiKey = "f6b1903b90msh474b507c5022e2cp117caajsn75c2fc4e9bc0";

const elements = {
  cityInput: document.getElementById("cityInput"),
  suggestions: document.getElementById("suggestions"),
  current: document.getElementById("current"),
  history: document.getElementById("history"),
  forecast: document.getElementById("forecast"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  languageSelect: document.getElementById("languageSelect"),
  favoritesList: document.getElementById("favoritesList"),
  addFavoriteBtn: document.getElementById("addFavoriteBtn"),
  appTitle: document.getElementById("appTitle"),
  nextForecastTitle: document.getElementById("nextForecastTitle"),
  lastForecastTitle: document.getElementById("lastForecastTitle"),
  favoritesTitle: document.getElementById("favoritesTitle"),
  favoritesInstructions: document.getElementById("favoritesInstructions")
};

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentCity = "";

const texts = {
  en: {
    appTitle: "Weather App",
    enterCity: "Enter city...",
    nextForecast: "Next 5‑Day Forecast",
    lastForecast: "Last Forecast",
    favoriteCities: "Favorite Cities",
    addFavorite: "Add Current City to Favorites",
    noCityToAdd: "No city loaded to add.",
    alreadyFav: "City already in favorites.",
    notFound: "City not found.",
    toggleDark: "Toggle Dark Mode",
    selectLanguage: "Select Language",
    instructions: "Click to load, double‑click to remove.",
    temp: "Temp",
    humidity: "Humidity",
    precipitation: "Precipitation",
    time: "Time"
  },
  fr: {
    appTitle: "Application Météo",
    enterCity: "Entrez la ville...",
    nextForecast: "Prévisions sur 5 jours",
    lastForecast: "Derniers previsions",
    favoriteCities: "Villes favorites",
    addFavorite: "Ajouter la ville actuelle",
    noCityToAdd: "Aucune ville à ajouter.",
    alreadyFav: "Ville déjà en favoris.",
    notFound: "Ville introuvable.",
    toggleDark: "Mode sombre",
    selectLanguage: "Choisir la langue",
    instructions: "Cliquez pour charger, double‑cliquez pour supprimer.",
    temp: "Température",
    humidity: "Humidité",
    precipitation: "Précipitations",
    time: "Heure"
  },
  tr: {
    appTitle: "Hava Durumu Uygulaması",
    enterCity: "Şehir girin...",
    nextForecast: "Önümüzdeki 5 Günlük Tahmin",
    lastForecast: "Son 5 Gün",
    favoriteCities: "Favori Şehirler",
    addFavorite: "Şehri Favorilere Ekle",
    noCityToAdd: "Eklemek için şehir yok.",
    alreadyFav: "Şehir zaten favorilerde.",
    notFound: "Şehir bulunamadı.",
    toggleDark: "Karanlık Mod",
    selectLanguage: "Dil Seçin",
    instructions: "Yüklemek için tıkla, kaldırmak için çift tıkla.",
    temp: "Sıcaklık",
    humidity: "Nem",
    precipitation: "Yağış",
    time: "Saat"
  }
};

function t(key) {
  return texts[elements.languageSelect.value][key];
}

function updateUI() {
  const lang = elements.languageSelect.value;
  elements.appTitle.textContent = t("appTitle");
  elements.cityInput.placeholder = t("enterCity");
  elements.nextForecastTitle.textContent = t("nextForecast");
  elements.lastForecastTitle.textContent = t("lastForecast");
  elements.favoritesTitle.textContent = t("favoriteCities");
  elements.addFavoriteBtn.textContent = t("addFavorite");
  elements.favoritesInstructions.textContent = t("instructions");
  elements.themeToggleBtn.title = t("toggleDark");
  elements.languageSelect.title = t("selectLanguage");
}

function renderFavorites() {
  elements.favoritesList.innerHTML = "";
  favorites.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.onclick = () => fetchWeather(city);
    li.ondblclick = () => {
      favorites = favorites.filter(c => c !== city);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    };
    elements.favoritesList.appendChild(li);
  });
}

async function fetchWeather(city) {
  const lang = elements.languageSelect.value;
  try {
    const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
    const [loc] = await geo.json();
    if (!loc) throw new Error(t("notFound"));
    currentCity = `${loc.name}, ${loc.country}`;
    map.setView([loc.lat, loc.lon], 10);
    const [curRes, forRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&units=metric&lang=${lang}&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lon}&units=metric&lang=${lang}&appid=${apiKey}`)
    ]);
    const cur = await curRes.json();
    const forC = await forRes.json();
    showCurrent(cur);
    showForecast(forC);
  } catch {
    alert(t("notFound"));
  }
}

function showCurrent(data) {
  const lang = elements.languageSelect.value;
  elements.current.innerHTML = `
    <h2>${currentCity}</h2>
    <img src="images/${data.weather[0].icon}.png" alt="weather icon">
    <div class="card">${t("temp")}: ${data.main.temp}°C</div>
    <div class="card">${t("humidity")}: ${data.main.humidity}%</div>
    <div class="card">${t("precipitation")}: ${data.rain?.["1h"] ?? 0} mm</div>
    <div class="card">${t("time")}: ${new Date(data.dt * 1000).toLocaleTimeString(lang)}</div>
  `;
}

function showForecast(data) {
  const lang = elements.languageSelect.value;
  const now = Date.now();
  const past = data.list.filter(i => new Date(i.dt_txt).getTime() < now).slice(-5);
  const future = Object
    .values(data.list.reduce((acc, i) => {
      const d = i.dt_txt.split(" ")[0];
      if (!acc[d] || i.dt_txt.endsWith("12:00:00")) acc[d] = i;
      return acc;
    }, {}))
    .slice(0, 5);

  elements.history.innerHTML = past.map(i => `
    <div class="forecast-item">
      <strong>${new Date(i.dt * 1000).toLocaleDateString(lang)}</strong><br>
      ${i.main.temp}°C<br>
      <img src="images/${i.weather[0].icon}.png" alt="weather icon">
    </div>
  `).join("");

  elements.forecast.innerHTML = future.map(i => `
    <div class="forecast-item">
      <strong>${new Date(i.dt * 1000).toLocaleDateString(lang)}</strong><br>
      ${i.main.temp}°C<br>
      <img src="images/${i.weather[0].icon}.png" alt="weather icon">
    </div>
  `).join("");
}

// ----------- MODIFIED SUGGESTIONS HANDLING -----------

elements.cityInput.addEventListener("input", async () => {
  const q = elements.cityInput.value.trim();
  if (!q) {
    elements.suggestions.innerHTML = "";
    elements.suggestions.style.display = "none";
    return;
  }
  try {
    const resp = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=5&sort=-population`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": geoApiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      }
    });
    const json = await resp.json();
    if (!json.data.length) {
      elements.suggestions.innerHTML = "";
      elements.suggestions.style.display = "none";
      return;
    }
    elements.suggestions.innerHTML = json.data.map(c =>
      `<li class="suggestion-item">${c.city}, ${c.countryCode}</li>`
    ).join("");
    elements.suggestions.style.display = "block";

    elements.suggestions.querySelectorAll(".suggestion-item").forEach(li => {
      li.onclick = () => {
        elements.cityInput.value = li.textContent;
        elements.suggestions.innerHTML = "";
        elements.suggestions.style.display = "none";
        fetchWeather(elements.cityInput.value.trim());
      };
    });
  } catch {
    elements.suggestions.innerHTML = "";
    elements.suggestions.style.display = "none";
  }
});

// Hide suggestions if clicked outside input or suggestions
document.addEventListener("click", e => {
  if (!e.target.closest("#cityInput") && !e.target.closest("#suggestions")) {
    elements.suggestions.innerHTML = "";
    elements.suggestions.style.display = "none";
  }
});

elements.cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    elements.suggestions.innerHTML = "";
    elements.suggestions.style.display = "none";
    if (elements.cityInput.value.trim()) fetchWeather(elements.cityInput.value.trim());
  }
});

// ----------------------------

elements.addFavoriteBtn.onclick = () => {
  if (!currentCity) return alert(t("noCityToAdd"));
  if (favorites.includes(currentCity)) return alert(t("alreadyFav"));
  favorites.push(currentCity);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
};

elements.themeToggleBtn.onclick = () => {
  const dark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", dark ? "dark" : "light");
};

elements.languageSelect.onchange = () => {
  localStorage.setItem("lang", elements.languageSelect.value);
  updateUI();
  if (currentCity) fetchWeather(currentCity);
};

// Map setup
const map = L.map("map").setView([0, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Initial load
window.onload = () => {
  const lang = localStorage.getItem("lang") || "en";
  elements.languageSelect.value = lang;
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
  updateUI();
  renderFavorites();

  if (navigator.geolocation) {
    console.log("Geolocation available, requesting position...");
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        console.log("Location:", latitude, longitude);

        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
          const [data] = await res.json();
          console.log("Reverse geocode result:", data);

          if (data?.name && data?.country) {
            const city = `${data.name}, ${data.country}`;
            fetchWeather(city);
          } else {
            console.warn("Fallback: Unable to detect location.");
            fetchWeather("New York");
          }
        } catch (err) {
          console.error("Error in reverse geolocation:", err);
          fetchWeather("New York");
        }
      },
      error => {
        console.error("Geolocation error:", error.message);
        alert("Geolocation error: " + error.message);
        fetchWeather("New York");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    console.warn("Geolocation not supported.");
    fetchWeather("New York");
  }
};
