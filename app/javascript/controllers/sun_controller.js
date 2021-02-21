import { Controller } from 'stimulus'; 
var dayjs = require('dayjs');
export default class extends Controller {


  initialize(times) {
    // var 
    console.log( 'Sun times', times )
  }
  connect() {
    
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }


}