import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
var Countdown = require('countdown.js');
import CanvasCircularCountdown from 'canvas-circular-countdown';

export default class extends Controller {

  static targets = [ "timeNowStr", "dayHour", "nightHour", "dayLength", "nightLength", 
                     "timer", "elementBlocks", "rulingPlanet"]

  connect() {
    console.log('connect MOON')
  }

  init(sunrise, sunset) {
    var wholeDayMs = 86400000
    var dayMS = sunrise.diff(sunset).milliseconds * -1
    var nightMS = wholeDayMs - dayMS
    var dayIntervalLength = parseInt(dayMS/12)
    var nightIntervalLength = parseInt(nightMS/12)

    this.dayHourTarget.innerHTML = Duration.fromMillis(dayIntervalLength).toFormat('h:mm')
    this.dayLengthTarget.innerHTML = Duration.fromMillis(dayMS).toFormat('h:mm')
    this.nightHourTarget.innerHTML = Duration.fromMillis(nightIntervalLength).toFormat('h:mm')
    this.nightLengthTarget.innerHTML = Duration.fromMillis(nightMS).toFormat('h:mm')

    var dayIntervals = this.makeInterval(0, sunrise, this.offset(sunrise), dayIntervalLength)
    var nightIntervals = this.makeInterval(12, sunset, _.last(dayIntervals).elIndex + 1, nightIntervalLength) 
    this.intervals = _.concat( dayIntervals, nightIntervals )

    this.refreshHTML()
  }

  refreshHTML(){
    this.toHtml()
    this.wait()
  }

  wait(){

    var that = this
    var nextInterval = _.find(this.intervals, (i) => { return (i.index == this.activeInterval.index + 1) })
    var secToNextInterval = parseInt( DateTime.now().diff( nextInterval.interval.start ).toFormat('s') * -1 )

    // timer & countdown
    new CanvasCircularCountdown(this.timerTarget, {
      "duration": secToNextInterval * 1000,
      "radius": 150,
      "progressBarWidth": 15,
      "circleBackgroundColor": "#ffffff",
      "emptyProgressBarBackgroundColor": "rgba(52, 211, 153)",
      "filledProgressBarBackgroundColor": "rgb(139, 92, 246)",
      "showCaption": true,
      // "captionColor": "#343a40",
      "captionFont": "60px sans-serif",
      "captionText": (percentage, time, instance) => {
        return Duration.fromMillis(time.remaining).toFormat('mm:ss')
      },
    }, function onTimerRunning(percentage, time, instance) {
      // Do your stuff here while timer is running...
    }).start()

    var moonCountdown = new Countdown(secToNextInterval, function(seconds) { return }, function() { 
      console.log('countdown Complete, time to refresh')
      that.refreshHTML()
    });
  }

  makeInterval(indexOffset, time, elCount, intervalLength) {
    var owner = (indexOffset == 0) ? 'sun' : 'moon'

    return _.map(_.times(12), (n) => {
      var i = Interval.fromDateTimes(time, ( time = time.plus({millisecond: intervalLength}) ))

      var realIndex = n+1 + ( (indexOffset == 0) ? 0 : 12 )
      var data = {
        id: owner + '-' + realIndex,
        index: realIndex,
        elIndex: elCount,
        interval: i,
        string: i.start.toLocaleString(DateTime.TIME_24_SIMPLE ) + " - " + i.end.toLocaleString(DateTime.TIME_24_SIMPLE	)
      }

      var controller = this.getControllerByIdentifier('location')      
      data.elements = _.concat( controller.planetToElement( this.getElement(data) ), this.getElement(data) )

      if(elCount == 6) { elCount = 0 } else { elCount+=1 } // this gives us access to know which element it is

      return data
    })
  }

  elementsToHTML(interval){
    var controller = this.getControllerByIdentifier('location')
    return _.map(interval.elements, (e) => { return controller.elementToHTML(e, 'inline-block') }).join('')
  }

  toHtml(){

    var controller = this.getControllerByIdentifier('location')

    this.rulingPlanetTarget.innerHTML = controller.elementToHTML( controller.rulingPlanet )

    this.activeInterval = this.interval()
    var html = _.map(this.intervals, (i) => {
      var klass = ( this.activeInterval == i ) ? 'bg-yellow-300' : ''
      var tabIndex = (this.activeInterval == i ) ? 'tabindex="0"' : ''
      var el = this.getElement(i)
      
      var h = '<div class="' + klass + ' p-2 grid grid-cols-2" '+ tabIndex + ' id="moon-i-' + i.id + '">'
      h+= '<div class="w-full inline-flex">'
        h+= '<div class="inline-block w-16 mr-4">'+ i.index + ' h</div>'
        h+= '<div class="inline-block w-full">'+ i.string + '</div>'
      h+= '</div>'
      h+= '<div class="w-full">'+ this.elementsToHTML(i) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html

    // Element Blocks beside the TItle
    this.elementBlocksTarget.innerHTML = this.elementsToHTML( this.activeInterval )
    
    this.focus()
        
  }

  focus() {
    var activeEl = document.querySelector('#moon-i-' + this.activeInterval.id)

    _.delay((e) => {
      e.focus()
      _.delay((el) => { el.blur() },100, e)
    }, 200, activeEl)

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

  getElement(interval) {
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