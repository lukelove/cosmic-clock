import { Controller } from 'stimulus';
var SunCalc = require('suncalc');

export default class extends Controller {

  static values = { lat: Number, lng: Number }

  getLocation() {

    console.log("location this.initialize")

    navigator.geolocation.getCurrentPosition((position) => {
      this.latValue = position.coords.latitude;
      this.lngValue = position.coords.longitude;
      
      var times = SunCalc.getTimes(new Date(), this.latValue, this.lngValue);
      this.getControllerByIdentifier('sun').initialize(times)
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