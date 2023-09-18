document.addEventListener('DOMContentLoaded', () => {
    const cityElements = document.querySelectorAll('.city');
    const submitButton = document.querySelector('#submit-button');

    function WeatherData(type, value, time, unit, place) {
      this.type = type;
      this.value = value;
      this.time = time;
      this.unit = unit;
      this.place = place;
    }
    
    function Precipitation(type, value, time, unit, place, precipitationType) {
      WeatherData.call(this, type, value, time, unit, place);
      this.precipitationType = precipitationType;
    }

    cityElements.forEach((element) => {
      element.addEventListener('click', () => {
        const cityName = element.getAttribute('data-city');
        fetchWeatherForecast(cityName, 'wind speed', updateWindTable);
        fetchWeatherForecast(cityName, 'temperature', updateTemperatureTable);
        fetchWeatherForecast(cityName, 'precipitation', updatePrecipitationTable);
        fetchWeatherForecast(cityName, 'cloud coverage', updateCloudTable);
        fetchWeatherData(cityName, "temperature", updateMinMaxTemperature);
        fetchWeatherData(cityName, "precipitation", updateTotalPrecipitation);
        fetchWeatherData(cityName, "wind speed", updateAverageWindSpeed)
      });
    });

    submitButton.addEventListener('click', function() {
      const precip = createWeatherObject();
      console.log(precip);
      sendData(precip);
    });


    function fetchWeatherForecast(cityName, dataType, updateFunction) {
      fetch(`/forecast/${cityName}/${dataType}`)
        .then((response) => response.text())
        .then((data) => {
          console.log(data);
          updateFunction(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    function fetchWeatherData(cityName, dataType, updateFunction) {
      fetch(`/data/${cityName}/${dataType}`)
        .then((response) => response.text())
        .then((data) => {
          const parsedData = JSON.parse(data);
          console.log(getLatestDayWeatherEntries(data));
          const weatherObjects = parsedData.map((entry) => {
            if (entry.type === 'precipitation') {
              return new Precipitation(
                entry.type,
                entry.value,
                entry.time,
                entry.unit,
                entry.place,
                entry.precipitation_type
              );
            } else {
              return new WeatherData(
                entry.type,
                entry.value,
                entry.time,
                entry.unit,
                entry.place
              );
            }
          });
          
          updateFunction(weatherObjects);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    function sendData(precipitation) {
      const url = "http://localhost:8080/data/";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(precipitation),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Request failed with status: " + response.status);
          }
        })
        .then((data) => {
          console.log("Data sent successfully:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }

    function precipitationToJSON(precipitation) {
      return JSON.stringify({
        type: precipitation.type,
        value: precipitation.value,
        time: precipitation.time,
        unit: precipitation.unit,
        place: precipitation.place,
        precipitationType: precipitation.precipitationType
      });
    }
    
    function createWeatherObject(){
      const value = document.getElementById('value').value;
      const time = document.getElementById('time').value;
      const type = document.getElementById('type').value;
      const unit = document.getElementById('unit').value;
      const place = document.getElementById('place').value;

      return new WeatherData(type, value, time, unit, place);
    }

    function updateAverageWindSpeed(weatherObjects){
      const averageWindSpeedInfo = document.getElementById('avg-wind-speed');
      const averageWindSpeed = calculateAverageWindSpeed(weatherObjects);

      averageWindSpeedInfo.textContent = `Average wind speed for the last day: ${averageWindSpeed} m/s`
    }

    function updateMinMaxTemperature(data) {
      const temperatureMinInfo = document.getElementById('min-temperature');
      const temperatureMaxInfo = document.getElementById('max-temperature');
      const lowestTemp = findLowestTemperature(data);
      const highestTemp = findHighestTemperature(data);
      console.log(lowestTemp + " " + highestTemp)

      temperatureMinInfo.textContent = `Maximum temperature for the last day: ${lowestTemp} C`
      temperatureMaxInfo.textContent = `Minimum temperature for the last day: ${highestTemp} C`
    }

    function updateTotalPrecipitation(weatherObjects) {
      const precipitationMaxInfo = document.getElementById('max-precipitation');
      const sumOfValues = calculateSumOfValues(weatherObjects);

      precipitationMaxInfo.textContent = `Total precipitation for the last day: ${sumOfValues} mm`

    }

    function calculateAverageWindSpeed(data) {
      let sum = 0;
      let count = 0; 
    
      for (let i = 0; i < data.length; i++) {
        if (data[i].hasOwnProperty('value')) {
          sum += data[i].value;
          count++;
        }
      }
    
      const average = count > 0 ? sum / count : 0;
      return parseFloat(average.toFixed(2));
    }

    function calculateSumOfValues(data) {
      let sum = 0;
    
      for (let i = 0; i < data.length; i++) {
        if (data[i].hasOwnProperty('value')) {
          sum += data[i].value;
        }
      }
    
      return parseFloat(sum.toFixed(2));
    }

    function findLowestTemperature(weatherObjects) {
      let lowestTemperature = weatherObjects[0].value;
      console.log(lowestTemperature)
      for (let i = 1; i < weatherObjects.length; i++) {
        if (weatherObjects[i].value < lowestTemperature) {
          lowestTemperature = weatherObjects[i].value;
        }
      }
    
      return lowestTemperature;
    }

    function findHighestTemperature(weatherObjects) {
      let highestTemperature = weatherObjects[0].value;
    
      for (let i = 1; i < weatherObjects.length; i++) {
        if (weatherObjects[i].value > highestTemperature) {
          highestTemperature = weatherObjects[i].value;
        }
      }
    
      return highestTemperature;
    }

    function updateWindTable(data) {
      const windForecastTable = document.querySelector('.wind-table');
    
      windForecastTable.innerHTML = '';
    
      const caption = document.createElement('caption');
      caption.textContent = 'Wind Forecast';
      windForecastTable.appendChild(caption);
    
      // ReCreate table headers
      // That was the only way i found to not allow duplicates which didnt take 19012931939129 lines of code ;d
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Time', 'From To', 'Directions', 'Unit'];
    
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
    
      thead.appendChild(headerRow);
      windForecastTable.appendChild(thead);
    
      const parsedData = JSON.parse(data);
    
      for (var i = 0; i < parsedData.length; i++) {
        const currentItem = parsedData[i];
    
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
        const cell4 = document.createElement('td');
    
        cell1.textContent = currentItem.time;
        cell2.textContent = currentItem.from + " " + currentItem.to;
        cell3.textContent = currentItem.directions;
        cell4.textContent = currentItem.unit;
    
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
    
        windForecastTable.appendChild(row);
      }
    }

    function updateTemperatureTable(data) {
      const temperatureTable = document.querySelector('.temperature-table');
    
      temperatureTable.innerHTML = '';
      const caption = document.createElement('caption');
      caption.textContent = 'Temperature Forecast';
      temperatureTable.appendChild(caption);

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Time', 'From To', 'Unit'];
    
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
    
      thead.appendChild(headerRow);
      temperatureTable.appendChild(thead);
    
      const parsedData = JSON.parse(data);
    
      for (var i = 0; i < parsedData.length; i++) {
        const currentItem = parsedData[i];
    
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
    
        cell1.textContent = currentItem.time;
        cell2.textContent = currentItem.from + " " + currentItem.to;
        cell3.textContent = currentItem.unit;
    
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
    
        temperatureTable.appendChild(row);
      }
    }
    

    function updatePrecipitationTable(data) {
      const precipitationTable = document.querySelector('.precipitation-table');
    
      precipitationTable.innerHTML = '';
      const caption = document.createElement('caption');
      caption.textContent = 'Precipitation Forecast';
      precipitationTable.appendChild(caption);

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Time', 'From To', 'Types', 'Unit'];
    
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
    
      thead.appendChild(headerRow);
      precipitationTable.appendChild(thead);
    
      const parsedData = JSON.parse(data);
    
      for (var i = 0; i < parsedData.length; i++) {
        const currentItem = parsedData[i];
    
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
        const cell4 = document.createElement('td');
    
        cell1.textContent = currentItem.time;
        cell2.textContent = currentItem.from + " " + currentItem.to;
        cell3.textContent = currentItem.precipitation_types;
        cell4.textContent = currentItem.unit;
    
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
    
        precipitationTable.appendChild(row);
      }
    }

    function updateCloudTable(data) {
      const cloudTable = document.querySelector('.cloud-table');
    
      cloudTable.innerHTML = '';
      const caption = document.createElement('caption');
      caption.textContent = 'Cloud Coverage Forecast';
      cloudTable.appendChild(caption);
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      const headers = ['Time', 'From To', 'Unit'];
    
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
    
      thead.appendChild(headerRow);
      cloudTable.appendChild(thead);
    
      const parsedData = JSON.parse(data);
    
      for (var i = 0; i < parsedData.length; i++) {
        const currentItem = parsedData[i];
    
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        const cell3 = document.createElement('td');
    
        cell1.textContent = currentItem.time;
        cell2.textContent = currentItem.from + " " + currentItem.to;
        cell3.textContent = currentItem.unit;
    
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
    
        cloudTable.appendChild(row);
      }
    }
    
    
    
  });

  function getLatestDayWeatherEntries(data) {
    const parsedData = JSON.parse(data);
  
    parsedData.sort((a, b) => new Date(a.time) - new Date(b.time));
  
    const latestDate = new Date(parsedData[parsedData.length - 1].time);
  
    const latestDayEntries = parsedData.filter((entry) => {
      const entryDate = new Date(entry.time);
  
      return (
        entryDate.getFullYear() === latestDate.getFullYear() &&
        entryDate.getMonth() === latestDate.getMonth() &&
        entryDate.getDate() === latestDate.getDate()
      );
    });
  
    return latestDayEntries;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  