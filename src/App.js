import logo from "./logo.svg";
import "./App.css";
// material library
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CloudIcon from "@mui/icons-material/Cloud";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
// axios for API requests
import axios from "axios";
import moment from "moment";
import { useTranslation } from "react-i18next";
import "moment/locale/en-gb";
import "moment/locale/ar"; // Import Arabic locale for moment.js

import { createTheme, ThemeProvider } from "@mui/material";
// material library
const theme = createTheme({
  typography: {
    fontFamily: ["IBM"],
  },
});

let cancelAxios = null;

// Define cities with their coordinates and translation keys
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

function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("ar");
  const [selectedCity, setSelectedCity] = useState("rabat"); // Default city
  const [dateTimeUse, setDateTimeUse] = useState("");
  const [temp, setTemp] = useState({
    temp: null,
    description: "",
    min: null,
    max: null,
    icon: "",
  });

  function handleChangeLanguage() {
    const newLang = language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  }

  // Update date and time based on language
  useEffect(() => {
    moment.locale(language);
    let dateTime = moment().format(" dddd , MMMM Do YYYY ");
    setDateTimeUse(dateTime);
  }, [language]);

  // Fetch weather data based on selected city
  useEffect(() => {
    // Find the selected city's coordinates
    const city = cities.find((c) => c.name === selectedCity);
    if (!city) return;

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=f1ba2bfba05c03871e1aee3440ecb724`,
        {
          cancelToken: new axios.CancelToken((c) => {
            cancelAxios = c; // Save the cancel function
          }),
        }
      )
      .then(function (response) {
        // handle success
        const responseTemp = Math.round(response.data.main.temp - 273.15); // Convert Kelvin to Celsius
        const responseDescription = response.data.weather[0].description;
        const responseMin = Math.round(response.data.main.temp_min - 273.15);
        const responseMax = Math.round(response.data.main.temp_max - 273.15);
        const responseIcon = response.data.weather[0].icon;
        const responseFeelsLike = Math.round(
          response.data.main.feels_like - 273.15
        );
        const responseHumidity = response.data.main.humidity;

        setTemp({
          number: responseTemp,
          description: responseDescription,
          min: responseMin,
          max: responseMax,
          feelsLike: responseFeelsLike,
          humidity: responseHumidity,
          icon: responseIcon,
        });
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });

    // Cleanup function to cancel the request if the component unmounts or city changes
    return () => {
      if (cancelAxios) cancelAxios();
    };
  }, [selectedCity]); // Re-run when selectedCity changes

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
          {/* City Selection Dropdown */}
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            style={{ marginBottom: "20px", width: "100%" }}
          >
            <Select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              fullWidth
              style={{ backgroundColor: "white" }}
            >
              {cities.map((city) => (
                <MenuItem key={city.name} value={city.name}>
                  {t(city.name)}
                </MenuItem>
              ))}
            </Select>
          </div>
          {/* CARD */}
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
            {/* CONTENT */}
            <div>
              {/* CITY & TIME */}
              <div
                style={{
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h2">{t(selectedCity)}</Typography>
                <Typography variant="h6" style={{ marginRight: "20px" }}>
                  {dateTimeUse}
                </Typography>
              </div>
              <hr />
              {/* CITY & TIME */}
              {/* DEGREE & DESCRIPTION */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    textAlign: "center",
                    gap: 1,
                    padding: 2,
                  }}
                  dir="rtl"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h2" style={{ textAlign: "center" }}>
                      {temp.number ? `${temp.number}°C` : "Loading..."}
                    </Typography>
                    {temp.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${temp.icon}@2x.png`}
                        alt="Weather icon"
                      />
                    )}
                  </div>
                  <div style={{ marginLeft: "30px" }}>
                    <Typography variant="h6" style={{ textAlign: "center" }}>
                      {t(temp.description)}
                    </Typography>
                  </div>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <h5>
                      {t("min")} : {temp.min ? `${temp.min}°C` : "-"}
                    </h5>
                    <h5>|</h5>
                    <h5>
                      {t("max")} : {temp.max ? `${temp.max}°C` : "-"}
                    </h5>
                  </div>
                </div>
                <CloudIcon style={{ fontSize: "200px" }} />
              </div>
            </div>
            {/*== CONTENT ==*/}
          </div>
          {/*== CARD ==*/}
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            style={{ marginTop: "20px", width: "100%", display: "flex" }}
          >
            <Button
              variant="text"
              style={{ color: "white" }}
              onClick={handleChangeLanguage}
            >
              {language === "en" ? "Arabic" : "إنجليزي"}
            </Button>
          </div>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
