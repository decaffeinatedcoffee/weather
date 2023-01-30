const express = require("express");
require("dotenv").config();
const app = new express();
const fetch = require("node-fetch");
app.set("view engine", "ejs");
var bodyParser = require('body-parser')
app.use(bodyParser.json())
const openGeocoder = require('node-open-geocoder');
const clm = require('country-locale-map');

app.get("/",  function(req,res){
  res.render("index.ejs");
  })


app.post("/search", function(req,res){
 let lat = req.body.latitude;
 let lon = req.body.longitude;
 let name = req.body.name;
 let country = req.body.country;

  openGeocoder()
.reverse(parseFloat(lon), parseFloat(lat))
      .end(async(err, geocoderRes) => {
      
 if(lat !== null && lon !== null){
name = geocoderRes.address.city;
country = geocoderRes.address.country_code;
 }
 name = encodeURIComponent(name);
 fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name},${country}&lang=EN&appid=${process.env.OPENKEY}&mode=json&units=metric&cnt=1`)
  .then(function(json){
    return json.json();
  })
  .then(function(weather){
    if(weather.cod == 200){
    var temperature = Math.round(weather.list[0].main.temp);
    var condition = weather.list[0].weather[0].description
    var max = Math.round(weather.list[0].main.temp_max);
    var min = Math.round(weather.list[0].main.temp_min);
    var cityName = (weather.city.name);
    var lang = clm.getLocaleByAlpha2(weather.city.country).slice(0,2);
    if(lang.toLocaleLowerCase() != "pt"){
      lang = "en";
    }
    retried = false;
    
    let imgcity = cityName;
    
    var imgURL;  
    
    openGeocoder()
    .reverse(parseFloat(weather.city.coord.lon), parseFloat(weather.city.coord.lat))
          .end(async(err, geocoderRes) => {
      let region = geocoderRes.address.state;
      let imgcityState;
      if(lang.toLowerCase() == "pt"){
      imgcityState = `${imgcity} (${region})`;
      }else{
      imgcityState = `${imgcity}, ${region}`;
      }
    searchImage();
    function searchImage(){
      fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${imgcityState}&pithumbsize=3000&format=json&origin=*`)
       .then(function(data){
          return data.json()
      })
      .then(async function(wikiData){
         let parseData = wikiData.query.pages[Object.keys(wikiData.query.pages)[0]]
         if(parseData.thumbnail != undefined){
          let image = parseData.thumbnail.source;
           imgURL = image;
           sendHeader()
           }else{
          if(retried == false){
            imgcityState = imgcity; 
          searchImage();
          retried = true;
          }else{
          sendHeader(); 
          }
         }
       async function sendHeader(){
          await res.send(JSON.stringify({imageURL:imgURL, locationName:cityName, condition:condition, temperature:`${temperature}°C`, forecast:`Min ${min}°C - Max ${max}°C`}));  
        }
 })
}  
})
  }
    else{
      res.send(JSON.stringify({error:true}));
    }
  })
})
})
app.listen("3001" || process.env.PORT);
