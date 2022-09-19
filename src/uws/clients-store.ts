import {Client} from './client'

export class ClientsStore {
  public store: Map<string, Client> = new Map<string, Client>()

  public set(socketId: string, client: Client): ClientsStore {
    this.store.set(socketId, client)
    return this
  }

  public getBySocketId(socketId: string | null): Client | undefined {
    if(!socketId) {
      return
    }
    return this.store.get(socketId) as Client | undefined
  }

  public broadcast(eventName: string, payload?: object, channel?: string): void {
    this.store.forEach((client: Client) => {
      if(channel == undefined || client.channels.includes(channel)) client.emit(eventName, payload)
    })
  }

  public broadcastOther(us: Client, eventName: string, payload?: object, channel?: string): void {
    for(const cli of this.store){
      if(channel != undefined && !cli[1].channels.includes(channel)) continue
      if(cli[0] ==  us.socketId ) continue
      cli[1].emit(eventName, payload)
    }
  }

  public kickAllClients(message?: string): void {
    clientsStore.broadcast('server:off')
    this.store.forEach((client: Client) => client.kick(message || 'kick all clients'))
  }

  public delete(socketId: string): boolean {
    //log.info(`deleted ${socketId} from client store`)
    return this.store.delete(socketId)
  }

  public getMap(): Map<string, Client> {
    return this.store
  }
}

export const clientsStore: ClientsStore = new ClientsStore()
