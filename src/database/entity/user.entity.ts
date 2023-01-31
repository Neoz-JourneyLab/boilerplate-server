import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm'
import {MessageEntity} from './message.entity'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'nickname', nullable: false, unique: true, type: 'varchar'})
  public nickname!: string

  @Column({name: 'socket_id', nullable: true, unique: true, type: 'varchar'})
  public socket_id!: string | null

  @Column({name: 'default_public_rsa', nullable: false, unique: false, type: 'varchar'})
  public default_public_rsa!: string

  @Column({name: 'password', nullable: false, type: 'varchar'})
  public password!: string

  @Column({name: 'salt', nullable: false, type: 'varchar', length: 16})
  public salt!: string

  @OneToMany(() => MessageEntity, messages => messages.from)
  public messagesFrom!: MessageEntity[]

  @OneToMany(() => MessageEntity, messages => messages.to)
  public messagesTo!: MessageEntity[]
}
