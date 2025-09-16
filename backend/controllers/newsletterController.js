
import Subscriber from '../models/subscriberModel.js';
import { sendEmail, sendWelcomeEmail } from '../utils/email.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
    const { email } = req.body;

    console.log('Received email:', email);


    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            return res.status(400).json({ message: 'Email is already subscribed' });
        }

        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        // Send welcome email to the new subscriber
        try {
            await sendWelcomeEmail(email);
            console.log(`Welcome email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the subscription if email fails, but log the error
        }

        res.status(201).json({ message: 'Successfully subscribed! Check your email for a welcome message.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter
// @access  Private/Admin
const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
        res.status(200).json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send newsletter to all subscribers
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendNewsletterToSubscribers = async (req, res) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    try {
        const subscribers = await Subscriber.find({});
        if (subscribers.length === 0) {
            return res.status(404).json({ message: 'No subscribers found' });
        }

        const emailPromises = subscribers.map(subscriber =>
            sendEmail(subscriber.email, subject, message)
        );

        await Promise.all(emailPromises);

        res.status(200).json({ message: 'Newsletter sent to all subscribers' });
    } catch (error) {
        console.error('Error sending newsletter:', error);
        res.status(500).json({ message: 'Failed to send newsletter', error: error.message });
    }
};

export { subscribe, getAllSubscribers, sendNewsletterToSubscribers };
