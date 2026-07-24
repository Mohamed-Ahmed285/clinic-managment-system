const permissions = {
    admin: [
    "user:create",
    "user:update",
    "user:delete",
    "user:get",
    "users:get",

    "doctor:create",
    "doctor:update",
    "doctor:delete",


    "search:doctors",
    "search:clinics",

    "get:appointments",
    "update:appointments",
    "cancel:appointment",

    
    "create:clinic",
    "update:clinic",
    "delete:clinic",
    
    "update:user",
    "delete:user",
    "add:patient",
    
    
    "create:speciality",
    "update:speciality",
    "delete:speciality",
    
    "medicalRecord:read",
    "medicalRecord:update",
    "medicalRecord:delete",
    "prescription:read",
    "prescription:update",
    "prescription:delete",

    
    "analytics:read"

    ],

    doctor: [
    "medicalRecord:create",
    "medicalRecord:read",
    "medicalRecord:update",
    "prescription:create",
    "prescription:read",
    "prescription:update",

    "update:appointments",
    "get:myappointments",
    "cancel:appointment",

    "get:doctorprofile",
    "update:doctorprofile",
    "update:clinicToDoctor",
    "delete:clinicFromDoctor",
    "add:clinicToDoctor",


    "search:doctors",
    "search:clinics",
    ],

    patient: [
        "profile:update",
        "favorite:create",
        "favorite:delete",
        "favorite:read",


        "create:appointment",
        "get:myappointments",
        "cancel:appointment",

        "medicalRecord:read",
        "prescription:read",

        "todo:read",
        "todo:update",
        "todo:delete",

        "review:create",
        "review:read",
        "review:update",
        "review:delete",
        "search:doctors",
        "search:clinics",
    ]
};

module.exports = permissions;