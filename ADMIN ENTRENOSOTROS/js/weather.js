/* ==========================================================================
   ADMIN ENTRE NOSOTROS - CLIMA Y RELOJ EN VIVO
   Geolocalización, API de Clima (OpenWeather / Open-Meteo) y Reloj Digital
   ========================================================================== */

const OPENWEATHER_STORAGE_KEY = '@admin_openweather_api_key';

// Iniciar reloj digital y fecha en vivo
function startLiveClock() {
  const timeEl = document.getElementById('live-time');
  const dateEl = document.getElementById('live-date');

  function update() {
    const now = new Date();

    // Formato de hora con segundos: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (timeEl) {
      timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Formato de fecha en español: Lunes, 19 de Octubre de 2026
    if (dateEl) {
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const formatted = now.toLocaleDateString('es-MX', options);
      // Capitalizar primera letra
      dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  }

  update();
  setInterval(update, 1000);
}

// Inicializar el widget del clima
function initWeatherWidget() {
  const refreshBtn = document.getElementById('btn-refresh-weather');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchWeatherWithGeolocation(true);
    });
  }

  fetchWeatherWithGeolocation(false);
}

// Solicitar ubicación con navigator.geolocation
function fetchWeatherWithGeolocation(isManual = false) {
  const locationEl = document.getElementById('weather-location');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const iconEl = document.getElementById('weather-icon');
  const detailsEl = document.getElementById('weather-details');

  if (descEl) descEl.textContent = 'Detectando ubicación...';

  if (!navigator.geolocation) {
    fallbackWeather('Geolocalización no soportada por el navegador.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchWeatherData(latitude, longitude);
    },
    (error) => {
      console.warn('Permiso de geolocalización denegado o error:', error.message);
      // Usar coordenadas por defecto (Ciudad de México / Centro de operaciones)
      fetchWeatherData(19.4326, -99.1332, 'Ciudad de México (Predeterminada)');
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

// Consultar datos de clima en vivo
async function fetchWeatherData(lat, lon, fallbackCityName = null) {
  const locationEl = document.getElementById('weather-location');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const iconEl = document.getElementById('weather-icon');
  const detailsEl = document.getElementById('weather-details');

  const customApiKey = localStorage.getItem(OPENWEATHER_STORAGE_KEY);

  // Si el usuario configuró una clave de OpenWeatherMap, usarla
  if (customApiKey && customApiKey.trim().length > 10) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${customApiKey.trim()}&units=metric&lang=es`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        renderWeatherUI({
          city: data.name || fallbackCityName || 'Tu Ubicación',
          temp: Math.round(data.main.temp),
          desc: data.weather[0]?.description || 'Clima actual',
          iconCode: data.weather[0]?.icon,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6) // km/h
        });
        return;
      }
    } catch (err) {
      console.warn('Error con OpenWeather API, recurriendo a Open-Meteo:', err);
    }
  }

  // Backend de clima en vivo gratuito Open-Meteo (Sin requerir API key para disponibilidad 100% inmediata)
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const response = await fetch(weatherUrl);
    if (!response.ok) throw new Error('Error en API de clima');

    const data = await response.json();
    const current = data.current;

    // Obtener nombre de la ciudad vía geocodificación inversa
    let cityName = fallbackCityName || 'Ubicación Actual';
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        cityName =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.municipality ||
          geoData.address?.state ||
          cityName;
      }
    } catch {
      // Ignorar fallo de geocodificación secundaria
    }

    const { desc, iconClass } = parseWmoWeatherCode(current.weather_code);

    renderWeatherUI({
      city: cityName,
      temp: Math.round(current.temperature_2m),
      desc: desc,
      iconClass: iconClass,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m)
    });
  } catch (error) {
    console.error('Error al obtener clima:', error);
    fallbackWeather('No se pudo sincronizar el clima');
  }
}

// Traducir código WMO a texto e icono FontAwesome
function parseWmoWeatherCode(code) {
  switch (code) {
    case 0:
      return { desc: 'Cielo despejado', iconClass: 'fa-sun' };
    case 1:
    case 2:
      return { desc: 'Parcialmente nublado', iconClass: 'fa-cloud-sun' };
    case 3:
      return { desc: 'Nublado', iconClass: 'fa-cloud' };
    case 45:
    case 48:
      return { desc: 'Niebla o neblina', iconClass: 'fa-smog' };
    case 51:
    case 53:
    case 55:
      return { desc: 'Llovizna ligera', iconClass: 'fa-cloud-rain' };
    case 61:
    case 63:
    case 65:
      return { desc: 'Lluvia constante', iconClass: 'fa-cloud-showers-heavy' };
    case 80:
    case 81:
    case 82:
      return { desc: 'Chubascos', iconClass: 'fa-cloud-sun-rain' };
    case 95:
    case 96:
    case 99:
      return { desc: 'Tormenta eléctrica', iconClass: 'fa-cloud-bolt' };
    default:
      return { desc: 'Clima agradable', iconClass: 'fa-cloud-sun' };
  }
}

// Pintar datos en el DOM
function renderWeatherUI({ city, temp, desc, iconClass, iconCode, humidity, windSpeed }) {
  const locationEl = document.getElementById('weather-location');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  const iconEl = document.getElementById('weather-icon');
  const detailsEl = document.getElementById('weather-details');

  if (locationEl) {
    locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city}`;
  }
  if (tempEl) {
    tempEl.textContent = `${temp}`;
  }
  if (descEl) {
    descEl.textContent = desc;
  }
  if (iconEl) {
    if (iconClass) {
      iconEl.className = `fa-solid ${iconClass} weather-icon-box`;
    } else {
      iconEl.className = `fa-solid fa-cloud-sun weather-icon-box`;
    }
  }
  if (detailsEl) {
    detailsEl.innerHTML = `
      <span><i class="fa-solid fa-droplet"></i> Humedad: ${humidity}%</span>
      <span><i class="fa-solid fa-wind"></i> Viento: ${windSpeed} km/h</span>
    `;
  }
}

function fallbackWeather(msg) {
  const descEl = document.getElementById('weather-desc');
  if (descEl) descEl.textContent = msg;
}

window.AdminWeather = {
  startLiveClock,
  initWeatherWidget,
  fetchWeatherWithGeolocation
};
