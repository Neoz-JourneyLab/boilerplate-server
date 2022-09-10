import {Client} from './client'

export class ListenersStore {
  private store: Map<string, Function> = new Map<string, Function>()

  public on(eventName: string, cb: Function): void {
    this.store.set(eventName, cb)
  }

  public async exec(eventName: string, client: Client, payload: object): Promise<void> {
    const listener: Function | undefined = this.store.get(eventName)
    if(!listener) {
      throw new Error( `No listener for event: ${eventName}`)
    }

    await listener(client, payload, {name: eventName})
  }
}

export const listenersStore = new ListenersStore()
