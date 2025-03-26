const ModelHelper = require("../../helpers/ModelHelper");
const User = require("../auth/User.model");
const AuthStateHelper = require("../../helpers/AuthStateHelper");

class UserHelper extends ModelHelper {
  constructor() {
    super(User);
    this.authStateHelper = new AuthStateHelper();
  }

  // Add user-specific methods here
  async findByEmail(email) {
    return this.findOne({ email });
  }

  async updatePassword(id, password) {
    return this.update(id, { password });
  }

  async verifyEmail(id) {
    return this.update(id, { emailVerified: true });
  }

  async updateProfile(id, data) {
    const allowedFields = ["name", "address", "phone", "avatar"];
    const updateData = {};

    Object.keys(data).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = data[key];
      }
    });

    return this.update(id, updateData);
  }

  async Response(user) {
    if (!user) {
      return null;
    }

    if (typeof user === "string") {
      user = await this.findById(user);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      avatar: user.avatar,
    };
  }
}

module.exports = UserHelper;
