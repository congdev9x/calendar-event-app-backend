import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';

export const eventRouter = Router();

eventRouter.use(authenticate); // ✅ Bắt buộc xác thực trước

eventRouter.get('/', getEvents);
eventRouter.post('/', createEvent);
eventRouter.put('/:id', updateEvent);
eventRouter.delete('/:id', deleteEvent);
