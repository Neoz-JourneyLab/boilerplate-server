import chalk from 'chalk'
import {dataSource} from '../datasource'
import {ItemModelEntity} from '../entity/item-model.entity'
import {ItemModels} from './item-modem.seed'

export async function Seeds() {
  console.log(chalk.green('SEEDS !'))
  let count: number = await dataSource.manager.getRepository(ItemModelEntity).count()
  for (const item of ItemModels) {
    console.log(item.alias)
    if (await dataSource.manager.getRepository(ItemModelEntity).findOneBy({alias: item.alias})) {
      await dataSource.manager.createQueryBuilder().update(ItemModelEntity).set({
        category: item.category,
        maxStack: item.maxStack,
        equipable: item.equipable,
        width: item.width,
        height: item.height,
      }).where({alias: item.alias}).execute()
    } else {
      let id: string = '00000000-0000-4000-0000-' + ('000000000000' + count).slice(-12)
      console.log(chalk.rgb(150, 250, 0)('insert item ' + id))
      await dataSource.manager.createQueryBuilder().insert().into(ItemModelEntity).values({
        id: id,
        alias: item.alias,
        category: item.category,
        maxStack: item.maxStack,
        equipable: item.equipable,
        width: item.width,
        height: item.height,
      }).execute()
      count++
    }
  }
}