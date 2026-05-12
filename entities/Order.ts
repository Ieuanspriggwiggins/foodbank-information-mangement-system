import {Entity, PrimaryGeneratedColumn, Column, ValueTransformer, CreateDateColumn, OneToOne, JoinColumn, ManyToOne} from 'typeorm';
import {User} from "./User";
import {FoodPackage} from "./FoodPackage";
import {getFormattedDate} from "../libraries/DateFormatter";


export enum OrderStatus {
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    DELIVERY = 'Being Delivered',
    READY_FOR_COLLECTION = 'Ready For Collection',
    AWAITING_APPROVAL = 'Awaiting Approval',
    CANCELLED = 'Cancelled'
}

export enum OrderType{
    COLLECTION = 'Collection',
    DELIVERY = 'Delivery',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn()
    user: User;

    @ManyToOne(() => FoodPackage, foodPackage => foodPackage.id)
    @JoinColumn()
    food_package: FoodPackage;

    @Column({
        type: 'set',
        enum: OrderType,
        nullable: false,
        default: OrderType.COLLECTION
    })
    order_type: OrderType;

    @Column({
        type: 'set',
        enum: OrderStatus,
        nullable: false,
        default: OrderStatus.IN_PROGRESS
    })
    order_status: OrderStatus

    @CreateDateColumn({
        nullable: false,
    })
    date_created: Date;


    @CreateDateColumn({
        nullable: true
    })
    date_completed: Date | null;
}