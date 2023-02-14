import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../index'
import {MessageEntity} from '../../database/entity/message.entity'

/**
 * send all last message from all conversation we have
 */
listenersStore.on('request:conversations', async (client: Client) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  if (!user) throw new Error('user not found')

  //get all users related
  const usersDistant: UserEntity[] = await dataSource.manager.getRepository(UserEntity).createQueryBuilder('user')
    .leftJoin('user.messagesFrom', 'from') //all sent messages
    .leftJoin('user.messagesTo', 'to') //all received messages
    .leftJoin('from.to', 'too') //that are for sent messages
    .leftJoin('to.from', 'fromm') //that are from emitted messages
    .where('too.id = :id OR fromm.id = :id', {id: user.id})
    .select(['user.id'])
    .getMany()

  //for each users, get and send last message
  for (const u of usersDistant) {
    const m: MessageEntity | null = await dataSource.manager.getRepository(MessageEntity).createQueryBuilder('message')
      .innerJoin('message.from', 'from')
      .innerJoin('message.to', 'to')
      .where('(from.id = :id AND to.id = :ido) OR (from.id = :ido AND to.id = :id)', {id: user.id, ido: u.id})
      .select(['message.id', 'message.send_at', 'message.distributed_at',
        'from.id', 'to.id', 'message.root_id', 'message.ratchet_index', 'message.cipher', 'message.ratchet_infos', 'message.sender_rsa_info'])
      .orderBy('send_at', 'DESC')
      .getOne()


    if (!m) throw new Error('cannot find message')

    client.emit('new:message', {
      id: m.id,
      from: m.from.id,
      to: m.to.id,
      ratchet_infos: m.ratchet_infos,
      sender_rsa_info: m.sender_rsa_info,
      root_id: m.root_id,
      ratchet_index: m.ratchet_index,
      cipher: m.cipher,
      send_at: m.send_at,
      distributed: m.distributed_at != null,
      pending_batch: '1/1',
    })
  }
})
