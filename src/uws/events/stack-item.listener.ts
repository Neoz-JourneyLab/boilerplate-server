import {listenersStore} from '../listeners-store'
import {Client} from '../client'
import {UserEntity} from '../../database/entity/user.entity'
import {dataSource} from '../../database/datasource'
import {ItemEntity} from '../../database/entity/item.entity'

listenersStore.on('stack:items', async (client: Client, data: { addOnId: string, removeOnId: string }) => {
  const user: UserEntity | null = await dataSource.manager.getRepository(UserEntity).findOneBy({socket_id: client.socketId})

  if (!user) {
    throw new Error('user not found')
  }

  const item1: ItemEntity | null = await dataSource.manager.getRepository(ItemEntity).createQueryBuilder('items')
    .innerJoin('items.user', 'user')
    .innerJoinAndSelect('items.model', 'model')
    .where('user.id = :id AND items.id = :idi', {id: user.id, idi: data.addOnId})
    //.select(['items.id', 'items.quantity', 'model.id', 'model.width', 'model.height', 'model.alias', 'items.x', 'items.y'])
    .getOne()
  const item2: ItemEntity | null= await dataSource.manager.getRepository(ItemEntity).createQueryBuilder('items')
    .innerJoin('items.user', 'user')
    .where('user.id = :id AND items.id = :idi', {id: user.id, idi: data.removeOnId})
    //.select(['items.id', 'items.quantity', 'model.id', 'model.width', 'model.height', 'model.alias', 'items.x', 'items.y'])
    .getOne()
  if (!item2 || !item1) throw new Error('items not found')
  if(item1.quantity + item2.quantity <= item1.model.maxStack){
    console.log('can destroy', item2.id)
    await dataSource.manager.createQueryBuilder()
      .update(ItemEntity).set({quantity: item1.quantity + item2.quantity})
      .where({id: item1.id}).execute()
    await dataSource.manager.createQueryBuilder()
      .delete().from(ItemEntity).where({id: item2.id}).execute()
  } else {
    const overload: number = (item1.quantity + item2.quantity) - item1.model.maxStack
    console.log(item2.id, 'is now selected, got', overload, 'remaining')
    await dataSource.manager.createQueryBuilder()
      .update(ItemEntity).set({quantity: item1.model.maxStack})
      .where({id: item1.id}).execute()
    await dataSource.manager.createQueryBuilder()
      .update(ItemEntity).set({quantity: overload, x: -1, y: -1})
      .where({id: item2.id}).execute()
  }
})
