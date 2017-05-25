import * as mongoose from 'mongoose';
import * as crypto  from 'crypto';

export interface IUser {
   userid: string;
   displayName: string;
   email: string;
   role: string;
   provider: string;
   password: string;
}

export interface IUserModel extends IUser, mongoose.Document {}

export const UserSchema = new mongoose.Schema({
   email: { type: String, lowercase: true, unique: true },
   userid: String,
   displayName: String,
   role: {
     type: String,
     default: 'user'
   },
   hashedPassword: String,
   provider: String,
   salt: String
});

UserSchema
  .virtual('password')
  .set(function(password: string): any {
     this._password = password;
     this.salt = this.makeSalt();
     this.hashedPassword = this.encryptPassword(password);
  })
  .get(function(): string {
    return this._password;
  });

UserSchema
  .virtual('profile')
  .get(function(): any {
    return {
      'name': this.displayName,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function(): any {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email: string): any {
    return email.length;
  }, 'Email cannot be blank');

UserSchema
   .path('email')
   .validate(function(email: string): any {
      const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return re.test(email);
   }, 'Email is not valid');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword: string): any  {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value: string, respond: Function): any {
     const self = this;
     this.constructor.findOne({email: value}, function(err: Error, user: IUser): any {
        if (err) throw err;
        if (user) {
           if (self.userid === user.userid) return respond(true);
           return respond(false);
        }
      respond(true);
    });
}, 'The specified email address is already in use.');

const validatePresenceOf = function(value: any): boolean {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next: Function): any {
     if (!this.isNew || this.provider !== 'local') return next();
     if (!validatePresenceOf(this.hashedPassword))
        next(new Error('Invalid password'));
     else
        next();
  });

  /**
   * Methods
   */
UserSchema.methods.authenticate = function(plainText: string): boolean {
   return this.encryptPassword(plainText) === this.hashedPassword;
};

UserSchema.methods.makeSalt = function(): string {
   return crypto.randomBytes(16).toString('base64');
};

UserSchema.methods.encryptPassword = function(password: string): string {
   if (!password || !this.salt) return '';
   const salt = new Buffer(this.salt, 'base64');
   const hashed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
   return hashed.toString('base64');
 };

export const User = mongoose.model<IUserModel>('User', UserSchema);
