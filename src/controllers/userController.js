const User   = require('../models/userModel');
const ApiErr = require('../utils/apiError');

/* احصل على ملفي الشخصي */
exports.getMe = (req, res) => {
  res.json(req.user);                   // لأن auth أرفق user على req
};

/* حدّث بياناتي (الاسم أو الإيميل فقط) */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name)  updates.name  = name;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (err) { next(err); }
};

/* احذف حسابي */
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(204).end();
  } catch (err) { next(err); }
};

/* ========== صلاحيات Admin ========== */

/* جميع المستخدمين */
exports.getAll = async (_req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) { next(err); }
};

/* مستخدم واحد */
exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiErr(404, 'User not found'));
    res.json(user);
  } catch (err) { next(err); }
};

/* حذف بواسطة الإدمن */
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};
