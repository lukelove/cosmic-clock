import { Controller } from 'stimulus'; 
import { DateTime } from "luxon";
import Interval from "luxon/src/interval.js";

export default class extends Controller {

  static targets = [ "timeNowStr" ]

  init(sunrise) {
    // console.log( 'Sunrise', sunrise )

    var t = sunrise

    var elCount = 0

    this.intervals = _.map(_.times(5 * 12), (n) => {
      var i = Interval.fromDateTimes(t, ( t = t.plus({minutes: 24}) ))
      
      var data = {
        index: n,
        elIndex: elCount,
        interval: i,
        string: i.start.toLocaleString(DateTime.TIME_24_WITH_SECONDS) + " - " + i.end.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }

      if(elCount == 4) { elCount = 0 } else { elCount+=1 } // this gives us access to know which element it is

      return data
    })

    this.toHtml()
  }


  toHtml(){
    var thisInterval = this.interval()
    var html = _.map(this.intervals, (i) => {
      var klass = ( thisInterval == i ) ? 'bg-purple-500' : ''
      var tabIndex = (thisInterval == i ) ? 'tabindex="0"' : ''
      var el = this.getElement(i)
      
      var h = '<div class="' + klass + ' p-2 grid grid-cols-2 gap-4" '+ tabIndex + ' id="sun-i-' + i.index + '">'
        h+= '<div>'+ i.string + '</div>'
        h+= '<div class="pl-12 ' + el + '">'+ _.capitalize(el) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html
    var activeEl = document.querySelector('#sun-i-' + thisInterval.index)
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