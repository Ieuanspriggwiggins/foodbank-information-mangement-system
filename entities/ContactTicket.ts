import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
import {getFormattedDate} from "../libraries/DateFormatter";

export enum ContactTicketType {
    FOOD_DONATION = 'Food Donation',
    CONTACT_FORM = 'Contact Form',
}

@Entity('contact_ticket')
export class ContactTicket {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    name: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    organisation: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    contact_email: string;

    @Column({
        nullable: false,
        type: 'varchar',
        default: 'None'
    })
    contact_number: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    message: string;

    @Column({
        nullable: false,
        type: 'set',
        enum: ContactTicketType
    })
    ticket_type: ContactTicketType;

    @CreateDateColumn({
        transformer: {
            to(date) {
                return date;
            },
            from(date) {
                return getFormattedDate(date);
            }
        }
    })
    date_received: Date
}