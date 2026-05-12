import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne} from 'typeorm';

//Website user types are users who are able to log into the website while service users are those whose accounts
//are created on the system itself by the staff, such as for homeless or families who do not have access to the
//internet and the website.
export enum UserType{
    WEBSITE = 'Website',
    SERVICE = 'Service',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column({
        nullable: false,
        type: 'varchar'
    })
    first_name: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    last_name: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    email: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    phone_number: string

    @Column({
        nullable: true,
        type: 'varchar',
        default: null
    })
    hashed_password: string

    @Column({
        nullable: false,
        type: 'varchar',
        default: null
    })
    postcode: string;

    @Column({
        nullable: false,
        type: 'varchar',
        default: null
    })
    address: string

    @Column({
        type: 'set',
        enum: UserType,
        default: UserType.WEBSITE
    })
    account_type: UserType

    @CreateDateColumn()
    date_created: Date;
}