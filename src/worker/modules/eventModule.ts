import { setState } from "../workerStore"

export class EventModule {

    private events: any[] = []

    async fetchEvents() {

        // mock API for now
        const data = [
            { id: 1, name: "Event A" },
            { id: 2, name: "Event B" }
        ]

        this.events = data

        setState("events", this.events)

        return this.events
    }

}