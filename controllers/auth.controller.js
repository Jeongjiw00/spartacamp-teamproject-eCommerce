const AuthService = require('../services/auth.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
  authService = new AuthService();
  // 회원가입(id 동일하면 안됨!)
  join = async (req, res, next) => {
    try {
      const { id, password, nickname, email, address } = req.body;
      if (!id || !password || !nickname || !email || !address) {
        return res.status(400).json({ message: '모든 값을 입력하세요.' });
      }

      const foundById = await this.authService.findById(id);

      if (foundById.length > 0) {
        return res
          .status(409)
          .json({ message: `${id}는 이미 존재하는 아이디입니다.` });
      }

      const foundByNickname = await this.authService.findByNickname(nickname);

      if (foundByNickname.length > 0) {
        return res
          .status(409)
          .json({ message: `${nickname}는 이미 존재하는 닉네임입니다.` });
      }

      const hashed = await bcrypt.hash(password, 12);

      const createUser = await this.authService.createUser(
        id,
        hashed,
        nickname,
        email,
        address
      );

      res
        .status(201)
        .json({ data: createUser, message: '회원가입이 완료되었습니다.' });
    } catch (error) {
      res.status(400).json({ errorMessage: error.message });
    }
  };

  // 로그인
  login = async (req, res) => {
    try {
      const { id, password } = req.body;

      const user = await this.authService.findById(id);
      // console.log(user, 456465);
      const passwordTest = await bcrypt.compare(password, user[0].password);
      // console.log(passwordTest, 78978978);
      if (user.length === 0 || !passwordTest) {
        return res
          .status(401)
          .json({ message: '사용자가 없거나 비밀번호가 틀렸습니다.' });
      }

      const accessToken = jwt.sign(
        {
          id: user[0].id,
          userNickname: user[0].nickname,
        },
        'my-secrect-key', //비밀키
        { expiresIn: '1d' }
      );

      // 쿠키에 토큰 담아서 보내기
      // res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
      res.cookie('accessToken', accessToken);

      return res.status(200).json({ message: '로그인 성공.' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: '로그인 실패.' });
    }
  };

  //로그아웃
  logout = async (req, res) => {
    res.clearCookie('accessToken');
    return res.json({ message: '로그아웃 성공.' });
  };
}

module.exports = AuthController;
