import {dataSource} from '../datasource'
import {Seeds} from './seeds'

dataSource.initialize().then(async () => {
  await Seeds()
})

