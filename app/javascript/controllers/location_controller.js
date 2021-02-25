import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";
var Countdown = require('countdown.js');
import Cookies from "js-cookie";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

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

    
    this.sunIntervals = this.getControllerByIdentifier('sun').intervals
    this.moonIntervals = this.getControllerByIdentifier('moon').intervals
    this.findOverlaps()

    this.addTippy()
  }

  findOverlaps() {

    var overlaps = _.map(this.moonIntervals, (moonI) => {
      var sunIntervals = _.filter(this.sunIntervals, (sunI) => {
        
        if( _.intersection(moonI.elements, sunI.elements ).length == 0 ) return
        return sunI.interval.overlaps(moonI.interval)

      })

      return { moonInterval: moonI, sunIntervals: sunIntervals }
    })

    overlaps = _.filter(overlaps, (overlap) => { return overlap.sunIntervals.length > 0 })

    var focusedOnNext = false

    document.querySelector('#overlaps').innerHTML = _.map(overlaps, (overlap) => {

      return _.map(overlap.sunIntervals, (sunI) => {

        var html = document.querySelector('.overlapTemplate').cloneNode(true)


        if( !focusedOnNext ) {
          if( sunI.interval.contains( DateTime.now() ) || sunI.interval.isAfter( DateTime.now()) ){
            // yes focus here
            html.querySelector('.widget').setAttribute('tabindex', 0)
            html.querySelector('.widget').classList.add('bg-green-100')
            html.querySelector('.widget').classList.add('tabindex')
            html.querySelector('.widget').classList.remove('bg-blue-100')
            focusedOnNext = true
          }

        }

        
        html.querySelector('.sun-planet').classList.add( sunI.element )
        html.querySelector('.moon-planet').classList.add( overlap.moonInterval.planet )

        if( this.rulingPlanet == overlap.moonInterval.planet ){
          html.querySelector('.widget').classList.remove('bg-blue-100')
          html.querySelector('.widget').classList.add('bg-yellow-200')
          // html.querySelector('.moon-planet').parentNode.classList.add('bg-blue-500')
          // html.querySelector('.widget .rulingPlanet').classList.remove('hidden')
          // html.querySelector('.widget .rulingPlanet').innerHTML = this.elementToHTML( overlap.moonInterval.planet )
        }

        var intersection = overlap.moonInterval.interval.intersection(sunI.interval)
        html.querySelector('.start').innerHTML = intersection.start.toFormat('HH:mm')
        html.querySelector('.end').innerHTML = intersection.end.toFormat('HH:mm')
        html.querySelector('.length').innerHTML = intersection.length('minutes').toFixed() + 'm'
        return html.outerHTML
      }).join('')
      

    }).join('')

    var activeEl = document.querySelector('#overlaps .tabindex')
    _.delay((el) => { el.focus() }, 300, activeEl)
    _.delay((el) => { el.blur() }, 350, activeEl)
    // activeEl.focus()
    
  }

  addTippy() {
    var elements = ["air", "water", "earth", "fire", "spirit"]
    _.each(elements, (e) => {
      _.each( _.concat(e, this.elementToPlanets(e)), (el) => {
        tippy('.' + el, {content: _.capitalize(el)})
      } )
    })
    
  }

  getLocation() {

    this.btnTarget.classList.add('hidden')

    var goFetch = () => {
      var today = this.today()

      if( Cookies.get('today') == today.toISODate() ){
        _.delay(() => { // we need the delay so the controllers finish loading
          this.go( DateTime.fromISO(Cookies.get('sunrise')), DateTime.fromISO(Cookies.get('sunset')) ) 
        }, 10)

        return
      }

      var url = ['https://api.sunrise-sunset.org/json?lat=', this.latValue, '&lng=', this.lngValue, '&date=', today.toISODate(),'&formatted=0'].join('')
      fetch( url ).then(response => response.json()) .then((data) => { 
        
        Cookies.set('today', today.toISODate())
        Cookies.set('sunrise', data.results.sunrise)
        Cookies.set('sunset', data.results.sunset)
        
        this.go( DateTime.fromISO(data.results.sunrise), DateTime.fromISO(data.results.sunset) ) 
      })
    }

    if( Cookies.get('lat') && Cookies.get('lng') ){
      this.latValue = parseFloat( Cookies.get('lat') )
      this.lngValue = parseFloat( Cookies.get('lng') )
      goFetch()
    }else{
      console.log('Use geoLocation')
      navigator.geolocation.getCurrentPosition((position) => {
        this.latValue = position.coords.latitude;
        this.lngValue = position.coords.longitude;
        Cookies.set('lat', this.latValue)
        Cookies.set('lng', this.lngValue)
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

    this.rulingPlanet = this.dailyRuler(parseInt(sunrise.toFormat('c')))

    return sunrise
  }

  dailyRuler(day_of_week){ // 1-7
    ['moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'sun'][day_of_week - 1]
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

  elementToPlanetsHTML(element){
    return _.map(this.elementToPlanets(element), (e) => {
      return elementToHTML(e)
    }).join('')
  }

  elementToHTML(e, otherClasses) {
    return ['<div class="', e, ' ', otherClasses, ' mr-2"></div>'].join('')
  }

  elementToPlanets(element){
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