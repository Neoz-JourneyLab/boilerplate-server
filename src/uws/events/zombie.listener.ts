import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('send:zombie:target', async (client: Client, data: { x: string, z: number, speed: number, zid: string, spawnX: number, spawnZ: number }) => {
  clientsStore.broadcastOther(client,'zombie', data)
})
