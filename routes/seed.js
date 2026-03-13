var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET /api/v1/seed
router.get('/', async function (req, res, next) {
    try {
        // Xoá dữ liệu cũ
        await roleModel.deleteMany({});
        await userModel.deleteMany({});

        // Tạo Roles
        const roles = await roleModel.insertMany([
            { name: 'admin', description: 'Quản trị viên hệ thống' },
            { name: 'moderator', description: 'Kiểm duyệt viên' },
            { name: 'user', description: 'Người dùng thông thường' }
        ]);

        const adminRole = roles.find(r => r.name === 'admin');
        const modRole   = roles.find(r => r.name === 'moderator');
        const userRole  = roles.find(r => r.name === 'user');

        // Tạo Users (password sẽ được hash tự động qua pre-save hook)
        const users = [
            {
                username: 'admin01',
                password: 'Admin@123',
                email: 'admin01@example.com',
                fullName: 'Nguyen Van Admin',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                status: true,
                role: adminRole._id,
                loginCount: 0
            },
            {
                username: 'mod01',
                password: 'Mod@1234',
                email: 'mod01@example.com',
                fullName: 'Tran Thi Moderator',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                status: true,
                role: modRole._id,
                loginCount: 0
            },
            {
                username: 'user01',
                password: 'User@123',
                email: 'user01@example.com',
                fullName: 'Le Van User',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                status: true,
                role: userRole._id,
                loginCount: 0
            },
            {
                username: 'user02',
                password: 'User@456',
                email: 'user02@example.com',
                fullName: 'Pham Thi Huong',
                avatarUrl: 'https://i.sstatic.net/l60Hf.png',
                status: false,
                role: userRole._id,
                loginCount: 0
            }
        ];

        // Lưu từng user để kích hoạt pre-save hook (hash password)
        const savedUsers = [];
        for (const u of users) {
            const doc = new userModel(u);
            await doc.save();
            savedUsers.push(doc);
        }

        res.send({
            message: 'Seed data thành công!',
            roles: roles,
            users: savedUsers.map(u => ({
                _id: u._id,
                username: u.username,
                email: u.email,
                fullName: u.fullName,
                status: u.status,
                role: u.role
            }))
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;
