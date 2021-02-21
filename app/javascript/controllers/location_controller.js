import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";

export default class extends Controller {

  static values = { lat: Number, lng: Number }

  initialize() {
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');
    }
    else {
      console.log('Geolocation is not supported for this Browser/OS.');
    }
  }

  getLocation() {

    console.log("location this.initialize")

    navigator.geolocation.getCurrentPosition((position) => {
      this.latValue = position.coords.latitude;
      this.lngValue = position.coords.longitude;
      
      var times = SunCalc.getTimes(new Date(), this.latValue, this.lngValue);

      // console.log("DDDD", DateTime.fromObject({hour: 0}))
      // if now() is after midnight and before sunrise, give me yesterdays times
      // console.log("DDDD", DateTime.now() > DateTime.fromObject({hour: 0}) )
      // DateTime.now() > DateTime.fromObject({hour: 0})
      // if now() is after midnight and before sunrise, give me yesterdays times

      var sunrise = DateTime.fromISO(times.sunrise.toISOString())

      if( DateTime.now() < sunrise ){
        console.log("using Yesterday's Sunrise")
        var d = new Date();
        d.setDate(d.getDate() - 1);
        times = SunCalc.getTimes(d, this.latValue, this.lngValue);
      }

      this.getControllerByIdentifier('sun').init(times)

      console.log("Location Found: ", this.latValue + ", " + this.lngValue)
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