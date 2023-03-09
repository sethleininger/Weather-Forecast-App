//selects the search form element from the HTML and assigns it to a variable
let searchCitySubmit = document.querySelector("#search-city");
//let searchInput = document.querySelector("#city-name");
let pastResults = document.querySelector("#past-results");
//api key for openweather app 
let APIKey = "2d2124b6fc9e763e0e3055eb853ad8f0";
let city;
//takes a request URL and fetches data from the OpenWeather API based on the URL, then prints the weather or forecast data in the browser
const searchApi = function (requestUrl) {
    console.log(requestUrl);
    fetch(requestUrl)
        .then((response) => {
            if (!response.ok) {
                throw response.json()
            }

            return response.json();
        })
        .then((data) => {
            //console.log(data);
            console.log('Fetch Response \n----------------');

            if (requestUrl.includes('geo')) {
                getGeo(data);
                saveToLocalStorage(data);
            } else if (requestUrl.includes('2.5/weather')) {
                printWeather(data);
            } else if (requestUrl.includes('forecast')) {
                printForecast(data);
            }
        })
        .catch(function (error) {
            console.error(error);
        });
}
//takes location data from the OpenWeather API and uses it to fetch a five-day forecast for that location 
let getGeo = (data) => {
    //console.log(data);
    let lat = data[0].lat;
    //console.log(lat);
    let lon = data[0].lon;
    //console.log(lon);

    let fiveDayForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=imperial`
    searchApi(fiveDayForecast);


}
//takes weather data from the OpenWeather API and prints it in the browser
let printWeather = (data) => {
    console.log(data);
    let cityTemp = data.main.temp;
    console.log(cityTemp);
    let currentTemp = document.querySelector("#temp");
    currentTemp.textContent = "Temp: " + cityTemp + "°F";

    let windSpeed = data.wind.speed;
    console.log(windSpeed);
    let currentWind = document.querySelector("#wind");
    currentWind.textContent = "Wind: " + windSpeed + " mph";


    let humidity = data.main.humidity;
    console.log(humidity);
    let currentHumidity = document.querySelector("#humidity");
    currentHumidity.textContent = "Humidity: " + humidity + "%";

    let forecastIcon = document.querySelector("#current-weather-icon");
    const icon = data.weather[0].icon;
    var iconUrl = 'http://openweathermap.org/img/wn/' + icon + '@4x.png'
    forecastIcon.setAttribute('src', iconUrl);

    var now = dayjs();
    let nowDate = document.querySelector("#today-date");
    nowDate.textContent = now;

    let currentCity = data.name;
    let city = document.querySelector("#current-city");
    city.textContent = currentCity;

}
//takes forecast data from the OpenWeather API and prints it in the browser
let printForecast = (data) => {
    console.log(data);
    data = data.list;
    let forcastArr = [data.slice(2, 3), data.slice(10, 11), data.slice(18, 19), data.slice(26, 27), data.slice(34, 35)];

    let tempClass = document.getElementsByClassName('temp');
    let windClass = document.getElementsByClassName('wind');
    let humidityClass = document.getElementsByClassName('humidity');
    let forecastIcon = document.getElementsByClassName('icon');
    let forecastTime = document.getElementsByClassName('time');
    //console.log(tempClass);
    for (var i = 0; i < forcastArr.length; i++) {
        const forecastTemp = forcastArr[i][0].main.temp;
        const forecastWind = forcastArr[i][0].wind.speed;
        const forecastHum = forcastArr[i][0].main.humidity;
        const icon = forcastArr[i][0].weather[0].icon;
        const forecastTimeDate = forcastArr[i][0].dt_txt;
        //changing date/time
        const forecastDate = new Date(forecastTimeDate);
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = forecastDate.toLocaleDateString('en-US', options);

        // console.log(forecastTemp);
        // console.log(forecastWind);
        // console.log(forecastHum);

        tempClass[i].textContent = "Temp: " + forecastTemp + "°F";
        windClass[i].textContent = "Wind: " + forecastWind + " mph"
        humidityClass[i].textContent = "Humidity: " + forecastHum + "%";

        var iconUrl = 'http://openweathermap.org/img/wn/' + icon + '@2x.png'
        forecastIcon[i].setAttribute('src', iconUrl);

        forecastTime[i].textContent = formattedDate;
    }
}

//takes the user's input from the search form and uses it to fetch weather and forecast data from the OpenWeather API
const handleFormSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    let requestUrl = 'https://api.openweathermap.org/'
    let cityName = document.querySelector('#city-name').value.trim();
    cityName = cityName.toLowerCase().replace(' ', '-');



    requestUrl = requestUrl.concat(`geo/1.0/direct?limit=1&q=${cityName}&appid=${APIKey}`);
    searchApi(requestUrl);

    let currentForecast = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}&units=imperial`;
    searchApi(currentForecast);

    document.querySelector('#city-name').value = "";
}
//saves search history data to the browser's local storage, which can be accessed later to display past search results.
function saveToLocalStorage(data) {

    let savedCities = localStorage.getItem('cities');
    if (savedCities) {
        savedCities = JSON.parse(savedCities);
    } else {
        savedCities = [];
    }

    console.log("test");

    let lat = data[0].lat;
    let lon = data[0].lon;
    let object = {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name
    };
    console.log(object);
    console.log(savedCities);
    savedCities.push(object);
    localStorage.setItem('cities', JSON.stringify(savedCities));

    console.log(savedCities);

    readProjectsFromStorage();
}

function readProjectsFromStorage() {

    let savedCities = localStorage.getItem('cities');
    if (savedCities) {
        savedCities = JSON.parse(savedCities);
    } else {
        savedCities = [];
    }

    let pastResults = document.querySelector("#past-results");
    pastResults.innerHTML = "";
    savedCities.forEach(city => {
        console.log(city);
        let cityButton = document.createElement("button");
        cityButton.textContent = city.name;
        cityButton.classList.add("btn", "btn-secondary", "mb-2");
        cityButton.addEventListener("click", (event) => {
            event.stopPropagation();
            let cityRequestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${APIKey}&units=imperial`;
            searchApi(cityRequestUrl);

            let forcastRequestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${APIKey}&units=imperial`
            searchApi(forcastRequestUrl);

        });
        pastResults.appendChild(cityButton);
    });

}
//deletes local storage when page is reloaded
window.addEventListener('beforeunload', () => {
    window.localStorage.clear();
});


searchCitySubmit.addEventListener('submit', handleFormSubmit);
