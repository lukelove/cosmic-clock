import { DateTime, Duration, Interval } from "luxon";
var _ = require('lodash');
var SunCalc = require('suncalc');
import Cookies from "js-cookie";

(function() {

class CelestialInterval {
  constructor(interval){
    this.interval = interval
    this.time_string = this.interval.start.toLocaleString(DateTime.TIME_24_SIMPLE ) + " - " + this.interval.end.toLocaleString(DateTime.TIME_24_SIMPLE )
  }
}


class SunMagic {
  constructor(sunrise){
    this.sunrise = sunrise
    this.createIntervals(sunrise)
  }

  createIntervals(interval_start){
    var loopCount = 0

    this.intervals = _.map(_.times(5 * 12), (n) => {
      var element = ['spirit', 'air', 'fire', 'earth', 'water'][loopCount]
      if(loopCount == 4) { loopCount = 0 } else { loopCount+=1 } // this gives us access to know which element it is

      return new SunInterval(
        Interval.fromDateTimes(interval_start, ( interval_start = interval_start.plus({minutes: 24}) )),
        element, this.planetsIRule(element)
      )

    })
  }

  planetsIRule(element)  {
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

}

class MoonInterval extends CelestialInterval {
  constructor(interval, element, planet){
    // Chain constructor with super
    super(interval)
    this.element = element
    this.planet = planet
    this.elements = _.concat(this.element, this.planet)
  }
}

class MoonMagic {
  constructor(sunrise, sunset){

    var wholeDayMs = 86400000
    var dayMS = sunrise.diff(sunset).milliseconds * -1
    var nightMS = wholeDayMs - dayMS
    this.sunshineHourLengthInMS = parseInt(dayMS/12) // milliseconds
    this.moonlightHourLengthInMS = parseInt(nightMS/12) // milliseconds


    this.sunshineIntervals = this.createInterval(0, sunrise, this.offset(sunrise), this.sunshineHourLengthInMS)
    var offset = ( _.last(this.sunshineIntervals).planet == 'mercury' ) ? 0 : ( this.planets().indexOf(_.last(this.sunshineIntervals)) + 1)
    this.moonlightIntervals = this.createInterval(12, sunset, offset, this.moonlightHourLengthInMS) 
    this.intervals = _.concat( this.sunshineIntervals, this.moonlightIntervals )
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

  planetToElement(planet){
    switch (planet) {
      case 'sun':
      case 'mars':
        return 'fire'
      case 'mercury':
      case 'saturn':
        return 'water'
      case 'venus':
      case 'jupiter':
        return 'air'
      case 'moon':
        return 'earth'
    }
  }

  planets() { return ['moon', 'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury'] }

  createInterval(indexOffset, time, elOffset, intervalLength) {
    var loopCount = 0
    var owner = (indexOffset == 0) ? 'sun' : 'moon'

    return _.map(_.times(12), (n) => {
      var planet = this.planets()[elOffset]
      if(elOffset == 6) { elOffset = 0 } else { elOffset+=1 } // this gives us access to know which element it is

      return new MoonInterval(
        Interval.fromDateTimes(time, ( time = time.plus({millisecond: intervalLength}) )),
        this.planetToElement(planet),
        planet
      )

    })
  }


}


class SunInterval extends CelestialInterval {
  constructor(interval, element, planets){
    // Chain constructor with super
    super(interval)
    this.element = element
    this.planets = planets
    this.elements = _.concat(this.element, this.planets)
  }
}

class Earth {
  constructor(date, lat, lng){
    this.lat = lat
    this.lng = lng
    this.setTimes(date)
  }

  setTimes(date) {

    var today = this.today()

    // Use Cookies
    if( Cookies.get('today') == today.toISODate() ){
      this.sunrise = DateTime.fromISO(Cookies.get('sunrise'))
      this.sunset = DateTime.fromISO(Cookies.get('sunset'))
      return
    }


    // No cookies found, go get the data

    var url = ['https://api.sunrise-sunset.org/json?lat=', this.lat, '&lng=', this.lng, '&date=', today.toISODate(),'&formatted=0'].join('')
    fetch( url ).then(response => response.json()) .then((data) => { 
      Cookies.set('today', today.toISODate())
      Cookies.set('sunrise', data.results.sunrise)
      Cookies.set('sunset', data.results.sunset)

      this.sunrise = DateTime.fromISO(data.results.sunrise)
      this.sunset = DateTime.fromISO(data.results.sunset)
    })

  }

  today(){
 
    // if now is after sunrise, use today
    // if now is before sunrise, use yesterday

    var times = SunCalc.getTimes(new Date(), this.lat, this.lng);
    console.log('times', times, this.lat, this.lng)
    var sunrise = DateTime.fromISO(times.sunrise.toISOString())

    if( DateTime.now() < sunrise ){
      console.log("using Yesterday's Sunrise")
      var d = new Date();
      d.setDate(d.getDate() - 1);
      times = SunCalc.getTimes(d, this.lat, this.lng);
      sunrise = DateTime.fromISO(times.sunrise.toISOString())
    }

    this.daily_ruler = this.dailyRuler(parseInt(sunrise.toFormat('c')))

    return sunrise
  }

  dailyRuler(day_of_week){ // 1-7
    return ['moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'sun'][day_of_week - 1]
  }

}

class WindowsInTime {
  constructor(date, lat, lng){
    this.earth = new Earth(date, lat, lng)
    this.sun = new SunMagic(this.earth.sunrise)
    this.moon = new MoonMagic(this.earth.sunrise, this.earth.sunset)
  }
}


console.log('WindowsInTime start')
var wit = new WindowsInTime(DateTime.now(), '-8.340539', '115.091949')
console.log('WindowsInTime end', wit)


})()