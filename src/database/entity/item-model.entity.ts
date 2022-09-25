import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {ItemEntity} from './item.entity'

@Entity('item_model')
export class ItemModelEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'alias', nullable: false, unique: true, type: 'varchar'})
  public alias!: string

  @Column({name: 'category', nullable: false, unique: true, type: 'varchar'})
  public category!: string

  @Column({name: 'equipable', nullable: false, unique: false, type: 'bool'})
  public equipable!: boolean

  @Column({name: 'width', nullable: false, unique: false, type: 'smallint'})
  public width!: number

  @Column({name: 'height', nullable: false, unique: false, type: 'smallint'})
  public height!: number

  @Column({name: 'max_stack', nullable: false, unique: false, type: 'smallint'})
  public maxStack!: number

  @OneToMany(() => ItemEntity, (i) => i.model)
  items!: ItemEntity[]
}
