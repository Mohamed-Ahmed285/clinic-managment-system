const todoModel = require("../models/todo");

// Get all todos for the logged-in patient
const getMyTodos = async (req, res) => {
    try {
        const todos = await todoModel
            .find({ patientId: req.user.id })
            .populate("appointmentId", "_id")
            .populate("prescriptionId", "_id");

        return res.status(200).json(todos);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Get a specific todo
const getTodoById = async (req, res) => {
    try {
        const todo = await todoModel.findById(req.params.id).populate("appointmentId").populate("prescriptionId");

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found."
            });
        }

        // Patient can only access their own todos
        if (todo.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        return res.status(200).json(todo);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Mark a medication dose as completed
const completeMedication = async (req, res) => {
    try {

        const { todoId, itemIndex, scheduleIndex } = req.params;

        const todo = await todoModel.findById(todoId);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found."
            });
        }

        if (todo.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        const item = todo.items[itemIndex];

        if (!item) {
            return res.status(404).json({
                message: "Medication not found."
            });
        }

        const dose = item.schedule[scheduleIndex];

        if (!dose) {
            return res.status(404).json({
                message: "Scheduled dose not found."
            });
        }

        dose.completed = true;
        dose.completedAt = new Date();

        await todo.save();

        return res.status(200).json({
            message: "Medication marked as completed.",
            todo
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Mark a medication dose as not completed
const uncompleteMedication = async (req, res) => {
    try {

        const { todoId, itemIndex, scheduleIndex } = req.params;

        const todo = await todoModel.findById(todoId);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found."
            });
        }

        if (todo.patientId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied."
            });
        }

        const item = todo.items[itemIndex];

        if (!item) {
            return res.status(404).json({
                message: "Medication not found."
            });
        }

        const dose = item.schedule[scheduleIndex];

        if (!dose) {
            return res.status(404).json({
                message: "Scheduled dose not found."
            });
        }

        dose.completed = false;
        dose.completedAt = null;

        await todo.save();

        return res.status(200).json({
            message: "Medication marked as not completed.",
            todo
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Delete a todo
const deleteTodo = async (req, res) => {
    try {

        const todo = await todoModel.findByIdAndDelete(req.params.id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found."
            });
        }

        return res.status(200).json({
            message: "Todo deleted successfully."
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    getMyTodos,
    getTodoById,
    completeMedication,
    uncompleteMedication,
    deleteTodo
};