import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'
import {ItemEntity} from '../../database/entity/item.entity'

listenersStore.on('item:coord', async (client: Client, data: { id: string, x: number, y: number }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})

  if (!user) {
    throw new Error('user not found')
  }

  const item: ItemEntity | null = await dataSource.manager.getRepository(ItemEntity).createQueryBuilder('items')
    .innerJoin('items.user', 'user')
    .innerJoinAndSelect('items.model', 'model')
    .where('user.id = :id AND items.id = :idi', {id: user.id, idi: data.id})
    .getOne()

  if (!item) throw new Error('item not found')

  await dataSource.manager.createQueryBuilder()
    .update(ItemEntity).set({x: data.x, y: data.y})
    .where({id: item.id}).execute()
})
