import {listenersStore} from "../listeners-store"
import {Client} from "../client"
import {clientsStore} from "../clients-store";

listenersStore.on('shot', async (_client: Client) => {
  clientsStore.broadcastOther(_client, 'player:shot', {id: _client.socketId})
})
