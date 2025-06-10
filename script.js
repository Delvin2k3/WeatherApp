const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");
const apiKey = "f8a27f189a8289517c65ac7adf340244";

form.addEventListener("submit", e => {
  e.preventDefault();
  let inputVal = input.value.trim();

  const listItems = Array.from(list.querySelectorAll(".city"));
  const isDuplicate = listItems.some(el => {
    const cityName = el.querySelector(".city-name span").textContent.toLowerCase();
    const datasetName = el.querySelector(".city-name").dataset.name.toLowerCase();
    if (inputVal.includes(",")) {
      const [city, country = ""] = inputVal.split(",");
      return datasetName === `${city.trim().toLowerCase()},${country.trim().toLowerCase()}`;
    }
    return cityName === inputVal.toLowerCase();
  });

  if (isDuplicate) {
    msg.textContent = `You already know the weather for ${inputVal}. Try specifying the country code too. 😉`;
    form.reset();
    input.focus();
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const { main, name, sys, weather } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0].icon}.svg`;

      const li = document.createElement("li");
      li.classList.add("city");
      li.innerHTML = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}</span><sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src="${icon}" alt="${weather[0].description}">
          <figcaption>${weather[0].description}</figcaption>
        </figure>
      `;
      list.appendChild(li);
      msg.textContent = "";
    })
    .catch(() => {
      msg.textContent = "Please search for a valid city.";
    });

  form.reset();
  input.focus();
});

document.getElementById("getLocationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    msg.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(fetchWeatherByLocation, showGeoError);
});

function fetchWeatherByLocation(position) {
  const { latitude, longitude } = position.coords;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const { main, name, sys, weather } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0].icon}.svg`;

      const li = document.createElement("li");
      li.classList.add("city");
      li.innerHTML = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <span>${name}</span><sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src="${icon}" alt="${weather[0].description}">
          <figcaption>${weather[0].description}</figcaption>
        </figure>
      `;
      list.appendChild(li);
      msg.textContent = "";
    })
    .catch(() => {
      msg.textContent = "Unable to fetch weather for your location.";
    });
}

function showGeoError(error) {
  const errors = {
    1: "Location access denied.",
    2: "Location unavailable.",
    3: "Location request timed out.",
  };
  msg.textContent = errors[error.code] || "An unknown error occurred.";
}
