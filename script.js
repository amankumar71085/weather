 document.addEventListener('DOMContentLoaded', () => {
            const API_KEY = '541ae5152dc0ed7ed3481c4312dd831b';
            const cityInput = document.getElementById('cityInput');
            const searchBtn = document.getElementById('searchBtn');
            const exploreBtn = document.getElementById('exploreBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const addCityBtn = document.getElementById('addCityBtn');
            const messageDiv = document.getElementById('message');
            const weatherDisplay = document.getElementById('weather-display');

            const myCitiesContainer = document.getElementById('my-cities-container');
            const myCitiesList = document.getElementById('myCitiesList');
            const exploreContainer = document.getElementById('explore-container');
            const exploreList = document.getElementById('exploreList');

            const EXPLORE_CITIES = ['Tokyo', 'Paris', 'New York', 'London', 'Dubai', 'Singapore', 'Istanbul', 'Seoul', 'Sydney', 'Rome'];
            let myCities = [];
            let currentCity = '';

      
            
            const fetchWeatherData = async (url) => {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return await response.json();
                } catch (error) {
                    console.error("Failed to fetch weather data:", error);
                    showMessage(`Could not fetch weather data. Please try again.`);
                    return null;
                }
            };
            
            const getWeatherByCity = async (city) => {
                showMessage('Fetching weather data...');
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
                
                const weatherData = await fetchWeatherData(weatherUrl);
                const forecastData = await fetchWeatherData(forecastUrl);

                if (weatherData && forecastData) {
                    hideMessage();
                    weatherDisplay.classList.remove('hidden');
                    displayCurrentWeather(weatherData);
                    displayForecast(forecastData);
                    currentCity = weatherData.name;
                } else {
                     showMessage(`Could not find weather for "${city}".`);
                     weatherDisplay.classList.add('hidden');
                }
            };

            const getWeatherByCoords = async (lat, lon) => {
                showMessage('Fetching weather for your location...');
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                
                const weatherData = await fetchWeatherData(weatherUrl);
                const forecastData = await fetchWeatherData(forecastUrl);

                if (weatherData && forecastData) {
                    hideMessage();
                    weatherDisplay.classList.remove('hidden');
                    displayCurrentWeather(weatherData);
                    displayForecast(forecastData);
                    currentCity = weatherData.name;
                }
            };

            

            const displayCurrentWeather = (data) => {
                document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
                document.getElementById('weatherDesc').textContent = data.weather[0].description;
                document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
                document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
                document.getElementById('humidity').textContent = `${data.main.humidity}%`;
                document.getElementById('windSpeed').textContent = `${data.wind.speed.toFixed(1)} m/s`;
                document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
            };

            const displayForecast = (data) => {
                const forecastContainer = document.getElementById('forecast');
                forecastContainer.innerHTML = '';
                
              
                const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

                dailyForecasts.forEach(day => {
                    const date = new Date(day.dt * 1000);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'glass-card text-center p-4 rounded-lg flex-shrink-0 w-32';
                    forecastItem.innerHTML = `
                        <p class="font-semibold">${dayName}</p>
                        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Icon" class="mx-auto my-2">
                        <p class="font-bold">${Math.round(day.main.temp)}°C</p>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
            };

            const renderSmallWeatherCard = async (city, container) => {
                 const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY} &units=metric`;
                 const data = await fetchWeatherData(weatherUrl);
                 if(data) {
                    const card = document.createElement('div');
                    card.className = 'glass-card p-4 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-all duration-300';
                    card.innerHTML = `
                        <p class="font-bold">${data.name}</p>
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Icon" class="mx-auto">
                        <p class="text-xl">${Math.round(data.main.temp)}°C</p>
                    `;
                    card.addEventListener('click', () => getWeatherByCity(city));
                    container.appendChild(card);
                 }
            };

            const renderMyCities = () => {
                myCitiesList.innerHTML = '';
                if(myCities.length > 0) {
                    myCitiesContainer.classList.remove('hidden');
                    myCities.forEach(city => renderSmallWeatherCard(city, myCitiesList));
                } else {
                    myCitiesContainer.classList.add('hidden');
                }
            };
            
            const renderExploreCities = () => {
                exploreList.innerHTML = '';
                exploreContainer.classList.remove('hidden');
                showMessage('Loading explore section...');
                const promises = EXPLORE_CITIES.map(city => renderSmallWeatherCard(city, exploreList));
                Promise.all(promises).then(hideMessage);
            };

            
            
            const showMessage = (msg) => {
                messageDiv.textContent = msg;
                messageDiv.classList.remove('hidden');
            };

            const hideMessage = () => {
                messageDiv.textContent = '';
                messageDiv.classList.add('hidden');
            };
            
            const getUserLocation = () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            getWeatherByCoords(latitude, longitude);
                        },
                        (error) => {
                            console.error("Geolocation error:", error);
                            showMessage("Could not get your location. Defaulting to London.");
                            getWeatherByCity('London'); 
                        }
                    );
                } else {
                    showMessage("Geolocation is not supported by your browser. Defaulting to London.");
                    getWeatherByCity('London'); 
                }
            };


            searchBtn.addEventListener('click', () => {
                const city = cityInput.value.trim();
                if (city) {
                    getWeatherByCity(city);
                    cityInput.value = '';
                } else {
                    showMessage('Please enter a city name.');
                }
            });

            cityInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    searchBtn.click();
                }
            });
            
            refreshBtn.addEventListener('click', getUserLocation);

            exploreBtn.addEventListener('click', () => {
                if(exploreContainer.classList.contains('hidden')) {
                    renderExploreCities();
                } else {
                    exploreContainer.classList.add('hidden');
                }
            });

            addCityBtn.addEventListener('click', () => {
                if(currentCity && !myCities.includes(currentCity)) {
                    myCities.push(currentCity);
                    renderMyCities();
                    showMessage(`${currentCity} added to your cities!`);
                    setTimeout(hideMessage, 2000);
                } else if(myCities.includes(currentCity)) {
                    showMessage(`${currentCity} is already in your list.`);
                    setTimeout(hideMessage, 2000);
                }
            });

            getUserLocation();
        });