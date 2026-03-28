import "./workerRuntime"
import { registerModule } from "./registerModule"

export function createWorker(config:{
  modules:any[]
}){

  config.modules.forEach((ModuleClass)=>{

    const instance = new ModuleClass()

    registerModule(instance)

  })

}