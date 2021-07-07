import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Brand } from "./Brand";
import { OrderItem } from "./OrderItem";
import { Review } from "./Review";
import { SubCategory } from "./SubCategory";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  nameAr: string;

  @Column()
  description: string;

  @Column()
  descriptionAr: string;

  @Column()
  size: string;

  @Column({})
  price: number;

  @Column({})
  cost: number;

  @Column({})
  quantity: number;

  @Column()
  image: string;

  @Column({ default: 0 })
  warranty: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation
  //   subCategoryId
  //   brandId

  // subcat -> one & product -> many
  @ManyToOne((type) => SubCategory, (subcategory) => subcategory.products)
  subcategory: SubCategory;

  @ManyToOne((type) => Brand, (brand) => brand.products)
  brand: Brand;

  @OneToMany((type) => OrderItem, (item) => item.product)
  items: OrderItem[];

  // product -> one & review -> many
  @OneToMany((type) => Review, (review) => review.product)
  reviews: Review[];
}
