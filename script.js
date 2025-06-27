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
  favoritesInstructions: document.getElementById("favoritesInstructions"),
  sunInfo: document.getElementById("sunInfo"),
  weatherMood: document.getElementById("weatherMood"),
  weatherTips: document.getElementById("weatherTips")
};

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let currentCity = "";

// Traductions
const texts = {
  en: {
    appTitle: "SIRA'S FORECASTING",
    enterCity: "Enter city...",
    nextForecast: "Next 5‑Day Forecast",
    lastForecast: "Last Forecast",
    favoriteCities: "Favorite Cities",
    addFavorite: "Add Current City to Favorites",
    noCityToAdd: "No city loaded to add.",
    alreadyFav: "City already in favorites.",
    notFound: "City not found.",
    instructions: "Click to load, double‑click to remove.",
    time: "Time",
    humidity: "Humidity",
    precipitation: "Precipitation",
    wind: "Wind",
    pressure: "Pressure",
    sunrise: "Sunrise",
    sunset: "Sunset",
    mood_cold: "Brrr, cold! 🥶",
    mood_cool: "Cool weather! 😎",
    mood_warm: "Nice and warm! 😊",
    mood_hot: "It's hot! 🔥",
    safety_cold: "Dress warmly and watch out for ice.",
    safety_rain: "Carry an umbrella, might rain.",
    safety_wind: "Secure loose items outside.",
    safety_heat: "Stay hydrated and avoid sun exposure.",
    safety_clear: "Enjoy clear skies!"
  },
  fr: {
    appTitle: "PRÉVISIONS DE SIRA",
    enterCity: "Entrez la ville...",
    nextForecast: "Prévisions des 5 prochains jours",
    lastForecast: "Dernières prévisions",
    favoriteCities: "Villes favorites",
    addFavorite: "Ajouter la ville actuelle aux favoris",
    noCityToAdd: "Aucune ville chargée à ajouter.",
    alreadyFav: "La ville est déjà dans les favoris.",
    notFound: "Ville non trouvée.",
    instructions: "Cliquez pour charger, double-cliquez pour supprimer.",
    time: "Heure",
    humidity: "Humidité",
    precipitation: "Précipitations",
    wind: "Vent",
    pressure: "Pression",
    sunrise: "Lever du soleil",
    sunset: "Coucher du soleil",
    mood_cold: "Brrr, froid! 🥶",
    mood_cool: "Temps frais! 😎",
    mood_warm: "Doux et agréable! 😊",
    mood_hot: "Il fait chaud! 🔥",
    safety_cold: "Habillez-vous chaudement et attention au verglas.",
    safety_rain: "Prenez un parapluie, il pourrait pleuvoir.",
    safety_wind: "Fixez les objets légers dehors.",
    safety_heat: "Restez hydraté et évitez le soleil.",
    safety_clear: "Profitez d’un ciel dégagé!"
  },
  tr: {
    appTitle: "SIRA'NIN HAVA DURUMU",
    enterCity: "Şehir giriniz...",
    nextForecast: "Önümüzdeki 5 Günlük Tahmin",
    lastForecast: "Son Tahmin",
    favoriteCities: "Favori Şehirler",
    addFavorite: "Mevcut Şehri Favorilere Ekle",
    noCityToAdd: "Eklemek için yüklenmiş şehir yok.",
    alreadyFav: "Şehir zaten favorilerde.",
    notFound: "Şehir bulunamadı.",
    instructions: "Yüklemek için tıklayın, kaldırmak için çift tıklayın.",
    time: "Saat",
    humidity: "Nem",
    precipitation: "Yağış",
    wind: "Rüzgar",
    pressure: "Basınç",
    sunrise: "Gündoğumu",
    sunset: "Günbatımı",
    mood_cold: "Üşüdüm! 🥶",
    mood_cool: "Serin hava! 😎",
    mood_warm: "Hava güzel ve sıcak! 😊",
    mood_hot: "Hava çok sıcak! 🔥",
    safety_cold: "Sıcak giyinin ve buzlu yollara dikkat edin.",
    safety_rain: "Şemsiye alın, yağmur olabilir.",
    safety_wind: "Dışarıdaki hafif eşyaları sabitleyin.",
    safety_heat: "Bol su için ve güneşten kaçının.",
    safety_clear: "Açık hava keyfini çıkarın!"
  }
};

