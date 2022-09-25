import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {UserEntity} from './user.entity'
import {ItemModelEntity} from './item-model.entity'

@Entity('items')
export class ItemEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @ManyToOne(() => UserEntity, (u) => u.items, {nullable: false})
  user!: UserEntity

  @ManyToOne(() => ItemModelEntity, (i) => i.items, {nullable: false})
  model!: ItemModelEntity

  @Column({name: 'quantity', nullable: false, unique: false, type: 'smallint'})
  public quantity!: number

  @Column({name: 'x', nullable: false, unique: false, type: 'smallint'})
  public x!: number

  @Column({name: 'y', nullable: false, unique: false, type: 'smallint'})
  public y!: number
}
