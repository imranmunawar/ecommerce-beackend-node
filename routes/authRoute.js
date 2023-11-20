const express = require('express');
const {createUser, loginUser, getListUsers, getUser, deleteUser, updateUser, blockUser, unBlockUser} = require("../controller/userController");
const {authMiddleware, isAdmin} = require("../middleweares/authMiddleware");
const router = express.Router();

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/list', getListUsers);
router.get('/:id',authMiddleware, isAdmin, getUser);
router.delete('/:id', deleteUser);
router.put('/edit', authMiddleware, updateUser);
router.put('/blocked/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblocked/:id', authMiddleware, isAdmin, unBlockUser);

module.exports = router;