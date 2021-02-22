import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";
var Countdown = require('countdown.js');
import Cookies from "js-cookie";

export default class extends Controller {

  static targets = [ "btn", "sunrise", "sunset" ]
  static values = { lat: Number, lng: Number }

  initialize() {

    if( Cookies.get('lat') && Cookies.get('lng') ){
      this.btnTarget.classList.add('hidden')
      this.getLocation();
    }

  }

  go(sunrise, sunset) {
    this.getControllerByIdentifier('sun').init(sunrise)
    this.getControllerByIdentifier('moon').init(sunrise, sunset)
    this.sunriseTarget.innerHTML = sunrise.toLocaleString(DateTime.DATETIME_SHORT)
    this.sunsetTarget.innerHTML = sunset.toLocaleString(DateTime.DATETIME_SHORT)
  }

  getLocation() {

    var goFetch = () => {
      var today = this.today()
      var url = ['https://api.sunrise-sunset.org/json?lat=', this.latValue, '&lng=', this.lngValue, '&date=', today.toISODate(),'&formatted=0'].join('')
      fetch( url ).then(response => response.json()) .then((data) => { this.go( DateTime.fromISO(data.results.sunrise), DateTime.fromISO(data.results.sunset) ) })
    }

    if( Cookies.get('lat') && Cookies.get('lng') ){

      console.log('Use Cookies')
      this.latValue = parseFloat( parseFloat( Cookies.get('lat') ) )
      this.lngValue = parseFloat( parseFloat( Cookies.get('lng') ) )
      goFetch()
    }else{
      console.log('Use geoLocation')
      navigator.geolocation.getCurrentPosition((position) => {
        this.latValue = position.coords.latitude;
        this.lngValue = position.coords.longitude;
        Cookies.set('lat', this.latValue)
        Cookies.set('lng', this.lngValue)
        
        
        console.log( 'cookies', Cookies.get() )
        goFetch()
      })
    }


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

  planetToElement(planet){
    switch (planet) {
      case 'sun':
      case 'mars':
        return 'fire'
      case 'mercury':
      case 'saturn':
        return 'water'
      case 'venus':
      case 'jupiter':
        return 'air'
      case 'moon':
        return 'earth'
    }
  }

  elementToPlanet(element){
    switch (element) {
      case 'fire':
        return ['sun', 'mars']
      case 'water':
        return ['mercury', 'saturn']
      case 'air':
        return ['venus', 'jupiter']
      case 'earth':
        return ['moon', 'fixed stars']
    }
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }


}