import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
var Countdown = require('countdown.js');
import CanvasCircularCountdown from 'canvas-circular-countdown';

export default class extends Controller {

  static targets = [ "timeNowStr", "timer", "elementBlocks" ]
  static values = { appLoaded: Number }

  init(earth, sun) {
    this.earth = earth
    this.sun = sun
    this.refreshHTML()
  }
  
  refreshHTML(){
    this.presentInterval = _.find(this.sun.intervals, (sun_interval) => { return sun_interval.interval.contains( DateTime.now() ) })
    this.toHTML()
    this.wait()
  }

  wait(){

    var that = this
    var nextInterval = _.find(this.sun.intervals, (interval, index) => { return (index == this.presentIndex + 1) })
    var secToNextInterval = parseInt( DateTime.now().diff( nextInterval.interval.start ).toFormat('s') * -1 )

    if( this.earth.isToday ){

      var sunCountdown = new Countdown(secToNextInterval, function(seconds) {
        that.timerTarget.innerHTML = Duration.fromMillis(seconds*1000).toFormat('m:ss')
       }, function() { 
        console.log('countdown Complete, time to refresh')
        that.refreshHTML()
      });

    }
  }

  toHTML(){

    var focusonIndex
    
    var html = _.map(this.sun.intervals, (sun_interval, index) => {
      var klass = '', tabIndex = '', h = ''
      if( this.presentInterval == sun_interval ){
        this.presentIndex = index
        klass = 'bg-indigo-400'
        tabIndex = 'tabindex="0"'
      }
      
      h+= '<div class="' + klass + ' p-2 grid grid-cols-2 gap-4" '+ tabIndex + ' id="sun-i-' + index + '">'
      h+= '<div>'+ sun_interval.time_string + '</div>'
      h+= '<div class="w-full">'+ this.elementsToHTML(sun_interval.elements) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html

    // Element Blocks beside the TItle
    // if( this.presentInterval ){
    //   this.elementBlocksTarget.innerHTML = this.elementsToHTML(this.presentInterval.elements)
    //   this.focus()
    // }
  }

  focus() {
    var activeEl = document.querySelector('#sun-i-' + this.presentIndex)
    activeEl.focus()
    _.delay((el) => { el.blur() },100, activeEl)
  }

  elementsToHTML(elements){
    var translator = this.getControllerByIdentifier('location')
    return _.map(elements, (e) => { return translator.elementToHTML(e, 'inline-block') }).join('')
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }

}