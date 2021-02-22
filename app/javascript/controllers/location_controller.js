import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";

export default class extends Controller {

  static targets = [ "sunrise", "sunset" ]
  static values = { lat: Number, lng: Number }

  initialize() {
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS.');
    }
  }

  go(sunrise, sunset) {
    console.log('GO!', sunrise, sunset)
    this.getControllerByIdentifier('sun').init(sunrise)
    this.getControllerByIdentifier('moon').init(sunrise, sunset)

    // var sunrise = DateTime.fromISO(times.sunrise.toISOString())
    // var sunset = DateTime.fromISO(times.sunset.toISOString())

    this.sunriseTarget.innerHTML = sunrise.toLocaleString(DateTime.DATETIME_SHORT)
    this.sunsetTarget.innerHTML = sunset.toLocaleString(DateTime.DATETIME_SHORT)
  }

  getLocation() {

    console.log("location this.initialize")

    navigator.geolocation.getCurrentPosition((position) => {
      this.latValue = position.coords.latitude;
      this.lngValue = position.coords.longitude;

      var today = this.today()
      var url = ['https://api.sunrise-sunset.org/json?lat=', this.latValue, '&lng=', this.lngValue, '&date=', today.toISODate(),'&formatted=0'].join('')
      fetch( url ).then(response => response.json()) .then((data) => { this.go( DateTime.fromISO(data.results.sunrise), DateTime.fromISO(data.results.sunset) ) })
    })

  }

  today(){
 
    // if now is after sunrise, use today
    // if now is before sunrise, use yesterday

    var times = SunCalc.getTimes(new Date(), this.latValue, this.lngValue);
    var sunrise = DateTime.fromISO(times.sunrise.toISOString())

    if( DateTime.now() < sunrise ){
      console.log("using Yesterday's Sunrise")
      var d = new Date();
      d.setDate(d.getDate() - 1);
      times = SunCalc.getTimes(d, this.latValue, this.lngValue);
      sunrise = DateTime.fromISO(times.sunrise.toISOString())
    }

    return sunrise
  }

  connect() {
    console.log("hello from Loaction StimulusJS")
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }
  
}