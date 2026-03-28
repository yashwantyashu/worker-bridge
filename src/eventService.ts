import { RunInWorker } from "./decorators/runInWorker"
import { workerStore } from "./bridge/workerStore"

export class EventService {

    // reactive stream
    events$ = workerStore<{ id: number; name: string }[]>("events")

    @RunInWorker()
    fetchEvents() { }

}