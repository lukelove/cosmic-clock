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
    
  }

  getLocation() {

    console.log("location this.initialize")

    navigator.geolocation.getCurrentPosition((position) => {
      this.latValue = position.coords.latitude;
      this.lngValue = position.coords.longitude;

      fetch( ['https://api.sunrise-sunset.org/json?lat=', this.latValue, '&lng=', this.lngValue, '&date=', DateTime.now().toISODate(),'&formatted=0'].join('') )
        .then(response => response.json())
        .then((data) => {
          // console.log('fetch', data)
          // console.log('fetch sunset', data.results.sunset)
          // console.log('fetch sunrise', data.results.sunrise)

          // console.log( "fetch ISO ", DateTime.fromISO(data.results.sunrise) )

          this.go( DateTime.fromISO(data.results.sunrise), DateTime.fromISO(data.results.sunset) )
        })
      

      if( DateTime.now() < sunrise ){
        console.log("using Yesterday's Sunrise")
        var d = new Date();
        d.setDate(d.getDate() - 1);
        times = SunCalc.getTimes(d, this.latValue, this.lngValue);
      }

      this.getControllerByIdentifier('sun').init(times)
      this.getControllerByIdentifier('moon').init(times)

      var sunrise = DateTime.fromISO(times.sunrise.toISOString())
      var sunset = DateTime.fromISO(times.sunset.toISOString())

      this.sunriseTarget.innerHTML = sunrise.toLocaleString(DateTime.DATETIME_SHORT)
      this.sunsetTarget.innerHTML = sunset.toLocaleString(DateTime.DATETIME_SHORT)

      // console.log("Location Found: ", this.latValue + ", " + this.lngValue)
    })

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