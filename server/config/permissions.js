const permissions = {
    admin: [
    "user:create",
    "user:update",
    "user:delete",

    "doctor:create",
    "doctor:update",
    "doctor:delete",

    "get:appointments",
    "update:appointments",

    "create:clinic",
    "update:clinic",
    "delete:clinic",

    "update:user",
    "delete:user",
    "add:patient",


    "create:speciality",
    "update:speciality",
    "delete:speciality",

     "analytics:read"
    ],

    doctor: [
    "medicalRecord:create",

    "update:appointments",

    "get:doctorprofile",
    "update:doctorprofile",
    "update:clinicToDoctor",
    "delete:clinicFromDoctor"
    ],

    patient: [
        "profile:update",
        "favorite:create",
        "favorite:delete",
        "favorite:read",


        "create:appointment",


        "todo:read",
        "todo:update",
        "todo:delete"
    ]
};

module.exports = permissions;