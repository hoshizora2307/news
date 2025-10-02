const API_KEY = 'c87064f29ceb28115ccf465338fd12ba';
const city = 'Yamanouchi';
const palaceHotelCity = 'Yamanouchi';

const dateDisplay = document.getElementById('date');
const timeDisplay = document.getElementById('time-display');
const indexValue = document.getElementById('index-value');
const indexMessage = document.getElementById('index-message');
const weatherDisplay = document.getElementById('weather');
const cloudsDisplay = document.getElementById('clouds');
const moonPhaseDisplay = document.getElementById('moon-phase');
const cuteCharacter = document.getElementById('cute-character');
const refreshBtn = document.getElementById('refresh-btn');

const palaceWeatherEl = document.getElementById('palace-weather');
const palaceTempEl = document.getElementById('palace-temp');
const palaceHumidityEl = document.getElementById('palace-humidity');

const starCharacters = {
    'excellent': 'url("takase02.png")',
    'good': 'url("takase02.png")',
    'average': 'url("takase02.png")',
    'bad': 'url("takase02.png")',
};

const messages = {
    'excellent': '✨🚀 最高の星空日和だよ！流れ星が見えるかも？',
    'good': '🌠 星が見える条件は整った！',
    'average': '☁️ 今日はちょっと雲が多いみたい…。でも、あきらめないっ！',
    'bad': '☔ 今夜の星空は、、、厳しいですね。。。',
};

document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData();
    fetchPalaceHotelWeather();
    dateDisplay.textContent = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
});

refreshBtn.addEventListener('click', () => {
    fetchWeatherData();
    fetchPalaceHotelWeather();
});

async function fetchWeatherData() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('天気情報を取得できませんでした。APIキーを確認してください。');
        }
        const forecastData = await response.json();
        
        const today = new Date();
        const forecast20h = forecastData.list.find(item => {
            const forecastDate = new Date(item.dt * 1000);
            return forecastDate.getDate() === today.getDate() && forecastDate.getHours() >= 20;
        });

        if (!forecast20h) {
            throw new Error('本日20時の予報が見つかりませんでした。');
        }

        const forecastTime = new Date(forecast20h.dt * 1000);
        timeDisplay.textContent = `本日 ${forecastTime.getHours()}時時点`;

        const moonPhaseValue = calculateMoonPhase(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const starIndex = calculateStarIndex(forecast20h, moonPhaseValue);
        displayStarIndex(starIndex, forecast20h, moonPhaseValue);

    } catch (error) {
        alert('ごめんね！' + error.message);
        clearDisplay();
    }
}

// 志賀パレスホテルの天気予報を取得する関数
async function fetchPalaceHotelWeather() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${palaceHotelCity}&appid=${API_KEY}&lang=ja&units=metric`;
    
    try {
        const response = await fetch(weatherUrl);
        if (!response.ok) {
            throw new Error('志賀パレスホテルの天気情報を取得できませんでした。');
        }
        const data = await response.json();
        
        palaceWeatherEl.textContent = data.weather[0].description;
        palaceTempEl.textContent = `${Math.round(data.main.temp)}°C`;
        palaceHumidityEl.textContent = `${data.main.humidity}%`;
    } catch (error) {
        console.error('Error fetching palace hotel weather:', error);
        palaceWeatherEl.textContent = '--';
        palaceTempEl.textContent = '--°C';
        palaceHumidityEl.textContent = '--%';
    }
}

function calculateMoonPhase(year, month, day) {
    const moonCycle = 29.530589;
    const baseDate = new Date(2000, 0, 6);
    const today = new Date(year, month - 1, day);
    const diffDays = (today - baseDate) / (1000 * 60 * 60 * 24);
    const moonPhase = (diffDays % moonCycle);
    return Math.floor(moonPhase);
}

function calculateStarIndex(data, moonPhaseValue) {
    let index = 0;
    const weatherMain = data.weather[0].main;
    
    if (weatherMain === 'Clear') {
        index += 50;
    } else if (weatherMain === 'Clouds') {
        index += 20;
    } else {
        index = 0;
    }
    
    const clouds = data.clouds.all;
    if (clouds <= 20) {
        index += 30;
    } else if (clouds <= 50) {
        index += 15;
    } else {
        index -= 20;
    }

    if (moonPhaseValue >= 0 && moonPhaseValue <= 3 || moonPhaseValue >= 26) {
        index += 20;
    } else if (moonPhaseValue >= 13 && moonPhaseValue <= 16) {
        index -= 30;
    }

    index = Math.max(0, Math.min(100, index));
    return index;
}

function displayStarIndex(starIndex, data, moonPhaseValue) {
    indexValue.textContent = starIndex;
    const characterKey = getCharacterKey(starIndex);
    indexMessage.textContent = messages[characterKey];
    weatherDisplay.textContent = data.weather[0].description;
    cloudsDisplay.textContent = `${data.clouds.all}%`;
    moonPhaseDisplay.textContent = `${moonPhaseValue}日`;
    cuteCharacter.style.backgroundImage = starCharacters[characterKey];
}

function getCharacterKey(starIndex) {
    if (starIndex >= 80) return 'excellent';
    if (starIndex >= 50) return 'good';
    if (starIndex >= 20) return 'average';
    return 'bad';
}

function clearDisplay() {
    indexValue.textContent = '--';
    indexMessage.textContent = '情報取得中...';
    weatherDisplay.textContent = '--';
    cloudsDisplay.textContent = '--';
    moonPhaseDisplay.textContent = '--';
    cuteCharacter.style.backgroundImage = 'none';
}
