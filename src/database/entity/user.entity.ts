import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'nickname', nullable: false, unique: true, type: 'varchar'})
  public nickname!: string

  @Column({name: 'socket_id', nullable: true, unique: true, type: 'varchar'})
  public socket_id!: string | null
}
