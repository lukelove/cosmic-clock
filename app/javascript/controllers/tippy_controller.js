import { Controller } from 'stimulus'; 
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling


export default class extends Controller {
  
  initialize() { 
    // this code is duplicated in the location_controller.js
    
    
    // cleanup tippys
    if (this.tippys == undefined) this.tippys = []
    _.each(this.tippys, (t) => { t.destroy() })

    this.tippys = []
    var elements = ["air", "water", "earth", "fire", "spirit"]
    _.each(elements, (e) => {
      _.each( _.concat(e, this.elementToPlanets(e)), (el) => {
        this.tippys.push( tippy('.' + el, {content: _.capitalize(el)}) )
      } )
    })
    
    this.tippys = _.flattenDeep(this.tippys)    
  }

  elementToPlanets(element){
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