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
  useMediaQuery,
  Box,
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

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChangeLanguage = () => {
    const newLang = language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  useEffect(() => {
    moment.locale(language);
    setDateTimeUse(moment().format(" dddd , MMMM Do YYYY "));
  }, [language]);

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
              Math.pow(city.lat - userLat, 2) + Math.pow(city.lon - userLon, 2)
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
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: isSmallScreen ? 2 : 4,
          }}
        >
          <Box dir={language === "ar" ? "rtl" : "ltr"} width="100%">
            {isAutoLocating && !selectedCity && (
              <Typography>{t("usingYourLocation")}...</Typography>
            )}
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              fullWidth
              sx={{ backgroundColor: "white", mb: 2 }}
            >
              {cities.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {t(city.name)}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box
            dir={language === "ar" ? "rtl" : "ltr"}
            sx={{
              backgroundColor: "#2196f3",
              p: 3,
              borderRadius: 2,
              width: "100%",
              color: "white",
              boxShadow: 3,
            }}
          >
            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
              <Typography variant={isSmallScreen ? "h4" : "h2"}>
                {t(selectedCity)}
              </Typography>
              <Typography variant="h6">{dateTimeUse}</Typography>
            </Box>
            <hr />
            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
              <Box textAlign="center" p={2} flex={1}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Typography variant={isSmallScreen ? "h4" : "h2"}>
                    {temp.number ? `${temp.number}°C` : "Loading..."}
                  </Typography>
                  {temp.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${temp.icon}@2x.png`}
                      alt="icon"
                    />
                  )}
                </Box>
                <Typography variant="h6">{t(temp.description)}</Typography>
                <Box display="flex" gap={2} justifyContent="center">
                  <Typography>
                    {t("min")}: {temp.min}°C
                  </Typography>
                  <Typography>|</Typography>
                  <Typography>
                    {t("max")}: {temp.max}°C
                  </Typography>
                </Box>
                <Typography>
                  {t("feelsLike")}: {temp.feelsLike}°C
                </Typography>
                <Typography>
                  {t("humidity")}: {temp.humidity}%
                </Typography>
                <Typography>
                  {t("wind")}: {temp.wind} m/s
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flex={1}
              >
                <CloudIcon sx={{ fontSize: isSmallScreen ? 100 : 180 }} />
              </Box>
            </Box>
            {error && (
              <Typography color="error" mt={2}>
                {error}
              </Typography>
            )}
          </Box>

          <Box
            dir={language === "ar" ? "rtl" : "ltr"}
            mt={3}
            display="flex"
            justifyContent="center"
            width="100%"
          >
            <Button
              variant="text"
              color="inherit"
              onClick={handleChangeLanguage}
            >
              {language === "en" ? "Arabic" : "إنجليزي"}
            </Button>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