function t(key) {
  return texts[elements.languageSelect.value][key] || texts.en[key] || key;
}

function updateUI() {
  elements.appTitle.textContent = t("appTitle");
  elements.cityInput.placeholder = t("enterCity");
  elements.nextForecastTitle.textContent = t("nextForecast");
  elements.lastForecastTitle.textContent = t("lastForecast");
  elements.favoritesTitle.textContent = t("favoriteCities");
  elements.addFavoriteBtn.textContent = t("addFavorite");
  elements.favoritesInstructions.textContent = t("instructions");
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

function setTemperatureBackground(temp, time, sunset) {
  const body = document.body;
  const isDay = time < sunset;

  if (temp <= 10) {
    body.style.background = isDay
      ? "url('image/snow.jpg') no-repeat center center fixed"
      : "url('image/snownight.jpg') no-repeat center center fixed";
  } else if (temp <= 20) {
    body.style.background = isDay
      ? "url('image/windyday.jpg') no-repeat center center fixed"
      : "url('image/windynight.jpg') no-repeat center center fixed";
  } else if (temp <= 30) {
    body.style.background = isDay
      ? "url('image/sunshine.jpg') no-repeat center center fixed"
      : "url('image/lightsunset.jpg') no-repeat center center fixed";
  } else {
    body.style.background = isDay
      ? "url('image/sunshineinday.jpg') no-repeat center center fixed"
      : "url('image/sun.jpg') no-repeat center center fixed";
  }

  body.style.backgroundSize = "cover";
}

function getMoodAndTips(temp, id) {
  if (temp <= 0) return { mood: t("mood_cold"), tip: t("safety_cold") };
  if (temp <= 20) return {
    mood: t("mood_cool"),
    tip: (id >= 200 && id < 600) ? t("safety_rain") : t("safety_clear")
  };
  if (temp <= 30) return {
    mood: t("mood_warm"),
    tip: (id >= 600 && id < 700) ? t("safety_wind") : t("safety_clear")
  };
  return { mood: t("mood_hot"), tip: t("safety_heat") };
}

async function fetchWeather(city) {
  const lang = elements.languageSelect.value;
  try {
    const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
    const [loc] = await geo.json();
    if (!loc) throw new Error(t("notFound"));
    currentCity = `${loc.name}, ${loc.country}`;

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
  const time = new Date(data.dt * 1000).getTime() / 1000;
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });

  setTemperatureBackground(data.main.temp, data.dt, data.sys.sunset);
  const { mood, tip } = getMoodAndTips(data.main.temp, data.weather[0].id);

  elements.current.innerHTML = `
    <div class="current-top">
      <h2>${currentCity}</h2>
      <p>${t("time")}: ${new Date(data.dt * 1000).toLocaleTimeString(lang)}</p>
    </div>
    <div class="current-middle">
      <img src="images/${data.weather[0].icon}.png" alt="icon">
      <div class="temp-large">${data.main.temp}°C</div>
    </div>
    <div class="current-bottom">
      <div class="weather-metric">${t("humidity")}: ${data.main.humidity}%</div>
      <div class="weather-metric">${t("precipitation")}: ${data.rain?.["1h"] ?? 0} mm</div>
      <div class="weather-metric">${t("wind")}: ${data.wind?.deg ?? "N/A"}°</div>
      <div class="weather-metric">${t("pressure")}: ${data.main.pressure} hPa</div>
    </div>
  `;

  elements.sunInfo.innerHTML = `<p><strong>${t("sunrise")}:</strong> ${sunrise} &nbsp;&nbsp; <strong>${t("sunset")}:</strong> ${sunset}</p>`;
  elements.weatherMood.textContent = mood;
  elements.weatherTips.textContent = tip;
}

