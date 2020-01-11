const express = require('express');

const Notification = require('./notification-model.js');
const Users = require('../users/user-model.js');
const Bills = require('../bills/bill-model.js');

const goSend = require('../../utils/sendgrid');

const router = express.Router();

const AuthMiddleware = require('../middleware/auth-middleware.js');
const ValidateMiddleware = require('../middleware/validate-middleware.js');

// GET ALL NOTIFICATIONS
router.get('/', AuthMiddleware.restricted, async (req, res) => {
  Notification.find()
    .then(notifications => {
      res.status(200).json({
        notifications: notifications,
        /* decodedToken: req.decodedToken, */
      });
    })
    .catch(error =>
      res.status(500).json({
        error:
          'An error occurred during fetching all notifications. That one is on us!',
      }),
    );
});

// ADD A NEW NOTIFICATION ARRAY OF EMAILS
router.post(
  '/',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateNotification,
   (req, res) => {
    let { bill_id, email } = req.body;

    let createdNotification = [];

    if (
      bill_id &&
      email &&
      Object.keys(req.body).length == 2 &&
      Array.isArray(email)
      ){
      

      email.forEach(email => {
         Notification.add({ bill_id, email })
          .then(newNotification => {
            createdNotification.push({
              id: newNotification.id,
              bill_id: newNotification.bill_id,
              email: newNotification.email,
            });
          })
          .catch(error => {
            res.status(500).json({
              error: 'An error occurred during creating a new notification.',
            });
            console.log("notification add error", error);
          });
      });
      /*res.status(201).json({
        message: 'The notification(s) have been successfully persisted.',
      });*/

      if(createdNotification){

        createdNotification.forEach(emailIn => {

          //find bill for the bill_id entered as part of req.body
          const [billForNotification] = Bills.findById(bill_id);

          // Create notification for invite
          const [activeUser] = Users.findById(billForNotification.user_id);

          /*try {        
              const twilioNotificationContent = {
                sendToEmail: email,
                activeUserId: activeUser.id,
                activeUserFirstName: activeUser.firstname,
                activeUserLastName: activeUser.lastname,
                split_each_amount: billForNotification.split_each_amount,
                description: billForNotification.description,
                created_at: billForNotification.created_at            
          }; */ 

          try {
        
            goSend.twilioNotification(
            emailIn,
            activeUser.firstName,
            activeUser.lastName,
            billForNotification.split_each_amount,
            billForNotification.description,
            billForNotification.created_at
            );

           }catch(error){
            console.log("twilio send notification error", error),

            res.status(500).json({
              error
            });
           }

        })//end forEach

      }//end if   
      else {
        res.status(404).json({
          message: `No created notifications were found for bill ${bill_id}.`
        });

      }//end else  
      
      res.status(201).json({
        message: 'The notification(s) have been successfully persisted.',
      });

    } else {
      res.status(400).json({
        warning:
          'Not all information were provided to create a new notification.',
      });
    }//end else
  }//end async
);//end router.post


// UPDATE A NOTIFICATION
router.put(
  '/:id',
  AuthMiddleware.restricted,  
  async (req, res) => {
    try {
      const {
        body: { paid },
        params: { id }
      } = req;

      const successFlag = await Notification.update(id, {        
        paid        
      });

      return successFlag 
        ? /*res.status(200).json({
            message: `The notification with the id ${id} has been successfully updated!`,
          })*/
          res.status(200).json(successFlag)
        : res.status(500).json({
            error: `An error occurred within the database and the notification could not be updated.`
          },
          console.log("update error 1", error)
          );

         
    } catch (error) {
      res.status(500).json({
        error: `An error occurred within the database and the notification could not be updated.`        
      });

      console.log("update error 2", error)
    }
  },
);

// DELETE A NOTIFICATION
router.delete(
  '/:id',
  AuthMiddleware.restricted,  
  async (req, res) => {
    try {
      const {
        params: { id },
      } = req;

      const deletedNotification = await Notification.remove(id);

      res.status(200).json({
        message: `The notification with id ${id} was successfully deleted.`,
      });
    } catch (error) {
      const {
        params: { id },
      } = req;

      res.status(500).json({
        message: `An error occurred during deletion of the notification with id ${id}.`,
      });
    }
  },
);

module.exports = router;
