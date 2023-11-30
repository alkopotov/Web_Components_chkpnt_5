const ICONS = {
  0: 'clear',
  1: 'mainly_clear',
  2: 'partly_cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'rime_fog',
  51: 'drizzle',
  53: 'drizzle',
  55: 'drizzle',
  56: 'freezing_drizzle',
  57: 'freezing_drizzle',
  61: 'light_rain',
  63: 'rain',
  65: 'heavy_rain',
  66: 'freezing_rain',
  67: 'freezing_rain',
  71: 'light_snow',
  73: 'snow',
  75: 'heavy_snow',
  77: 'snow_grains',
  80: 'rain_showers_light',
  81: 'rain_showers',
  82: 'rain_showers_heavy',
  85: 'snow_fall_light',
  86: 'snow_fall_heavy',
  95: 'thunderstorm',
  96: 'thunderstorm_hail',
  99: 'thunderstorm_hail'
}

class WeatherWidget extends HTMLElement {
  constructor() {
    super();
    this.linkCSS = document.createElement('link')
    this.linkCSS.rel = 'stylesheet'
    this.linkCSS.href = 'components/weather-widget/weather-widget.css'

  }
  
  connectedCallback() {

    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(this.linkCSS)

    let default_url = `https://api.open-meteo.com/v1/forecast?latitude=55.7522&longitude=37.6156&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=Europe%2FMoscow`
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationFailure)
    } else {
      getData(url)
    } 

    function locationSuccess(position) {
      let latitude = position.coords.latitude
      let longitude = position.coords.longitude
      getData(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=Europe%2FMoscow`
      )
    }

    function locationFailure(positionError) {
      getData(default_url)
    }


    function getData(url){
      fetch(url)
      .then(res => res.json())
        .catch(err => alert('Ошибка при получении данных'))
        .then(data => {
          renderWidget(data)
        })
          
    }
    

    function renderWidget(data) {
      let currentTemp = data.current.temperature_2m
      let currentHumidity = data.current.relative_humidity_2m
      let currentWeatherCode = data.daily.weather_code[0]
      let currentPrecipitation = data.current.precipitation
      let currentWindSpeed = data.current.wind_speed_10m

      let forecastData = []
      for (let i = 1; i <= 3; i++) {
        forecastData.push({
          date: data.daily.time[i],
          weatherCode: data.daily.weather_code[i],
          minTemp: data.daily.temperature_2m_min[i],
          maxTemp: data.daily.temperature_2m_max[i],
          windSpeed: data.daily.wind_speed_10m_max[i]
        })
      }

      const wrapper = document.createElement('main')

      const currentDay = document.createElement('div')
      currentDay.innerHTML ='<h2>Сейчас</h2>'
      currentDay.className = 'current_day'
      const forecast = document.createElement('div')
      forecast.className = 'forecast_area'


      const currentWeatherPic = document.createElement('img')
      currentWeatherPic.className = 'current_picture'

      const currentTempArea = document.createElement('div')
      currentTempArea.className = 'current_temperature'

      const currentWeatherDescription = document.createElement('table')

      currentDay.append(currentWeatherPic, currentTempArea, currentWeatherDescription)
      wrapper.append(currentDay, forecast)
 
      currentWeatherPic.src = `components/weather-widget/images/${ICONS[currentWeatherCode]}.svg`
      
      currentTempArea.textContent = currentTemp + 'ºC'
      
      currentWeatherDescription.innerHTML = `
      <tbody>
        <tr>
          <td class='text_cell'>Влажность: </td>
          <td>${currentHumidity}%</td>
        </tr>
        <tr>
          <td>Осадки: </td>
          <td>${currentPrecipitation}мм</td>
        </tr>
        <tr>
          <td>Скорость ветра: </td>
          <td>${currentWindSpeed}м/с</td>
        </tr>
      <tbody>
      `
      currentWeatherDescription.className = 'current_weather_description'
      
      function displayForecast(array) {
        for (let elem of array) {
          let dayForecast = document.createElement('div')
          dayForecast.className = 'forecast_card';

          let forecastPicture = document.createElement('img');
          forecastPicture.className = 'forecast_picture';
          forecastPicture.src = `components/weather-widget/images/${ICONS[elem.weatherCode]}.svg`;

          let forecastTemperature = document.createElement('h3');
          forecastTemperature.className = 'forecast_temperature';
          forecastTemperature.textContent = `${elem.minTemp} ... ${elem.maxTemp}ºC`;

          let forecastWind = document.createElement('h3');
          forecastWind.className = 'forecast_wind';
          forecastWind.textContent = `Ветер: ${elem.windSpeed}м/с`;
          
          let forecastDate = document.createElement('h4');
          forecastDate.className = 'date';
          let date = Date.parse(elem.date);
          let formatter = new Intl.DateTimeFormat('ru', {
            day: '2-digit',
            month: 'short'
          });

          forecastDate.textContent = formatter.format(date).slice(0, -1);

          dayForecast.append(forecastPicture, forecastTemperature, forecastWind, forecastDate)
          forecast.append(dayForecast)

        }
      }

      displayForecast(forecastData)


      shadow.append(wrapper)



    }
  }
}

customElements.define('weather-widget', WeatherWidget);