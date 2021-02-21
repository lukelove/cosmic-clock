import { Controller } from 'stimulus'; 
export default class extends Controller {
  connect() {
    // alert("hello from Moon StimulusJS")
  }

  getControllerByIdentifier(identifier) {
    return this.application.controllers.find(controller => {
      return controller.context.identifier === identifier;
    });
  }
  
}