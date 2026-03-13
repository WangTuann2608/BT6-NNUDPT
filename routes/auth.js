var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let roleModel = require('../schemas/roles')
let { RegisterValidator, handleResultValidator, changePasswordValidator } = require('../utils/validatorHandler')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')
let { privateKey } = require('../utils/keys/keys')
/* GET home page. */
router.post('/register', RegisterValidator, handleResultValidator, async function (req, res, next) {
    try {
        // Lấy role mặc định là "user"
        let defaultRole = await roleModel.findOne({ name: 'user', isDeleted: false });
        if (!defaultRole) {
            return res.status(400).send({ message: "Khong tim thay role mac dinh, vui long seed data truoc" });
        }
        let newUser = userController.CreateAnUser(
            req.body.username,
            req.body.password,
            req.body.email,
            req.body.fullName || "",
            req.body.avatarUrl || "",
            defaultRole._id
        );
        await newUser.save();
        res.send({ message: "dang ki thanh cong" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});
router.post('/login', async function (req, res, next) {
    let { username, password } = req.body;
    let getUser = await userController.FindByUsername(username);
    if (!getUser) {
        res.status(403).send("tai khoan khong ton tai")
    } else {
        if (getUser.lockTime && getUser.lockTime > Date.now()) {
            res.status(403).send("tai khoan dang bi ban");
            return;
        }
        if (bcrypt.compareSync(password, getUser.password)) {
            await userController.SuccessLogin(getUser);
            let token = jwt.sign({
                id: getUser._id
            }, privateKey, {
                algorithm: 'RS256',
                expiresIn: '30d'
            })
            res.send(token)
        } else {
            await userController.FailLogin(getUser);
            res.status(403).send("thong tin dang nhap khong dung")
        }
    }

});
router.get('/me', checkLogin, function (req, res, next) {
    res.send(req.user)
})

router.put('/change-password', checkLogin, changePasswordValidator, handleResultValidator,
    async function (req, res, next) {
        try {
            let { oldPassword, newPassword } = req.body;
            let user = req.user;

            // Kiểm tra mật khẩu cũ
            let isMatch = bcrypt.compareSync(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).send({ message: "Mat khau cu khong dung" });
            }

            // Cập nhật mật khẩu mới (pre-save hook sẽ tự hash)
            user.password = newPassword;
            await user.save();

            res.send({ message: "Doi mat khau thanh cong" });
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    }
)

module.exports = router;
