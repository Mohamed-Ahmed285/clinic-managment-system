const express = require("express");
const router = express.Router();

const {
    getMyTodos,
    getTodoById,
    completeMedication,
    uncompleteMedication,
    deleteTodo
} = require("../controllers/todo");

const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.get("/",verifyToken,authorize("todo:read"),getMyTodos);

router.get("/:id",verifyToken,authorize("todo:read"),getTodoById);

router.patch("/:todoId/items/:itemId/schedule/:scheduleId",verifyToken,authorize("todo:update"),completeMedication);

router.patch("/:todoId/items/:itemId/schedule/:scheduleId/reset",verifyToken,authorize("todo:update"),uncompleteMedication,);

router.delete( "/:id",verifyToken,authorize("todo:delete"),deleteTodo);

module.exports = router;