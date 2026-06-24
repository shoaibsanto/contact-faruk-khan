import { Router } from 'express'
import { sendContactEmail } from '../controller/mailController.js'
import { getEventTypes, getAvailableTimes, createCalcomBooking } from '../controller/bookingController.js'

const router=Router()

// Mail Routes

router.post('/sendContactEmail', sendContactEmail);

// Booking Routes

router.get('/getEventTypes', getEventTypes);
router.post('/getAvailableTimes', getAvailableTimes);
router.post('/createCalcomBooking', createCalcomBooking);


export default router;