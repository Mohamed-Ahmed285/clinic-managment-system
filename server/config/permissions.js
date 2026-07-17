const permissions = {
    admin: [
   "user:create",
    "user:update",
    "user:delete",

    "doctor:create",
    "doctor:update",
    "doctor:delete"
    ],

    doctor: [
    "medicalRecord:create"
    ],

    patient: [
    "favorite:create",
    "favorite:delete",
    "favorite:read"
    ]
};

module.exports = permissions;