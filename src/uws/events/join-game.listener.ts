import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {dataSource} from '../../database/datasource'
import {UserEntity} from '../../database/entity/user.entity'
import {GameEntity} from '../../database/entity/game.entity'
import {clientsStore} from '../clients-store'

listenersStore.on('join:game', async (client: Client, data: { id: string }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})
  if (!user) throw  new Error('user not found')
  const game: GameEntity | null = await dataSource.manager.getRepository(GameEntity).findOne(
    {
      relations: {user: true},
      select: {
        id: true,
        user: {
          id: true
        }
      },
      where: {id: data.id}
    })
  console.log('starting game : ', game)
  if (!game) throw  new Error('game not found')
  const host: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({id: game.user.id})
  if (!host) throw  new Error('host not found')
  if (!host.socket_id) throw  new Error('host not online')

  if(client.socketId != host.socket_id) {
    client.subscribe(game.id)
    client.emit('joined:game', {id: data.id, host: false})
  }
  clientsStore.getBySocketId(host.socket_id)?.emit('joined:game', {id: data.id, host: true})
  clientsStore.getBySocketId(host.socket_id)?.subscribe(game.id)
})
