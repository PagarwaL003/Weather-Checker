const userTab = document.querySelector("[data-userWeather");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container")
const errorContainer = document.querySelector(".error-container");
let oldTab = userTab;
const API_key = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");  
getFromSessionStorage();

function switchTab(newTab){
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");
    }

    if(!searchForm.classList.contains("active")){
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
    }
    else{
        // search tab initial , then your weather tab
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");

        // display weather so check local storage for coordinates if saved
        getFromSessionStorage();
    }
}
userTab.addEventListener("click" , () =>{
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click" , () =>{
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// checking if coordinates are present in session storage 
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates"); 
    if(!localCoordinates){
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    } 
};


async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

    // Api call

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        // render data on ui
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        alert("Please search for correct location.");
    }
};


function renderWeatherInfo(weatherInfo){
    // fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]")
    const desc = document.querySelector("[data-weatherDesc]");
    const temp = document.querySelector("[data-temp]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");
    
    // fetch values from weatherInfo object and put it in UI elements
    
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp-273} \u00B0C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloud.innerText = `${weatherInfo?.clouds?.all}%`; 
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        // alert for no geolocation support
        alert("No Geolocation Support !");
    }
};

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates" , JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton = document.querySelector("[data-grantAccess]");

grantAccessButton.addEventListener("click" , getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit" , (e)=>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") return;
    else fetchSearchWeatherInfo(cityName);
    
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response =  await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
        const data = await response.json();
        if(data?.name === undefined){
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");
            return;
        }
        else{
        errorContainer.classList.remove("active");
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        }
    }
    catch(e){
        loadingScreen.classList.remove("active");
        alert("Please try again later");
    }
};
