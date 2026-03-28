import { registerHandler } from "./workerRuntime"

export function registerModule(moduleInstance:any){

  const proto = Object.getPrototypeOf(moduleInstance)

  const methods = Object.getOwnPropertyNames(proto)

  const namespace =
    moduleInstance.constructor.name
      .replace("Module","")
      .toLowerCase()

  methods.forEach((methodName)=>{

    if(methodName === "constructor") return

    const handler =
      moduleInstance[methodName].bind(moduleInstance)

    const command =
      namespace + "." + methodName

    registerHandler(command, handler)

  })

}