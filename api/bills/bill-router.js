const express = require('express');
const moment = require('moment');

const Bills = require('./bill-model.js');
const Notification = require('../notifications/notification-model.js');

const router = express.Router();

const AuthMiddleware = require('../middleware/auth-middleware.js');
const ValidateMiddleware = require('../middleware/validate-middleware.js');

//GET ALL BILLS
router.get('/', AuthMiddleware.restricted, async (req, res) => {
  Bills.find()
    .then(bills => {
      res.status(200).json({
        bills: bills,
        /* decodedToken: req.decodedToken, */
      });
    })
    .catch(error =>
      res.status(500).json({
        error:
          'An error occurred during fetching all bills. That one is on us!',
      }),
    );
});

//GET A BILL BY ID
router.get(
  '/:id',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBillId,
  async (req, res) => {
    try {
      const {
        bill: { id },
      } = req;

      const bill = await Bills.findById(id);

      res.status(200).json(bill);
    } catch (error) {
      const {
        bill: { id },
      } = req;

      res.status(500).json({
        error: `An error occurred during fetching a bill with the id ${id}.`,
      });
    }
  },
);

//ADD A NEW BILL
router.post(
  '/',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBill,
  (req, res) => {
    let { split_sum, split_people_count, split_each_amount, notes, description, user_id } = req.body;

    if (split_sum && split_people_count && split_each_amount && user_id) {
      Bills.add({
        split_sum,
        split_people_count,
        split_each_amount,
        notes,
        description,
        user_id,
        created_at: moment().format('MM-DD-YY'),
      })
        .then(newBill => {
          res.status(201).json({
            id: newBill.id,
            user_id: newBill.user_id,
            split_sum: newBill.split_sum,
            split_people_count: newBill.split_people_count,
            split_each_amount: newBill.split_each_amount,
            notes: newBill.notes,
            description: newBill.description,
            created_at: newBill.created_at,
          });
        })
        .catch(error => {         
          res.status(500).json({
            error: 'An error occurred during adding a new bill.',
          });
        });
    } else {
      res.status(400).json({
        warning: 'Not all information were provided to create a new bill.',
      });
    }
  },
);

//DELETE A BILL
router.delete(
  '/:id',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBillId,
  async (req, res) => {
    try {
      const {
        bill: { id },
      } = req;

      //this returns the count or number of bills deleted
      const deletedBillCount = await Bills.remove(id);      

      res.status(200).json({
        message: `Bill ${id} was successfully deleted.`,
      });
    } catch (error) {

      const {
        bill: { id },
      } = req;

      res.status(500).json({
        message: `An error occurred while deleting bill ${id}.`,
      });
    }
  },
);

//UPDATE A BILL
router.put(
  '/:id',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBill,
  ValidateMiddleware.validateBillId,
  async (req, res) => {
    try {
      const {
        body: { user_id, split_sum, split_people_count, split_each_amount, notes, description, paid },
        bill: { id },
      } = req;

      const successFlag = await Bills.update(id, {
        user_id,
        split_sum,
        split_people_count,
        split_each_amount,
        paid,
        notes,
        description
      });

      return successFlag > 0
        ? res.status(200).json({
            message: `The bill with the id ${id} has been successfully updated!`,
          })
        : res.status(500).json({
            error: `An error occurred within the database thus the bill with the id ${id} could not be updated.`,
          });
    } catch (error) {
      res.status(500).json({
        error: `An error occurred during updating the bill with the id ${id}.`,
      });
    }
  },
);

//GET ALL NOTIFICATIONS BY A BILL ID
router.get(
  '/:id/notifications',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBillId,
  async (req, res) => {
    const {
      bill: { id },
    } = req;

    try {
      const userBills = await Bills.findBillNotifications(id);
      if (userBills && userBills.length) {
        res.status(200).json(userBills);
      } else {
        res.status(404).json({
          info: `No bills available for the user with the id ${id}.`,
        });
      }
    } catch (error) {
      const {
        bill: { id },
      } = req;

      res.status(500).json({
        error: `An error occurred during retrieving the bills for the user with the id ${id}.`,
      });
    }
  },
);

//GET ALL NOTIFICATIONS THAT WAS SENT TO AN EMAIL/BILLS THE EMAIL OWNER OWES(YOU OWE YOUR FRIENDS)
router.get(
  '/notifications/:email',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateEmail,
  async (req, res) => {
    const {
      params: { email },
    } = req;

    try {
      const userNotifications = await Bills.findUserBillNotifications(email);

      if (userNotifications && userNotifications.length) {
        res.status(200).json(userNotifications);
      } else {
        res.status(404).json({
          info: `No notifications were found for ${email}.`,
        });
      }
    } catch (error) {
      const {
        params: { email },
      } = req;

      res.status(500).json({
        error: `A server error occurred while retrieving the notifications for ${email}.`,
      });
    }
  },
);

//GET ALL BILLS/NOTIFICATIONS THAT ARE OWED TO A USER/BILLS OWED TO THE LOGGED IN USER(YOUR FRIENDS OWE YOU)
router.get(
  '/notifications/owed/:id',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateUserId,
  async (req, res) => {
    const {
      params: { id },
    } = req;   

    try {
      const userNotifications = await Bills.findUserOwedBills(id);      

      if (userNotifications && userNotifications.length) {
        res.status(200).json(userNotifications);
      } else {       
        res.status(404).json({
          info: `No bills owed to user ${id} was found.`,
        });
      }
    } catch (error) {
      const {
        params: { id },
      } = req;     

      res.status(500).json({
        error: `A server error occurred while retrieving bills owed to ${id}.`,
      });
    }
  },
);

//GET ALL PAID BILLS/NOTIFICATIONS FOR THE LOGGED IN USER (your friends paid what they owe you)
router.get(
  '/notifications/paid/:id',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateUserId,
  async (req, res) => {
    const {
      params: { id },
    } = req;

    try {
      const paidBills = await Bills.findAllPaidBills(id);     

      if (paidBills && paidBills.length) {
        res.status(200).json(paidBills);
      } else {
        res.status(404).json({
          info: `No paid bills owed to user ${id} was found.`,
        });
      }
    } catch (error) {
      const {
        params: { id },
      } = req;      

      res.status(500).json({
        error: `A server error occurred while retrieving paid bills owed to ${id}.`,
      });
    }
  },
);

//DELETE ALL NOTIFICATIONS BY BILL ID
router.delete(
  '/:id/notifications',
  AuthMiddleware.restricted,
  ValidateMiddleware.validateBillId,
  async (req, res) => {
    try {
      const {
        bill: { id },
      } = req;

      const billNotifications = await Bills.findBillNotifications(id);

      if (billNotifications && billNotifications.length) {
        billNotifications.forEach(notification => {
          Notification.remove(notification.id)
            .then(newNotification =>
              console.log(
                'notification successfully deleted: ' + newNotification,
              ),
            )
            .catch(error => {
              res
                .status(500)
                .json(
                  'An error occurred while deleting notifications for the bill.',
                );
            });
        });
        res.status(200).json({
          message: `The notification(s) for bill ${id} were successfully deleted.`,
        });
      } else {
        res.status(404).json({
          info: `Bill no. ${id} does not contain any notifications.`,
        });
      }
    } catch (error) {
      const {
        bill: { id },
      } = req;      
      res.status(500).json({
        message: `An error occurred while deleting notifications for bill ${id}.`,
      });
    }
  },
);

module.exports = router;
