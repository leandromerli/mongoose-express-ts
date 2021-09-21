import bcrypt from "bcryptjs";
import config from "config";
import  { Router, Response } from "express";
import { check, validationResult } from "express-validator/check";
import gravatar from "gravatar";
import HttpStatusCodes from "http-status-codes";
import jwt from "jsonwebtoken";
import Payload from "../../types/Payload";
import Request from "../../types/Request";
import UserModel, { IUser } from "../../models/UserModel";
import { UserController } from "../../controllers/userController";

//import { UserController } from "../../controllers/userController";

const router: Router = Router();

// @route   POST api/user
// @desc    Register user given their email and password, returns the token upon successful registration
// @access  Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
      check("firstName", "Please include First Name").not().isEmpty(),
      check("lastName", "Please include a Last Name").not().isEmpty()
      
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    try {
      const { email, password,firstName,lastName } =req.body
     let response=await UserController.createUser({ email, password,firstName,lastName });
     
      const payload: Payload = {
        userId: response.id
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: config.get("jwtExpiration") },
        (err, token) => {
          if (err) throw err;
          res.json({ token,payload });
        }
      );
    } catch (err) {
      console.error(err);
     // res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");

      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: err.message
          }
        ]
      });
    }
  }
);



router.get('/:id',async (req: Request, res: Response) => {
  try {
    let id=req.params.id;


    let user: IUser = await UserController.getUserByID(id);

    if (!user) {
      console.log('user not found',id)
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        errors: [
          {
            msg: "User don't exists"
          }
        ]
      });
    }else{
      res.json(user)
    }
  } catch (err) {
    console.error(err.message);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send("Server Error");
  }
});

router.put('/:id',
[ check("password","Please enter a password with 6 or more characters").isLength({ min: 6 }),
  check("firstName", "Please include First Name").not().isEmpty(),
  check("lastName", "Please include a Last Name").not().isEmpty()]
,async (req:Request,res:Response)=>{
  const { firstName,lastName, password } =req.body
  try{
    let responseUpdate=await UserController.updateById(req.params.id,{ firstName,lastName, password })
   console.log(responseUpdate)
    if(responseUpdate){
      res.json({status:"OK"})
    }else{
      res.json({status:"ERROR"})
    }
  }catch(e){
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  } 
})
router.delete('/:id',async (req:Request,res:Response)=>{
  const id=req.params.id
  try{
    let responseDelete=await UserController.deleteById(id)
    console.log(responseDelete);
    res.send({status:responseDelete&&responseDelete.id==id?"OK":"ERROR"})
  }catch(e){
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
  } 
  
})

export default router;
