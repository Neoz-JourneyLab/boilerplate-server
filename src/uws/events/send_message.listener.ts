import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {MessageEntity} from '../../database/entity/message.entity'
import {clientsStore} from '../clients-store'
import {getBothUsers} from './set_distributed.listener'

listenersStore.on('send:message', async (client: Client, data: {
  cipher: string,  to: string, ratchet_infos: string, sender_rsa_info: string, root_id: string, ratchet_index: number, id: string
}) => {
  console.log(data)
  try {
    const users = await getBothUsers(client.socketId, data.to)
    const user: UserEntity = users.user
    const to: UserEntity = users.user2

    const date = new Date()
    await dataSource.manager.createQueryBuilder().insert().into(MessageEntity).values({
      id: data.id,
      from: user,
      to: to,
      cipher: data.cipher,
      ratchet_infos: data.ratchet_infos,
      root_id: data.root_id,
      ratchet_index: data.ratchet_index,
      sender_rsa_info: data.sender_rsa_info,
      send_at: date,
      distributed_at: to.socket_id == null ? null : date
    }).execute()

    const message = {
      id: data.id,
      from: user.id,
      to: to.id,
      cipher: data.cipher,
      ratchet_infos: data.ratchet_infos,
      sender_rsa_info: data.sender_rsa_info,
      root_id: data.root_id,
      ratchet_index: data.ratchet_index,
      content: data.cipher,
      send_at: date,
      distributed: to.socket_id != null,
      pending_batch: '1/1',
    }
    client.emit('new:message', message)

    if (to.socket_id != null) {
      clientsStore.getBySocketId(to.socket_id)?.emit('new:message', message)
    }
  } catch (err) {
    client.emitError(__filename.split('\\')[__filename.split('\\').length], err as string)
  }
})
