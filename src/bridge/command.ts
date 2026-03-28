export function buildCommand(
  moduleClass: any,
  method: string
){

  return moduleClass.name + "." + method

}