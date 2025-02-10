const db_conn = require('../config/db');
const emailer = require('../middlewares/emailer');
const logger = require('../utils/logger');

const deleteAccount = async (req, res) => {
    try{
        const {email_id, user_id, reason} = req.body;

        // Validate the input
        if (!email_id || !user_id || !reason) {
            return res.status(401).json({ error: true, message: 'User ID, username, and reason are required'});
        }

        const db = await db_conn.connectToDatabase();
        const usersCollection = db.collection('users');

        // Check if the user exists
        const existingUser = await usersCollection.findOne({ user_id: user_id });
        if (!existingUser) {
            return res.status(404).json({ error: true, message: 'User not found' });
        }

        // Update user status
        const updateResult = await usersCollection.updateOne(
            { user_id: user_id },
            {
                $set: {
                    reason: reason,
                    status: false,
                    modified_by: email_id,
                    modified_date: new Date()
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            logger.info(`${email_id} - Failed to delete account, Please try again later !`);
            return res.status(401).json({ error: true, message: 'Failed to delete account, Please try again later !' });
        }

        const sendEmail = await emailer.EmailConfig(email_id, mailHead = 'deleteAccount');        

        if(sendEmail){
            logger.info(`${email_id} - Delete account mail sent.`);
        }

        logger.info(`${email_id} - Account deleted successfully !`);
        return res.status(200).json({ error: false ,message: `Account deleted successfully !` });
    }catch(error){
        logger.info(`deleteAccount - ${error.message}`);
        res.status(500).json({ error: true ,message: error.message });
    }
}

module.exports = { deleteAccount };