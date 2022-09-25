import {GetUws} from './uws/uws'
import {UserEntity} from './database/entity/user.entity'
import {GameEntity} from './database/entity/game.entity'
import {dataSource} from './database/datasource'
import {Seeds} from './database/seeds/seeds'


dataSource.initialize().then(async () => {
  //getExpress()
  await Seeds()
  await GetUws()
  await dataSource.manager.createQueryBuilder().update(UserEntity).set({socket_id: null}).execute()
  await dataSource.manager.createQueryBuilder().delete().from(GameEntity).execute()
})
