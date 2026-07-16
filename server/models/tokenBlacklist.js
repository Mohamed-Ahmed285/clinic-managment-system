const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema(
{
    token: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    }
});

// حذف التوكن تلقائيًا بعد انتهاء صلاحيته
tokenBlacklistSchema.index(
    { expireAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);