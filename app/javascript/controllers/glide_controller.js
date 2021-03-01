import { Controller } from 'stimulus';
import Glide from '@glidejs/glide'

export default class extends Controller {

  static targets = [ "nav" ]
  // static values = {}

  connect(){
    this.glide = new Glide('.' + this.element.getAttribute('data-glide-class'))
    this.glide.on(['swipe.end'], (x) => { this.changeNav() })
    this.glide.mount()
    this.changeNav()
  }

   changeNav(){
    var classes = ["text-blue-500", "border-b-2", "font-medium", "border-blue-500"]
    var btns = this.navTarget.querySelectorAll('.glide-nav button')
    _.each(btns, (btn, i) => { _.each(classes, (c) => { btn.classList.remove(c) }) })
    _.each(classes, (c) => { btns[this.glide.index].classList.add(c) })
   }

   go(event){
     this.glide.go( '=' + event.currentTarget.getAttribute('data-actor') )
   }

}