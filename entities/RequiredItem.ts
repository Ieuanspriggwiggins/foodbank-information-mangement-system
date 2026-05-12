import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne} from 'typeorm';


/**
 * Entity used for items that the food bank is requesting at the current time
 */
@Entity('required_items')
export class RequiredItem {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false,
        type: "varchar"
    })
    itemString: string
}