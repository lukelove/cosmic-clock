import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
import { googleCalendarEventUrl } from 'google-calendar-url';
// var Countdown = require('countdown.js');

export default class extends Controller {

  static targets = [ "timeNowStr", "dayHour", "nightHour", "dayLength", "nightLength", 
                     "timer", "elementBlocks", "rulingPlanet"]
  static values = { appLoaded: Number }
  
  init(earth, moon, daily_ruler) {
    this.earth = earth
    this.moon = moon
    this.daily_ruler = daily_ruler
    this.intervals = this.moon.intervals

    this.refreshHTML()

    this.appLoadedValue = 1
  }

  refreshHTML(){
    this.presentInterval = _.find(this.moon.intervals, (moon_interval) => { return moon_interval.interval.contains( DateTime.now() ) })
    this.toHTML()
    this.wait()
  }

  wait(){

    var that = this
    var nextInterval = _.find(this.moon.intervals, (interval, index) => { return (index == this.presentIndex + 1) })
    var secToNextInterval = parseInt( DateTime.now().diff( nextInterval.interval.start ).toFormat('s') * -1 )

    if( this.earth.isToday ){
      // timer & countdown

      // var moonCountdown = new Countdown(secToNextInterval, function(seconds) { 
      //   that.timerTarget.innerHTML = Duration.fromMillis(seconds*1000).toFormat('m:ss')
      //  }, function() { 
      //   console.log('countdown Complete, time to refresh')
      //   that.refreshHTML()
      // });

    }
  }


  elementsToHTML(elements){
    var translator = this.getControllerByIdentifier('location')
    return _.map(elements, (e) => { return translator.elementToHTML(e, 'inline-block') }).join('')
  }

  toHTML(){

    var translator = this.getControllerByIdentifier('location')

    var rulingPlanet = document.querySelector('.rulingPlanet')

    rulingPlanet.innerHTML = translator.elementToHTML( this.daily_ruler )
    rulingPlanet.classList.remove('hidden')

    var html = _.map(this.moon.intervals, (moon_interval, index) => {

      var html = document.querySelector('.moonTemplate').cloneNode(true)

      if( this.presentInterval == moon_interval ){
        this.presentIndex = index
        html.setAttribute('tabindex', '0')
        html.classList.add( 'bg-indigo-400' )
      }


      html.classList.remove('moonTemplate')
      html.classList.remove('hidden')
      html.setAttribute('id', `moon-i-${index}`)


      html.querySelector('.sun-element').classList.add( moon_interval.element )
      html.querySelector('.moon-planet').classList.add( moon_interval.planet )

      html.querySelector('.start').innerHTML = moon_interval.interval.start.toFormat('t')
      html.querySelector('.end').innerHTML = moon_interval.interval.end.toFormat('t')
      html.querySelector('.gcal a').setAttribute('href', this.googleCalendarURL(moon_interval)) 

      return html.outerHTML
    }).join('')

    this.timeNowStrTarget.innerHTML = html

    if( this.presentInterval ){
    //   // Element Blocks beside the TItle
    //   this.elementBlocksTarget.innerHTML = this.elementsToHTML( this.presentInterval )
      this.focus()
    }
        
  }

  focus() {
    var activeEl = document.querySelector('#moon-i-' + this.presentIndex)
    _.delay((e) => {
      e.focus()
      _.delay((el) => { el.blur() },100, e)
    }, 100, activeEl)

  }

  offset(sunrise){
    switch (parseInt( sunrise.toFormat('c') ) - 1) {
      case 0: // monday
        return 0
      case 1: // tuesday
        return 3
      case 2: // wednesday
        return 6
      case 3: // thursday
        return 2
      case 4: // friday
        return 6
      case 5: // saturday
        return 1
      case 6: // sunday
        return 4
    }

  }

  getPlanet(interval) {
    switch (interval.elIndex) {
      case 0:
        return 'moon'
      case 1:
        return 'saturn'
      case 2:
        return 'jupiter'
      case 3:
        return 'mars'
      case 4:
        return 'sun'
      case 5:
        return 'venus'
      case 6:
        return 'mercury'
    }
  }

  interval() {
    var i = _.find(this.intervals, (i) => { return i.interval.contains( DateTime.now() ) })
    if(i == undefined){
      alert('uh oh.  did not find this interval!')
      console.log("error now()", DateTime.now(), this.intervals())
    }
    return i
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }

  googleCalendarURL(moon_interval){
    var dateFormat = 'yyyyMMdd'
    var timeFormat = 'HHmmss'
    var elName = moon_interval.planet.replace(/^\w/, (c) => c.toUpperCase())
    return googleCalendarEventUrl({
      start: [moon_interval.interval.start.toFormat(dateFormat), 'T', moon_interval.interval.start.toFormat(timeFormat)].join(''),
      end: [moon_interval.interval.end.toFormat(dateFormat), 'T', moon_interval.interval.end.toFormat(timeFormat)].join(''),
      title: `${elName} Hour`
    });
    
  }

  
}