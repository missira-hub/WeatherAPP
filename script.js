const apiKey = "7bca8ed057f47f46338959ac48b50404"; // 🔁 Replace with your API key

function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      const temp = data.main.temp;
      const desc = data.weather[0].description;
      const icon = data.weather[0].icon;

      document.getElementById("weather").innerHTML = `
        <h2>${data.name}</h2>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">
        <p><strong>${temp}°C</strong></p>
        <p>${desc.charAt(0).toUpperCase() + desc.slice(1)}</p>
      `;
    })
    .catch(error => {
      document.getElementById("weather").innerHTML = `<p style="color: yellow;">${error.message}</p>`;
    });
}
