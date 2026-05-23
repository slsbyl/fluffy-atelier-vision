class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signup = async (req, res) => {
    try {
      const result = await this.authService.signup(req.body);
      res.status(201).json({
        status: 'success',
        token: result.token,
        data: { user: result.user }
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json({
        status: 'success',
        token: result.token,
        role: result.user.role
      });
    } catch (err) {
      res.status(400).json({ status: 'fail', message: err.message });
    }
  };
}

module.exports = AuthController;
