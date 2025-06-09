import { HttpBadRequestError, HttpInternalServerError } from "../errors.mjs";
import { ObjectId } from "mongodb";

import {
  User,
  Session,
  Service,
  Medication,
} from "../models.mjs";

import UserDAO from "../../dao/userDAO.mjs";
import ServiceDAO from "../../dao/serviceDAO.mjs";
import MedicationDAO from "../../dao/medicationDAO.mjs";
import { AppointmentApi } from "../appointmentApp/controller.mjs";

// This class defines all APIs that are not directly called by User router.
// It is done to factor out shared code that can be called by multiple router APIs.
export class UserApi {
  static async deleteUser(username) {
    try {
      const appointmentResponse = await AppointmentApi.deleteAppointments({
        "patient.username": username,
      });


      const serviceResponse = await ServiceDAO.deleteServices({
        username: username,
      });
      if (!serviceResponse.success) {
        throw new HttpInternalServerError(serviceResponse.error);
      }

      const userResponse = await UserDAO.deleteUser(username);
      if (!userResponse.success) {
        throw new HttpInternalServerError(userResponse.error);
      }
    } catch (err) {
      throw err;
    }
  }
}

// This class defines all middleware APIs that are directly called by User router.
export default class UserController {
  static async getUsers(req, res, next) {
    try {
      // console.log("Query", req.query);

      const view = req.query.view ? req.query.view : "";
      const search = req.query.search !== undefined ? req.query.search : null;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      let filter;
      if (view === "patient") {
        filter = { isPhysician: false };
      } else {
        filter = { isPhysician: true };
      }

      let result;
      if (search !== null) {
        if (search === "") {
          result = [];
        } else {
          const queryRegex = new RegExp(search, "i");
          const searchQuery = {
            $or: [
              { username: queryRegex },
              { fullName: queryRegex },
              { specialization: queryRegex },
            ],
          };

          result = await UserDAO.searchUsers({
            filter,
            searchQuery,
            page,
            limit,
          });
        }
      } else {
        result = await UserDAO.getUsers({ filter, page, limit });
      }

      res.json(
        result.map((item) => {
          const user = new User(item);
          return user.toShortJson();
        })
      );
    } catch (err) {
      console.error(`Failed to get users. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async getUser(req, res, next) {
    try {
      const username = req.params.username;
      const result = await UserDAO.getUser(username);
      // const user = new User(result)
      // console.log(result);
      res.json(result);
    } catch (err) {
      console.error(`Failed to get user: ${err}`);
      res.status(500).json({ message: err.message });
    }
  }

  static async updateUser(req, res, next) {
    try {
      const username = req.params.username;
      const updateInfo = req.body;
      if (!updateInfo || (updateInfo && !Object.keys(updateInfo).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const notUpdatableFields = [
        "_id",
        "id",
        "username",
        "password",
        "isPhysician",
      ];

      for (const field of notUpdatableFields) {
        if (updateInfo.hasOwnProperty(field)) {
          throw new HttpBadRequestError(
            `Invalid request. Cannot update field: '${field}'.`
          );
        }
      }

      if (updateInfo.dob) {
        updateInfo.dob = new Date(updateInfo.dob);
      }

      const updateResponse = await UserDAO.updateUser(username, updateInfo);
      if (!updateResponse.success) {
        throw new HttpInternalServerError(updateResponse.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to update user. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const username = req.params.username;
      const session = req.session;

      if (session.username !== username) {
        // throw new HttpUnauthorizedError("Invalid request. Cannot delete another user account.")
      }

      const user = await UserDAO.getUser(username);
      if (!user || (user && !Object.keys(user).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      await UserApi.deleteUser(user.username);

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete user. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async getServices(req, res, next) {
    try {
      const username = req.params.username;
      // console.log(username)

      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      const user = await UserDAO.getUser(username);
      if (!user || (user && !Object.keys(user).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const filter = {
        username: username,
      };

      const services = await ServiceDAO.getServices({
        filter: filter,
        page: page,
        limit: limit,
        reverse: true,
      });
      // console.log("All items", services);
      res.json(services);
    } catch (err) {
      console.error(`Failed to get user services. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async addService(req, res, next) {
    try {
      const serviceInfo = req.body;
      if (!serviceInfo || (serviceInfo && !Object.keys(serviceInfo).length)) {
        throw new Error("Invalid request. Bad input parameters.");
      }

      const username = req.params.username;
      const user = await UserDAO.getUser(username);
      if (!user || (user && !Object.keys(user).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const rateAsNumber = Number(serviceInfo.rate);
      if (rateAsNumber === isNaN || rateAsNumber < 0) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const response = await ServiceDAO.addService({
        username: username,
        name: serviceInfo.name,
        rate: rateAsNumber,
      });
      if (!response.success) {
        throw new HttpInternalServerError(response.error);
      }

      res.status(200).json({ success: true, id: response.id });
    } catch (err) {
      console.error(`Failed to add user service. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }

  static async deleteService(req, res, next) {
    try {
      const username = req.params.username;
      const serviceId = req.params.id;

      const response = await ServiceDAO.deleteService(serviceId);
      if (!response.success) {
        throw new HttpInternalServerError(response.error);
      }

      res.json({ success: true });
    } catch (err) {
      console.error(`Failed to delete user service. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }


  static async getMedications(req, res, next) {
    try {
      const username = req.params.username;
      const page = req.query.page ? parseInt(req.query.page, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

      const user = await UserDAO.getUser(username);
      if (!user || (user && !Object.keys(user).length)) {
        throw new HttpBadRequestError("Invalid request. Bad input parameters.");
      }

      const filter = {
        toUsername: username,
      };

      const medications = await MedicationDAO.getMedications({
        filter: filter,
        page: page,
        limit: limit,
        reverse: true,
      });

      res.json(medications);
    } catch (err) {
      console.error(`Failed to get user medications. ${err}`);
      res.status(err.statusCode).json({ message: err.message });
    }
  }
}
