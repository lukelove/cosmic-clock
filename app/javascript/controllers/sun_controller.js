import { Controller } from 'stimulus'; 
import { DateTime, Duration, Interval } from "luxon";
import { googleCalendarEventUrl } from 'google-calendar-url';
// var Countdown = require('countdown.js');

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

      // var sunCountdown = new Countdown(secToNextInterval, function(seconds) {
      //   that.timerTarget.innerHTML = Duration.fromMillis(seconds*1000).toFormat('m:ss')
      //  }, function() { 
      //   console.log('countdown Complete, time to refresh')
      //   that.refreshHTML()
      // });

    }
  }

  toHTML(){

    var html = _.map(this.sun.intervals, (sun_interval, index) => {
      var html = document.querySelector('.sunTemplate').cloneNode(true)

      if( this.presentInterval == sun_interval ){
        this.presentIndex = index
        html.setAttribute('tabindex', '0')
        html.classList.add( 'bg-indigo-400' )
      }
      
      html.classList.remove('sunTemplate')
      html.classList.remove('hidden')
      html.setAttribute('id', `sun-i-${index}`)

      html.querySelector('.sun-element').classList.add( sun_interval.element )
      _.each(sun_interval.planets, (p, i) => {
        if( p == 'fixed stars'){ 
          p = 'fixed-stars' 
          html.querySelector('.moon-planet-2').classList.add( 'hidden' )
        }
        html.querySelector(`.moon-planet-${i+1}`).classList.add( p )
      })

      if( sun_interval.planets.length == 0 ){
        html.querySelector('.moon-planet-1').classList.add( 'hidden' )
        html.querySelector('.moon-planet-2').classList.add( 'hidden' )
      }

      html.querySelector('.start').innerHTML = sun_interval.interval.start.toFormat('t')
      html.querySelector('.end').innerHTML = sun_interval.interval.end.toFormat('t')
      html.querySelector('.gcal a').setAttribute('href', this.googleCalendarURL(sun_interval)) 
      
      return html.outerHTML
    }).join('')

    this.timeNowStrTarget.innerHTML = html

    // Element Blocks beside the TItle
    if( this.presentInterval ){
      // this.elementBlocksTarget.innerHTML = this.elementsToHTML(this.presentInterval.elements)
      this.focus()
    }
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

  googleCalendarURL(sun_interval){
    var dateFormat = 'yyyyMMdd'
    var timeFormat = 'HHmmss'
    var elName = sun_interval.element.replace(/^\w/, (c) => c.toUpperCase())
    return googleCalendarEventUrl({
      start: [sun_interval.interval.start.toFormat(dateFormat), 'T', sun_interval.interval.start.toFormat(timeFormat)].join(''),
      end: [sun_interval.interval.end.toFormat(dateFormat), 'T', sun_interval.interval.end.toFormat(timeFormat)].join(''),
      title: `${elName} Tattva`
    });
    
  }

}