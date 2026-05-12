import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne} from 'typeorm';
import {getFormattedDate} from "../libraries/DateFormatter";

@Entity('donations')
export class Donation {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        type: "int",
        transformer: {
            to(value) {
                return value;
            },
            from(value) {
                return '£' + (value / 100).toLocaleString();
            }
        }
    })
    amount_total: number;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_email: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_name: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_address_city: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_address_country: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_address_line_1: string;

    @Column({
        nullable: true,
        type: 'varchar',
        default: null
    })
    donation_address_line_2: string;

    @Column({
        nullable: false,
        type: 'varchar'
    })
    donation_address_postcode: string;

    @Column({
        nullable: true,
        type: 'varchar',
        default: null
    })
    donation_address_state: string;

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
    donation_date: Date;
}