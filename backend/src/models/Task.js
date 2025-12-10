import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    timeStart: {
      type: String,
      trim: true,
    },
    timeEnd: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },
    referenceLinks: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: [true, 'Task date is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Method to transform task object (format id, date)
taskSchema.methods.toJSON = function () {
  const taskObject = this.toObject();
  taskObject.id = taskObject._id.toString();
  delete taskObject._id;
  delete taskObject.__v;
  
  // Format date to YYYY-MM-DD
  if (taskObject.date) {
    taskObject.date = taskObject.date.toISOString().split('T')[0];
  }
  
  // Format timestamps
  if (taskObject.createdAt) {
    taskObject.createdAt = taskObject.createdAt.toISOString();
  }
  if (taskObject.updatedAt) {
    taskObject.updatedAt = taskObject.updatedAt.toISOString();
  }
  
  return taskObject;
};

const Task = mongoose.model('Task', taskSchema);

export default Task;

