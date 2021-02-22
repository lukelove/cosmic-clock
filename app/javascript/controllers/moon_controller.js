import { Controller } from 'stimulus'; 
import { DateTime, Duration } from "luxon";
import Interval from "luxon/src/interval.js";

export default class extends Controller {

  static targets = [ "timeNowStr", "dayHour", "nightHour", "dayLength", "nightLength" ]

  init(sunrise, sunset) {
    var wholeDayMs = 86400000
    var dayMS = sunrise.diff(sunset).milliseconds * -1
    var nightMS = wholeDayMs - dayMS
    var dayIntervalLength = parseInt(dayMS/12)
    var nightIntervalLength = parseInt(nightMS/12)

    this.dayHourTarget.innerHTML = Duration.fromMillis(dayIntervalLength).toFormat('h:mm:ss')
    this.dayLengthTarget.innerHTML = Duration.fromMillis(dayMS).toFormat('h:mm:ss')
    this.nightHourTarget.innerHTML = Duration.fromMillis(nightIntervalLength).toFormat('h:mm:ss')
    this.nightLengthTarget.innerHTML = Duration.fromMillis(nightMS).toFormat('h:mm:ss')

    var dayIntervals = this.makeInterval(0, sunrise, this.offset(sunrise), dayIntervalLength)
    var nightIntervals = this.makeInterval(12, sunset, _.last(dayIntervals).elIndex + 1, nightIntervalLength) 
    this.intervals = _.concat( dayIntervals, nightIntervals )
    this.toHtml()
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
        string: i.start.toLocaleString(DateTime.TIME_24_WITH_SECONDS) + " - " + i.end.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }

      if(elCount == 6) { elCount = 0 } else { elCount+=1 } // this gives us access to know which element it is

      return data
    })
  }

  toHtml(){

    var controller = this.getControllerByIdentifier('location')

    var thisInterval = this.interval()
    var html = _.map(this.intervals, (i) => {
      var klass = ( thisInterval == i ) ? 'bg-yellow-300' : ''
      var tabIndex = (thisInterval == i ) ? 'tabindex="0"' : ''
      var el = this.getElement(i)
      
      var h = '<div class="' + klass + ' p-2 grid grid-cols-4" '+ tabIndex + ' id="moon-i-' + i.id + '">'
        h+= '<div class="w-9">'+ i.index + ' h</div>'
        h+= '<div class="w-60">'+ i.string + '</div>'
        h+= '<div class="w-full pl-12 ' + el + '">'+ _.capitalize(el) + '</div>'
        h+= '<div class="w-full pl-12 ' + controller.planetToElement(el) + '">' + controller.planetToElement(el) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html
    var activeEl = document.querySelector('#moon-i-' + thisInterval.id)

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