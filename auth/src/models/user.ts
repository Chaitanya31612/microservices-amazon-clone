import mongoose, { Document, Model, Schema } from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User document has
interface UserDoc extends Document {
  email: string;
  password: string;
}

// interface to describe properties that a User model has
interface UserModel extends Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // override toJSON method to change the JSON response
    toJSON: {
      versionKey: false, // remove __v property
      transform(doc, ret) {
        // change _id to id and remove password
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }

  done();
});

// statics is used to add a method directly to the model, so User.build({...}) can be used
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
