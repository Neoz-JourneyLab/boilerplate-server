import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm'
import {UserEntity} from './user.entity'

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid', {name: 'id'})
  public id!: string

  @Column({name: 'cipher', nullable: false, unique: true, type: 'varchar'})
  public cipher!: string

  @Column({name: 'ratchet_infos', nullable: false, unique: false, type: 'varchar'})
  public ratchet_infos!: string

  @Column({name: 'sender_rsa_info', nullable: false, unique: false, type: 'varchar'})
  public sender_rsa_info!: string

  @Column({name: 'send_at', nullable: false, default: () => 'current_timestamp', type: 'timestamptz'})
  public send_at!: Date

  @Column({name: 'distributed_at', nullable: true, default: null, type: 'timestamptz'})
  public distributed_at!: Date | null

  @ManyToOne(() => UserEntity, user => user.messagesFrom)
  @JoinColumn({referencedColumnName: 'id', name: 'from_id'})
  public from!: UserEntity

  @ManyToOne(() => UserEntity, user => user.messagesTo)
  @JoinColumn({referencedColumnName: 'id', name: 'to_id'})
  public to!: UserEntity
}
