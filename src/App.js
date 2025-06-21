import "./App.css";
import logo from "./logo.svg";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ar";
import "moment/locale/en-gb";
import { useTranslation } from "react-i18next";

import {
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";

const theme = createTheme({
  typography: {
    fontFamily: ["IBM"],
  },
});

const cities = [
  { name: "rabat", lat: 34.01325, lon: -6.83255 },
  { name: "beni mellal", lat: 32.3373, lon: -6.3498 },
  { name: "sidi slimane", lat: 34.2648, lon: -5.925 },
  { name: "casablanca", lat: 33.5731, lon: -7.5898 },
  { name: "fes", lat: 34.0331, lon: -5.0003 },
  { name: "kenitra", lat: 34.261, lon: -6.5802 },
  { name: "agadir", lat: 30.4202, lon: -9.5982 },
  { name: "dakhla", lat: 23.6848, lon: -15.9579 },
  { name: "tangier", lat: 35.7595, lon: -5.834 },
  { name: "tetouan", lat: 35.5785, lon: -5.3684 },
  { name: "tata", lat: 29.7429, lon: -7.9726 },
  { name: "ouarzazate", lat: 30.9189, lon: -6.8934 },
];

let cancelAxios = null;

function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("ar");
  const [selectedCity, setSelectedCity] = useState("");
  const [isAutoLocating, setIsAutoLocating] = useState(true);
  const [dateTimeUse, setDateTimeUse] = useState("");
  const [temp, setTemp] = useState({
    number: null,
    description: "",
    min: null,
    max: null,
    icon: "",
    feelsLike: null,
    humidity: null,
  });
  const [error, setError] = useState(null);

  // Switch language
  const handleChangeLanguage = () => {
    const newLang = language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  // Set locale format
  useEffect(() => {
    moment.locale(language);
    setDateTimeUse(moment().format(" dddd , MMMM Do YYYY "));
  }, [language]);

  // Detect user location and find closest city
  useEffect(() => {
    const savedCity = localStorage.getItem("city");
    if (savedCity) {
      setSelectedCity(savedCity);
      setIsAutoLocating(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          let closestCity = cities[0];
          let minDistance = Infinity;

          cities.forEach((city) => {
            const d = Math.sqrt(
              Math.pow(city.lat - userLat, 2) +
              Math.pow(city.lon - userLon, 2)
            );
            if (d < minDistance) {
              minDistance = d;
              closestCity = city;
            }
          });

          setSelectedCity(closestCity.name);
          localStorage.setItem("city", closestCity.name);
          setIsAutoLocating(false);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setSelectedCity("rabat");
          setIsAutoLocating(false);
        }
      );
    } else {
      setSelectedCity("rabat");
      setIsAutoLocating(false);
    }
  }, []);

  // Fetch weather data for selected city
  useEffect(() => {
    if (!selectedCity) return;
    const city = cities.find((c) => c.name === selectedCity);
    if (!city) return;

    setError(null);
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=f1ba2bfba05c03871e1aee3440ecb724`,
        {
          cancelToken: new axios.CancelToken((c) => {
            cancelAxios = c;
          }),
        }
      )
      .then((res) => {
        const main = res.data.main;
        const weather = res.data.weather[0];
        const responseWind = res.data.wind?.speed;

        setTemp({
          number: Math.round(main.temp - 273.15),
          description: weather.description,
          min: Math.round(main.temp_min - 273.15),
          max: Math.round(main.temp_max - 273.15),
          icon: weather.icon,
          feelsLike: Math.round(main.feels_like - 273.15),
          humidity: main.humidity,
          wind: responseWind,
        });
      })
      .catch((err) => {
        setError(t("errorFetchingData"));
        console.error(err);
      });

    return () => {
      if (cancelAxios) cancelAxios();
    };
  }, [selectedCity]);

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Container
          maxWidth="sm"
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div dir={language === "ar" ? "rtl" : "ltr"} style={{ width: "100%" }}>
            {isAutoLocating && !selectedCity && (
              <Typography>{t("usingYourLocation")}...</Typography>
            )}
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              fullWidth
              style={{ backgroundColor: "white", marginBottom: 20 }}
            >
              {cities.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {t(city.name)}
                </MenuItem>
              ))}
            </Select>
          </div>

          {/* Weather Card */}
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            style={{
              backgroundColor: "#2196f3",
              padding: "20px",
              borderRadius: "10px",
              width: "100%",
              color: "white",
              boxShadow: "0px 11px 4px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h2">{t(selectedCity)}</Typography>
                <Typography variant="h6">{dateTimeUse}</Typography>
              </div>
              <hr />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ textAlign: "center", padding: 2 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h2">
                      {temp.number ? `${temp.number}°C` : "Loading..."}
                    </Typography>
                    {temp.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${temp.icon}@2x.png`}
                        alt="icon"
                      />
                    )}
                  </div>
                  <Typography variant="h6">{t(temp.description)}</Typography>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    <Typography>{t("min")} : {temp.min}°C</Typography>
                    <Typography>|</Typography>
                    <Typography>{t("max")} : {temp.max}°C</Typography>
                  </div>
                  <Typography>{t("feelsLike")} : {temp.feelsLike}°C</Typography>
                  <Typography>{t("humidity")} : {temp.humidity}%</Typography>
                  <Typography>{t("wind")} : {temp.wind} m/s</Typography>
                </div>
                <CloudIcon style={{ fontSize: "180px" }} />
              </div>
              {error && (
                <Typography color="error" style={{ marginTop: 10 }}>
                  {error}
                </Typography>
              )}
            </div>
          </div>

          <div dir={language === "ar" ? "rtl" : "ltr"} style={{ marginTop: "20px" }}>
            <Button variant="text" style={{ color: "white" }} onClick={handleChangeLanguage}>
              {language === "en" ? "Arabic" : "إنجليزي"}
            </Button>
          </div>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
