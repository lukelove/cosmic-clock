import { Controller } from 'stimulus'; 
import { DateTime } from "luxon";
import Interval from "luxon/src/interval.js";

export default class extends Controller {

  static targets = [ "timeNowStr",  ]

  init(times) {
    console.log( 'Sunrise', times.sunrise )
    this.getTattvas(times.sunrise)
  }



  getTattvas(sunrise) {

    var t = DateTime.fromISO(sunrise.toISOString())

    var elCount = 0

    this.intervals = _.map(_.times(5 * 12), (n) => {
      var i = Interval.fromDateTimes(t, ( t = t.plus({minutes: 24}) ))
      
      var data = {
        index: n,
        elIndex: elCount,
        interval: i,
        string: i.start.toLocaleString(DateTime.TIME_24_WITH_SECONDS) + " - " + i.end.toLocaleString(DateTime.TIME_24_WITH_SECONDS)
      }

      if(elCount == 4) { elCount = 0 }else { elCount+=1 } // this gives us access to know which element it is

      return data
    })

    this.toHtml()
  }


  toHtml(){
    var thisInterval = this.interval()
    console.log('active Index:', thisInterval.index)
    var html = _.map(this.intervals, (i) => {
      var klass = ( thisInterval == i ) ? 'bg-green-200' : ''
      var tabIndex = (thisInterval == i ) ? 'tabindex="0"' : ''
      
      var h = '<div class="grid grid-cols-2 gap-4" '+ tabIndex + ' id="sun-i-' + i.index + '">'
        h+= '<div class="' + klass + '">'+ i.string + '</div>'
        h+= '<div class="' + klass + '">'+ this.getElement(i) + '</div>'
      h+= "</div>"
      
      return h
    }).join('')

    this.timeNowStrTarget.innerHTML = html
    document.querySelector('#sun-i-' + thisInterval.index).focus()
  }


  getElement(interval) {
    switch (interval.elIndex) {
      case 0:
        return 'Spirit'
      case 1:
        return 'Air'
      case 2:
        return 'Fire'
      case 3:
        return 'Earth'
      case 4:
        return 'Water'
    }
  }

  interval() {
    return _.find(this.intervals, (i) => { return i.interval.contains( DateTime.now() ) })
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }


}