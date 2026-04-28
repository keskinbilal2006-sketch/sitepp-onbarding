import { attachmentsRouter } from './attachments/attachments.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { categoriesRouter } from './categories/categories.routes.js';
import { commentsRouter } from './comments/comments.routes.js';
import { reportsRouter } from './reports/reports.routes.js';
import { tasksRouter } from './tasks/tasks.routes.js';
import { usersRouter } from './users/users.routes.js';

// app.ts bu obje uzerinden modulleri ana API altina baglar.
export const moduleRouters = {
  auth: authRouter,
  users: usersRouter,
  categories: categoriesRouter,
  tasks: tasksRouter,
  comments: commentsRouter,
  attachments: attachmentsRouter,
  reports: reportsRouter,
};
