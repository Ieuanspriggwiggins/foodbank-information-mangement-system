import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

export enum AdminRole {
    ADMINISTRATOR = 'administrator',
    EDITOR = 'editor'
}

@Entity('admin_users')
export class AdminUser {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column({
        nullable: false,
        type: 'varchar',
        unique: true
    })
    email: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    name: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    hashed_password: string

    @Column({
        nullable: false,
        enum: AdminRole,
        type: "set",
        default: AdminRole.EDITOR
    })
    user_role: AdminRole

    @CreateDateColumn()
    date_created: Date;

    @Column({nullable: false, type: "boolean", default: true})
    is_deletable: Boolean //Determines whether the account can be deleted.
}