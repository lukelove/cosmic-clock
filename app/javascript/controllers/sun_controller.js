import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
var Countdown = require('countdown.js');
import CanvasCircularCountdown from 'canvas-circular-countdown';

export default class extends Controller {

  static targets = [ "timeNowStr", "timer" ]

  init(sunrise) {
    var elCount = 0

    this.intervals = _.map(_.times(5 * 12), (n) => {
      var i = Interval.fromDateTimes(sunrise, ( sunrise = sunrise.plus({minutes: 24}) ))
      
      var data = {
        index: n,
        elIndex: elCount,
        interval: i,
        string: i.start.toLocaleString(DateTime.TIME_24_WITH_SECONDS) + " - " + i.end.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }

      if(elCount == 4) { elCount = 0 } else { elCount+=1 } // this gives us access to know which element it is

      return data
    })

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

    var countdown = new Countdown(secToNextInterval, function(seconds) {}, function() { that.refreshHTML() });
  }

  toHtml(){
    var controller = this.getControllerByIdentifier('location')
    this.activeInterval = this.interval()
    var html = _.map(this.intervals, (i) => {
      var klass = ( this.activeInterval == i ) ? 'bg-purple-500' : ''
      var tabIndex = (this.activeInterval == i ) ? 'tabindex="0"' : ''
      var el = this.getElement(i)
      
      var h = '<div class="' + klass + ' p-2 grid grid-cols-3 gap-4" '+ tabIndex + ' id="sun-i-' + i.index + '">'
        h+= '<div>'+ i.string + '</div>'
        h+= '<div class="pl-12 ' + el + '">'+ _.capitalize(el) + '</div>'
        h+= '<div class="flex flex-wrap content-start">' + controller.elementToPlanetHTML(el) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html
    this.focus()
  }

  focus() {
    var activeEl = document.querySelector('#sun-i-' + this.activeInterval.index)
    activeEl.focus()
    _.delay((el) => { el.blur() },100, activeEl)
  }

  getElement(interval) {
    switch (interval.elIndex) {
      case 0:
        return 'spirit'
      case 1:
        return 'air'
      case 2:
        return 'fire'
      case 3:
        return 'earth'
      case 4:
        return 'water'
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