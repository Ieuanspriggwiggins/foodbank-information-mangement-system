import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";

export enum DietaryRequirements {
    NUT_FREE = 'Nut Free',
    DAIRY_FREE = 'Dairy Free',
    GLUTEN_FREE = 'Gluten Free',
    VEGAN = 'Vegan',
    VEGETARIAN = 'Vegetarian',
    PESCATARIAN = 'Pescatarian',
    FISH = 'Fish & Shellfish Free',
    HALAL = 'Halal'
}

export enum StockStatus {
    IN_STOCK= 'in_stock',
    OUT_OF_STOCK = 'out_of_stock'
}

@Entity('food_package')
export class FoodPackage {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        nullable: false,
        type: 'varchar',
    })
    name: string

    @Column({
        nullable: false,
        type: 'varchar',
        length: 4096
    })
    information: string

    @Column({
        nullable: false,
        type: 'varchar',
        length: 4096
    })
    contents: string

    @Column({
        nullable: true,
        type: 'set',
        enum: DietaryRequirements

    })
    dietary_requirements: DietaryRequirements[]

    @Column({
        nullable: false,
        type: 'set',
        enum: StockStatus,
        default: StockStatus.IN_STOCK,
    })
    stock_status: StockStatus
}