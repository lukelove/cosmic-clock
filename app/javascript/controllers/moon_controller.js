import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
var Countdown = require('countdown.js');
import CanvasCircularCountdown from 'canvas-circular-countdown';

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

      var moonCountdown = new Countdown(secToNextInterval, function(seconds) { 
        that.timerTarget.innerHTML = Duration.fromMillis(seconds*1000).toFormat('m:ss')
       }, function() { 
        console.log('countdown Complete, time to refresh')
        that.refreshHTML()
      });

    }
  }


  elementsToHTML(elements){
    var translator = this.getControllerByIdentifier('location')
    return _.map(elements, (e) => { return translator.elementToHTML(e, 'inline-block') }).join('')
  }

  toHTML(){

    var translator = this.getControllerByIdentifier('location')

    this.rulingPlanetTarget.innerHTML = translator.elementToHTML( this.daily_ruler )

    // this.presentInterval = this.interval()
    var html = _.map(this.moon.intervals, (moon_interval, index) => {

      var klass = '', tabIndex = '', h = ''
      if( this.presentInterval == moon_interval ){
        this.presentIndex = index
        klass = 'bg-yellow-300'
        tabIndex = 'tabindex="0"'
      }
      
      var h = '<div class="' + klass + ' p-2 grid grid-cols-2" '+ tabIndex + ' id="moon-i-' + index + '">'
      h+= '<div class="w-full inline-flex">'
        h+= '<div class="inline-block w-16 mr-4">'+ (index + 1) + ' h</div>'
        h+= '<div class="inline-block w-full">'+ moon_interval.time_string + '</div>'
      h+= '</div>'
      h+= '<div class="w-full">'+ this.elementsToHTML(moon_interval.elements) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html

    if( this.presentInterval ){
      // Element Blocks beside the TItle
      this.elementBlocksTarget.innerHTML = this.elementsToHTML( this.presentInterval )
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
  
}