let userModel = require('../schemas/users');

module.exports = {
    CreateAnUser: function (username, password, email, fullName, avatarUrl, role, status, loginCount) {
        return new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        })
    },
    UpdateUser: async function (id, data) {
        return await userModel.findByIdAndUpdate(id, data, { new: true })
    },
    DeleteUser: async function (id) {
        return await userModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
    },
    FindByUsername: async function (username) {
        return await userModel.findOne({
            username: username,
            isDeleted: false
        })
    },
    FailLogin: async function (user) {
        user.loginCount++;
        if (user.loginCount == 3) {
            user.loginCount = 0;
            user.lockTime = new Date(Date.now() + 60 * 60 * 1000)
        }
        await user.save()
    },
    SuccessLogin: async function (user) {
        user.loginCount = 0;
        await user.save()
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false }).populate({
                path: 'role',
                select: 'name'
            })
    },
    FindById: async function (id) {
        try {
            let getUser = await userModel
                .findOne({ isDeleted: false, _id: id }).populate({
                    path: 'role',
                    select: 'name'
                })
            return getUser;
        } catch (error) {
            return false
        }
    }
}