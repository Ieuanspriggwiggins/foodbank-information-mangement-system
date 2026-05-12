import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, ManyToOne} from 'typeorm';

/**
 * Entity used for locations signup is restricted to.
 */
@Entity('restricted_location')
export class RestrictedLocation {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({
        nullable: false,
        type: 'int'
    })
    minEasting: number;

    @Column({
        nullable: false,
        type: 'int'
    })
    maxEasting: number;

    @Column({
        nullable: false,
        type: 'int'
    })
    minNorthings: number

    @Column({
        nullable: false,
        type: 'int'
    })
    maxNorthings: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    place_name: string

    @Column({
        nullable: false,
        type: 'varchar'
    })
    postcode: string

    @Column({
        nullable: false,
        type: 'varchar',
    })
    county_name: string
}
