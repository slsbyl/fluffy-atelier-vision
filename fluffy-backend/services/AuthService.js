const jwt = require('jsonwebtoken');

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  async signup(data) {
    const { name, email, password, role } = data;
    const newUser = await this.userModel.create({
      name, email, password, role
    });
    const token = this.signToken(newUser._id);
    return { user: newUser, token };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('Incorrect email or password');
    }
    const token = this.signToken(user._id);
    return { user, token };
  }
}

module.exports = AuthService;
