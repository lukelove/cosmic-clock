import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";
var Countdown = require('countdown.js');
import Cookies from "js-cookie";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

import { WindowsInTime } from 'windows-in-time';

export default class extends Controller {

  static targets = [ "btn", "sunrise", "sunset", "date", "windowRulerBtn" ]
  static values = { lat: Number, lng: Number }

  initialize() {

    this.date = DateTime.now()
    
    if( Cookies.get('lat') != undefined && Cookies.get('lng') != undefined ){
      this.btnTarget.classList.add('hidden')
      this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
    }else{
      this.getLocation( this.date )
    }

  }

  nextDay() {
    this.date = this.date.plus({days: 1})
    this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
  }
  
  previousDay() {
    this.date = this.date.minus({days: 1})
    this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
  }

  goToToday() {
    this.date = DateTime.now()
    this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
  }

  getWindowsInTime(date) {

    // WindowsInTime is responsible for getting sunrise and sunset time, using the provided Date.
    // WindowsInTime is NOT responsible for getting the lat and lng
    
    let windows_in_time = new WindowsInTime(Cookies.get('lat'), Cookies.get('lng'))
    windows_in_time.earth.setTimes(this.date).then(() => {
      windows_in_time.magic()
      this.addWindows(windows_in_time.windows.intervals, windows_in_time.earth)
      this.getControllerByIdentifier('sun').init(windows_in_time.earth, windows_in_time.sun)
      this.getControllerByIdentifier('moon').init(windows_in_time.earth, windows_in_time.moon, windows_in_time.earth.daily_ruler)


      this.dateTarget.innerHTML = windows_in_time.earth.sunrise.toFormat("ccc LLL dd")
      this.dateTarget.setAttribute('data-date', windows_in_time.earth.sunrise.toISODate() )

      this.addTippy()
    })
  }

  addWindows(window_intervals, earth) {

    var focusedOnNext = false

    if( this.windowRulerBtnTarget.getAttribute('data-init') == '1' ){
      var cl = this.windowRulerBtnTarget.classList
      var lastClass = this.windowRulerBtnTarget.classList[cl.length - 1]
      cl.remove(lastClass)
    }
    this.windowRulerBtnTarget.setAttribute('data-init', '1')
    this.windowRulerBtnTarget.classList.add(earth.daily_ruler)
    
    document.querySelector('#overlaps').innerHTML = _.map( window_intervals, (window) => {

      var html = document.querySelector('.overlapTemplate').cloneNode(true)
      html.classList.remove('overlapTemplate')
      html.classList.remove('hidden')
      html.classList.add('overlap')
      var w = html.querySelector('.widget')

      if( earth.isToday && !(window.interval.contains( DateTime.now() ) || window.interval.isAfter( DateTime.now() )) ){
        w.classList.add('hidden')
      }

      html.querySelector('.sun-planet').classList.add( window.element )
      html.querySelector('.moon-planet').classList.add( window.planet )

      if( window.golden ){
        w.classList.remove('bg-blue-100')
        w.classList.add('golden')
        w.classList.add('bg-yellow-200')
      }
      
      html.querySelector('.start').innerHTML = window.interval.start.toFormat('HH:mm')
      html.querySelector('.end').innerHTML = window.interval.end.toFormat('HH:mm')
      html.querySelector('.length').innerHTML = window.interval.length('minutes').toFixed() + 'm'

      return html.outerHTML

    }).join('')

  }

  addTippy() {
    
    // cleanup tippys
    if (this.tippys == undefined) this.tippys = []
    _.each(this.tippys, (t) => { t.destroy() })

    this.tippys = []
    var elements = ["air", "water", "earth", "fire", "spirit"]
    _.each(elements, (e) => {
      _.each( _.concat(e, this.elementToPlanets(e)), (el) => {
        this.tippys.push( tippy('.' + el, {content: _.capitalize(el)}) )
      } )
    })
    
    this.tippys = _.flattenDeep(this.tippys)
  }

  getLocation( date ) {

    console.log('getLocation')
    navigator.geolocation.getCurrentPosition((position) => {
      this.latValue = position.coords.latitude;
      this.lngValue = position.coords.longitude;
      Cookies.set('lat', this.latValue)
      Cookies.set('lng', this.lngValue)
      this.getWindowsInTime( date )
    })

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


  showWindow(event) {
    var element = event.currentTarget.getAttribute('data-actor')
    _.each(document.querySelectorAll('#overlaps .overlap'), (o) => { o.classList.add('hidden') })
    _.each(document.querySelectorAll('#overlaps .' + element), (o) => { o.closest('.overlap').classList.remove('hidden') })
  }

}