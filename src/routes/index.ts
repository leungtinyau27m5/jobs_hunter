import { Router } from "express";
import v1 from "./v1";

const router = Router()

/**
 * @apiDefine InvalidValue
 * @apiError (422) {Object[]} errors  <code>errors: [{ field: message }]</code>
 */

/**
 * @apiDefine UnkonwnError
 * @apiError (500) {Object} error <code>Error</code> Object
 */

/**
 * @apiDefine UserAuthObject
 * @apiSuccess (200) {Object} user
 * @apiSuccess (200) {Number} User.id user unique id
 * @apiSuccess (200) {String} User.username user nickname
 * @apiSuccess (200) {String} User.email user unique email
 */

/**
 * @apiDefine UnAuthorized
 * @apiError (401) {Object[]} errors <code>[{ auth: message }]</code> or <code>[{ user: message }]</code>
 */


router.use('/v1', v1)

export default router