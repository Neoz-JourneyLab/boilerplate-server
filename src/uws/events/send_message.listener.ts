import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {MessageEntity} from '../../database/entity/message.entity'
import {clientsStore} from '../clients-store'
import {getBothUsers} from './set_distributed.listener'

/**
 * store a message to database, and if dest is online, send it to him
 */
listenersStore.on('send:message', async (client: Client, data: {
  cipher: string, to: string, ratchet_infos: string, sender_rsa_info: string, root_id: string, ratchet_index: number, id: string
}) => {
  console.log(data)

  if (data.ratchet_index > 1 && data.ratchet_infos != '') {
    throw new Error('cannot deliver info with used ratchet')
  }

  if (data.ratchet_infos != '' && data.sender_rsa_info == '' || data.ratchet_infos == '' && data.sender_rsa_info != '') {
    throw new Error('cannot send ratchet infos without rsa infos')
  }

  const users = await getBothUsers(client.socketId, data.to)
  const user: UserEntity = users.user
  const to: UserEntity = users.user2

  //check that if the message contains ratchet info, the previous message does not contain any from the same sender
  const lastMessageFromThatConv: MessageEntity | null = await dataSource.manager.getRepository(MessageEntity).createQueryBuilder('message')
    .innerJoin('message.from', 'from')
    .innerJoin('message.to', 'to')
    .where('(from.id = :id AND to.id = :ido) OR (from.id = :ido AND to.id = :id)', {id: user.id, ido: to.id})
    .select(['message.id', 'message.send_at', 'from.id', 'to.id', 'message.ratchet_infos'])
    .orderBy('send_at', 'DESC')
    .getOne()

  //check if we are not sending twice in a row ratchets information
  if (lastMessageFromThatConv) {
    if (lastMessageFromThatConv.from.id == user.id && data.ratchet_infos != '') {
      throw new Error('cannot send ratchet infos : previous message is from us')
    }
    //check if we send ratchet info if last message was from other user
    if (lastMessageFromThatConv.from.id == to.id && data.ratchet_infos == '') {
      throw new Error('cannot send new message if it doesnt contains ratchet infos : last message is not from us')
    }
  }

  const date = new Date()
  //add in db
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
})