function showForecast(data) {
  const lang = elements.languageSelect.value;
  const now = Date.now();

  const past = data.list.filter(i => new Date(i.dt_txt).getTime() < now).slice(-5);
  elements.history.innerHTML = past.map(i => {
    const date = new Date(i.dt * 1000).toLocaleDateString(lang, { weekday: "short", day: "numeric", month: "short" });
    const time = new Date(i.dt * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="forecast-item">
        <div class="forecast-date">${date} ${time}</div>
        <div class="forecast-temp">${Math.round(i.main.temp)}°C</div>
        <img src="images/${i.weather[0].icon}.png" alt="${i.weather[0].description}">
      </div>
    `;
  }).join("");

  const future = Object.values(data.list.reduce((acc, i) => {
    const date = i.dt_txt.split(" ")[0];
    if (!acc[date] || i.dt_txt.endsWith("12:00:00")) acc[date] = i;
    return acc;
  }, {})).slice(0, 5);

  elements.forecast.innerHTML = future.map(i => {
    const date = new Date(i.dt_txt);
    const day = date.toLocaleDateString(lang, { weekday: "long" });
    const time = date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="forecast-row-item">
        <span class="forecast-day">${day} ${time}</span>
        <span class="forecast-temp">${Math.round(i.main.temp)}°C</span>
        <span class="forecast-icon"><img src="images/${i.weather[0].icon}.png" alt="${i.weather[0].description}"></span>
      </div>
    `;
  }).join("");
}

// Auto-complétion avec suggestions dans un menu déroulant
elements.cityInput.addEventListener("input", async () => {
  const q = elements.cityInput.value.trim();
  if (!q) return (elements.suggestions.innerHTML = "");
  try {
    const resp = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(q)}&limit=5&sort=-population`, {
      headers: {
        "X-RapidAPI-Key": geoApiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      }
    });
    const json = await resp.json();
    elements.suggestions.innerHTML = json.data.map(c =>
      `<li class="suggestion-item">${c.city}, ${c.countryCode}</li>`
    ).join("");

    document.querySelectorAll(".suggestion-item").forEach(li => {
      li.onclick = () => {
        elements.cityInput.value = li.textContent;
        elements.suggestions.innerHTML = "";
        fetchWeather(li.textContent);
      };
    });
  } catch {
    elements.suggestions.innerHTML = "";
  }
});

// Clic hors du champ de saisie ou des suggestions ferme la liste
document.addEventListener("click", e => {
  if (!e.target.closest("#cityInput") && !e.target.closest("#suggestions")) {
    elements.suggestions.innerHTML = "";
  }
});

// Recherche au clavier à la touche Entrée
elements.cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (elements.cityInput.value.trim()) fetchWeather(elements.cityInput.value.trim());
    elements.suggestions.innerHTML = "";
  }
});

// Ajouter aux favoris
elements.addFavoriteBtn.onclick = () => {
  if (!currentCity) return alert(t("noCityToAdd"));
  if (favorites.includes(currentCity)) return alert(t("alreadyFav"));
  favorites.push(currentCity);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
};

// Basculer thème sombre/clair
elements.themeToggleBtn.onclick = () => {
  const dark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", dark ? "dark" : "light");
};

// Changement de langue
elements.languageSelect.onchange = () => {
  localStorage.setItem("lang", elements.languageSelect.value);
  updateUI();
  if (currentCity) fetchWeather(currentCity);
};

// Au chargement : récupération de la localisation GPS et initialisation
window.onload = () => {
  const lang = localStorage.getItem("lang") || "en";
  elements.languageSelect.value = lang;
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  updateUI();
  renderFavorites();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
          const [loc] = await res.json();
          if (loc?.name && loc?.country) {
            fetchWeather(`${loc.name}, ${loc.country}`);
          } else {
            fetchWeather("Kyrenia, Cyprus");
          }
        } catch {
          fetchWeather("Kyrenia, Cyprus");
        }
      },
      () => fetchWeather("Kyrenia, Cyprus"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    fetchWeather("Kyrenia, Cyprus");
  }
};
