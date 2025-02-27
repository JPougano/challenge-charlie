import React, { useState, useEffect } from 'react';
import Search from './components/Search/Search';
import Content from './components/Content/Content';

export default function App() {

  // Área dos states
  const [bingWallpaper, setBingWallpaper] = useState();
  const [userLocation, setUserLocation] = useState({});
  const [weatherInfo, setWeatherInfo] = useState({});
  const [gotUserLocation, setGotUserLocation] = useState(false);
  const [isGeolocationAllowed, setIsGeolocationAllowed] = useState(true);

  // Pegando o papel de parede do bing (alo alo CORS!)
  useEffect(() => {
    let getWallpaper = async () => {
      const allOriginsUrl = 'http://api.allorigins.win/get?url=';
      const bingUrl = 'https://www.bing.com';
      const fullUrl = allOriginsUrl + encodeURIComponent(bingUrl + '/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=pt-BR');

      try {
        fetch(fullUrl)
          .then(res => res.json())
          .then(data => JSON.parse(data.contents))
          .then(info => setBingWallpaper(bingUrl + info.images[0].url));
      } catch {
        throw new Error('Not able to load wallpaper');
      }
    }
    getWallpaper();

  }, [])

  // Pegando as coordenadas da localização atual do usuário.
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((userPosition) => {
      const lat = userPosition.coords.latitude;
      const lng = userPosition.coords.longitude;
      getCurrentLocation(lat, lng);
      setGotUserLocation(true)
    },
      (err) => {
        console.log(err)
        setIsGeolocationAllowed(false)
      })
      // eslint-disable-next-line
  }, [])

  // Transformando as coordenadas do usuário em uma localizaçao, de fato.
  const getCurrentLocation = (lat, lng) => {
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=
              ${lat}+${lng}&key=${process.env.REACT_APP_OPEN_CAGE}`)
      .then(res => res.json())
      .then(info => {
        setUserLocation({
          city: info.results[0].components.municipality,
          state: info.results[0].components.state,
        })
        getWeatherForecast(info.results[0].components.municipality)
      })
      .catch(err => console.log(err))
  }

  // Pegando a previsão do tempo para a localização usuário
  const getWeatherForecast = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&lang=pt_br&appid=${process.env.REACT_APP_OPEN_WEATHER}&units=metric&cnt=16`)
      .then(res => res.json())
      .then(info => {
        setWeatherInfo({
          humidity: info.list[0].main.humidity,
          pressure: info.list[0].main.pressure,
          temp: info.list[0].main.temp,
          weather: info.list[0].weather[0].description[0].toUpperCase() + info.list[0].weather[0].description.slice(1),
          icon: info.list[0].weather[0].icon,
          wind: info.list[0].wind.speed,
          tomorrowTemp: info.list[7].main.temp,
          afterTomorrowTemp: info.list[15].main.temp
        })
      })
      .catch(err => {
        console.log(err)
        alert("Cidade não encontrada! Tente digitar de uma outra forma.")
      })
  }

  // Pegando a localização que o usuário escolheu e atuaizando a previsão do tempo
  // O parametro 'location' vai ser passado pelo componente 'Search'
  const getUserNewLocation = (location) => {
    getWeatherForecast(location)
    console.log(location)
    setGotUserLocation(true)
  }

  return (
    <div className="container" style={{ backgroundImage: `url(${bingWallpaper})` }}>
      <div className="main__container">
        <Search
          userLocation={userLocation}
          setLocation={getUserNewLocation}
          isGeolocAllowed={isGeolocationAllowed}
        />
        <Content
          gotCurrentLocation={gotUserLocation}
          weatherInfo={weatherInfo}
        />
      </div>
    </div>
  )
}
