const express = require('express');

const Notification = require('./notification-model.js');
const Users = require('../users/user-model.js');
const Bills = require('../bills/bill-model.js');

const goSend = require('../../utils/sendgrid.js');

const router = express.Router();

const AuthMiddleware = require('../middleware/auth-middleware.js');
const ValidateMiddleware = require('../middleware/validate-middleware.js');

//GET ALL NOTIFICATIONS
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
          'A server error occurred during notification(s) retrieval.',
      }),
    );
});

//ADD A NEW NOTIFICATION ARRAY OF EMAILS
router.post(
  '/', 
  AuthMiddleware.restricted,
  ValidateMiddleware.validateNotification,
  async (req, res) => {
  try {
    let { bill_id, email } = req.body;

    let createdNotification = [];

    if (
      bill_id &&
      email &&
      Object.keys(req.body).length == 2 &&
      Array.isArray(email)
      ){      

      //first we create and add the notifications to the database
      await email.forEach(email => {
        Notification.add({ bill_id, email })        
        .then(id => {
            Notification.findByEmail(email)
            .then(newNotification => {             
              createdNotification.push({
                id: newNotification.id,
                bill_id: newNotification.bill_id,
                email: newNotification.email,
              });    
            })        
        });

      });//end forEach
      res.status(201).json({
        message: 'The notification(s) have been successfully sent.',
      });     

    } else {
      res.status(400).json({
        warning:
          'Not all information were provided to create a new notification.',
      });

    }//end else  
    
    //find bill for the bill_id entered as part of req.body
    //notifications are sent for one bill at a time
    const billForNotification = await Bills.findById(bill_id);

    // Create twilio notification
    const activeUser = await Users.findById(billForNotification.user_id);

      //find notifications for the bill id
      //and send a twilio notification for each of them
      await Bills.findBillNotifications(bill_id)
      .then(billNotifications => {
         billNotifications.forEach(notification => {

           goSend.twilioNotification(
            notification.email,
            activeUser.firstname,
            activeUser.lastname,
            notification.split_each_amount,
            notification.description,
            notification.created_at
            );
        })
      })
      .catch(error => {       
        res.status(500).json({
          error:
            'An error occurred while sending twilio notifications 1!'
        })
      }) 

    }//end outer try
    catch(error){
      res.status(500).json({
        error:
          'An error occurred while sending twilio notifications 2!'
      })
    }   
    
  }//end endpoint
);//end router.post


//UPDATE A NOTIFICATION
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
          }          
        );

         
    } catch (error) {
      res.status(500).json({
        error: `An error occurred within the database and the notification could not be updated.`        
      });     
    }
  },
);

//DELETE A NOTIFICATION
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
