import "./workerRuntime"

import { registerModuleClass } from "./workerRuntime"
import { EventModule } from "./modules/eventModule"

console.log("Worker started")

registerModuleClass("EventModule", EventModule)