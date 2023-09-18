const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

app.use(express.static('static'));

app.get('/city/:cityName', (req, res) => {
  const cityName = req.params.cityName;
  console.log(`City clicked: ${cityName}`);
  res.send(`You clicked on ${cityName}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/data/:cityName/:type', (req, res) => {
  const method = "GET";
  const url = "http://localhost:8080/data/" + req.params.cityName;
  const desiredType = req.params.type;
  const filteredData = [];

  let xhr = new XMLHttpRequest();

  xhr.open(method, url);
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      const responseData = xhr.responseText;
      const parsedData = JSON.parse(responseData);

      for (const data of parsedData) {
        if (data.type === desiredType) {
          filteredData.push(data);
        }
      }

      if (filteredData.length > 0) {
        res.json(filteredData);
      } else {
        res.status(404).send("No data found for the specified type.");
      }

    } else {
      console.error("Request failed with status:", xhr.status);
      res.status(xhr.status).send("Request failed");

    }
  };
  
  xhr.send();
})

app.get('/forecast/:cityName/:type', (req, res) => {
  const method = "GET";
  const url = "http://localhost:8080/forecast/" + req.params.cityName;
  const desiredType = req.params.type;
  const filteredData = [];

  let xhr = new XMLHttpRequest();

  xhr.open(method, url);
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      const responseData = xhr.responseText;
      const parsedData = JSON.parse(responseData);

      for (const data of parsedData) {
        if (data.type === desiredType) {
          filteredData.push(data);
        }
      }

      if (filteredData.length > 0) {
        res.json(filteredData);
      } else {
        res.status(404).send("No data found for the specified type.");
      }

    } else {
      console.error("Request failed with status:", xhr.status);
      res.status(xhr.status).send("Request failed");

    }
  };
  
  xhr.send();
})