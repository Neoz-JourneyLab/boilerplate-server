import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('zombie:dead', async (_client: Client, data: { zid: string }) => {
  clientsStore.broadcast('zombie', data)
})
