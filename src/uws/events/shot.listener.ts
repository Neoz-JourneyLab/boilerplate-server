import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('shot', async (client: Client) => {
  clientsStore.broadcastOther(client, 'player:shot', {id: client.socketId}, client.channels[0])
})
