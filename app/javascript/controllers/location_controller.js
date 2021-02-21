import { Controller } from 'stimulus';
var SunCalc = require('suncalc');

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