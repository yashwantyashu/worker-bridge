export function Command(name:string){

  return function(
    target:any,
    propertyKey:string,
    descriptor:PropertyDescriptor
  ){

    if(!target.__commands){
      target.__commands = []
    }

    target.__commands.push({
      name,
      method: propertyKey
    })

  }

}

export const Commands = {

  ADD_NUMBERS: "ADD_NUMBERS",

} as const