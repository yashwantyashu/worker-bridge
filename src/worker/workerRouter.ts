export type Middleware =
  (command:string,payload:any,next:Function)=>Promise<any>

export class WorkerRouter {

  private handlers = new Map<string, Function>()
  private middlewares: Middleware[] = []

  register(command:string, handler:Function){
    this.handlers.set(command, handler)
  }

  use(middleware:Middleware){
    this.middlewares.push(middleware)
  }

  async handle(command:string, payload:any){

    const handler = this.handlers.get(command)

    if(!handler){
      throw new Error(`No handler for ${command}`)
    }

    let index = -1

    const dispatch = async (i:number):Promise<any> => {

      if(i <= index){
        throw new Error("next() called multiple times")
      }

      index = i

      const middleware = this.middlewares[i]

      if(middleware){
        return middleware(command,payload,()=>dispatch(i+1))
      }

      return handler(payload)

    }

    return dispatch(0)

  }

}