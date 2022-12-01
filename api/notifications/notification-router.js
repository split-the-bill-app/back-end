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
        notifications: notifications        
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

    let createdNotifications = [];
    let billForNotification = null;

    if (bill_id && email && Object.keys(req.body).length == 2 && Array.isArray(email) ){                     
      //find bill for the bill_id entered as part of req.body
      //notifications are sent for one bill at a time    
      await Bills.findById(bill_id)
      .then((billForNotificationFound) => {
        if(billForNotificationFound){
          billForNotification = {...billForNotificationFound};
        }
      })
      .catch( error => {
          console.log('billForNotificationFound error', error);
      })

      console.log('billForNotification', billForNotification);  

      //first we create and add the notifications to the database
      email.forEach(async email => {
        await Notification.add({ bill_id, email })        
        .then(id => {//returns an object with the id ---> { id: 9 } 
          if(id){
            Notification.findById(id.id)                
            .then(newNotification => {         
              if(newNotification && billForNotification){  
                console.log('if new notification and bill for notification', newNotification);              
                createdNotifications.push({
                  id: newNotification.id,
                  bill_id: newNotification.bill_id,
                  email: newNotification.email,
                  split_each_amount: billForNotification.split_each_amount,
                  description: billForNotification.description ? billForNotification.description : '',
                  created_at: billForNotification.created_at
                });   
              }            
            })
          }else{
            console.log('No id returned after adding a new notification.');
          }                     
        })
        .catch(error => {     
          res.status(500).json({
            error: 'An error occurred while sending the notification.',
          });
        });

      });//end forEach
      res.status(201).json({
        message: 'Notification(s) sent successfully.',
      });     

    } else {
      res.status(400).json({
        warning:
          'Not all information were provided to create a new notification.',
      });

    }//end else  
    
    //find bill for the bill_id entered as part of req.body
    //notifications are sent for one bill at a time
    //const billForNotification = await Bills.findById(bill_id);

    // Create twilio notification
    const activeUser = await Users.findById(billForNotification.user_id);

    console.log('created notifications 1', createdNotifications);

    //find notifications for the bill id
    //and send a twilio notification for each of them
    await Bills.findBillNotifications(bill_id) 
    .then(awaitbillNotifications => {
      if(activeUser){
        console.log('created notifications 2', createdNotifications);
        createdNotifications.forEach(notification => {          
          goSend.twilioNotification(
            notification.email,
            activeUser.firstname,
            activeUser.lastname,
            notification.split_each_amount,
            notification.description,
            notification.created_at
          );
        })
      }        
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
        ? res.status(200).json(successFlag)
        : res.status(500).json({
            error: `A server error occurred while updating the notification.`
          }          
        );         
    }catch (error) {
        res.status(500).json({
          error: `A server error occurred while updating the notification.`        
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

      //this returns the count or number of notifications deleted      
      const deletedNotificationCount = await Notification.remove(id);    

      res.status(200).json({
        message: `Notification ${id} was successfully deleted.`,
      });
    } catch (error) {
      console.log('deleted notification error--->', error);

      const {
        params: { id },
      } = req;

      res.status(500).json({
        message: `A server error prevented notification ${id} from being deleted.`,
      });
    }
  },
);

module.exports = router;
