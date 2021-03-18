import { Controller } from 'stimulus';
var SunCalc = require('suncalc');
import { DateTime } from "luxon";
import Cookies from "js-cookie";
import { googleCalendarEventUrl } from 'google-calendar-url';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling


import { WindowsInTime } from 'windows-in-time';
export default class extends Controller {

  static targets = [ "btn", "sunrise", "sunset", "date", "windowRulerBtn", "apps", "loader" ]
  static values = { lat: Number, lng: Number, app: String }

  initialize() {

    this.date = DateTime.now()
    
    if( Cookies.get('lat') != undefined && Cookies.get('lng') != undefined ){
      this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
      this.appsTarget.classList.remove('hidden')
    }else{
      this.loaderTarget.classList.remove('hidden')
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
    // reloads the current windows in time
    this.getWindowsInTime( this.date, Cookies.get('lat'), Cookies.get('lng') )
  }

  getWindowsInTime(date) {

    // WindowsInTime is responsible for getting sunrise and sunset time, using the provided Date.
    // WindowsInTime is NOT responsible for getting the lat and lng
    
    let windows_in_time = new WindowsInTime(Cookies.get('lat'), Cookies.get('lng'))
    windows_in_time.earth.setTimes(this.date).then(() => {
      windows_in_time.magic()

      switch (this.appValue) {
        case "windows":
          this.addWindows(windows_in_time.windows.intervals, windows_in_time.earth)
          break
        case "sun":
          this.getControllerByIdentifier('sun').init(windows_in_time.earth, windows_in_time.sun)
          break
        case "moon":
          this.getControllerByIdentifier('moon').init(windows_in_time.earth, windows_in_time.moon, windows_in_time.earth.daily_ruler)
          break
      }
      
      

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
    
    document.querySelector('#overlaps').innerHTML = '<div class="clear-both"></div>' + _.map( window_intervals, (window) => {

      var html = document.querySelector('.overlapTemplate').cloneNode(true)
      html.classList.remove('overlapTemplate')
      html.classList.remove('hidden')
      html.classList.add('overlap')
      var w = html.querySelector('.widget')

      if( earth.isToday && !(window.interval.contains( DateTime.now() ) || window.interval.isAfter( DateTime.now() )) ){
        w.closest('.overlap').classList.add('hidden')
      }

      html.querySelector('.sun-planet').classList.add( window.element )
      html.querySelector('.moon-planet').classList.add( window.planet )

      if( window.golden ){
        w.classList.add('golden')
      }
      
      html.querySelector('.start').innerHTML = window.interval.start.toFormat('t')
      html.querySelector('.end').innerHTML = window.interval.end.toFormat('t')
      html.querySelector('.length').innerHTML = window.interval.length('minutes').toFixed() + 'm'
      html.querySelector('.gcal a').setAttribute('href', this.googleCalendarURL(window)) 

      return html.outerHTML

    }).join('')

  }

  googleCalendarURL(window){
    var dateFormat = 'yyyyMMdd'
    var timeFormat = 'HHmmss'
    return googleCalendarEventUrl({
      start: [window.interval.start.toFormat(dateFormat), 'T', window.interval.start.toFormat(timeFormat)].join(''),
      end: [window.interval.end.toFormat(dateFormat), 'T', window.interval.end.toFormat(timeFormat)].join(''),
      title: [window.element.replace(/^\w/, (c) => c.toUpperCase()), window.planet.replace(/^\w/, (c) => c.toUpperCase())].join(' :: ') + ' (Window In Time)'
    });
    
  }

  addTippy() {
    
    // _.delay((el) => { this.getControllerByIdentifier('tippy').tip() }, 200, this)
    

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
      this.appsTarget.classList.remove('hidden')
      this.loaderTarget.classList.add('hidden')
    })

  }

  // elementToPlanetsHTML(element){
  //   return _.map(this.elementToPlanets(element), (e) => {
  //     return elementToHTML(e)
  //   }).join('')
  // }

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