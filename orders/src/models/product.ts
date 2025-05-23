import mongoose from "mongoose";

interface ProductAttrs {
  id: number; // Store original Spring Boot product ID as integer
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface ProductDoc extends mongoose.Document {
  id: number; // Original Spring Boot product ID
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  version: number;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
}

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret._id;
      },
    },
  }
);

// this is used to increment the version number of the document when it is updated, versionKey is the name of the field in the document that will store the version number
productSchema.set("versionKey", "version");

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs)
};

const Product = mongoose.model<ProductDoc, ProductModel>("Product", productSchema);

export { Product };
