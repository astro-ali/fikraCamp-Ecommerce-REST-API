import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { Order } from "./Order";
import { Review } from "./Review";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  password: string;

  @Column()
  isVerified: boolean;

  @Column()
  otp: number;

  @Column()
  isBuyer: boolean;

  @Column()
  birthDate: Date;

  @Column()
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //

  @OneToMany((type) => Order, (order) => order.user)
  orders: Order[];

  @OneToMany((type) => Review, (review) => review.user)
  reviews: Review[];
}
