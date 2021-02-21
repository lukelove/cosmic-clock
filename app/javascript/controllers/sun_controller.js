import { Controller } from 'stimulus'; 
var SunCalc = require('suncalc');


export default class extends Controller {


  initialize() {
    // var 
  }
  connect() {
    var times = SunCalc.getTimes(new Date(), 51.5, -0.1);
    console.log( 'times', times )

  }

  lat_lng() {

    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;
  
      latText.innerText = lat.toFixed(2);
      longText.innerText = long.toFixed(2);  
    })


  }

}