
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import UserModel, { IUser } from "../models/UserModel";

export class UserController{

    static async getUserByID(id:string){
        let user=await UserModel.findById(id)
                        .select("-password"); 
        return user;
    }
   
    static async createUser(params:any){
       
        try {
        let user: IUser = await UserModel.findOne({ email:params.email });

        if (user) {
            console.log("user exists!",params.email)
            throw new Error("user_exists");
        }
        const options: gravatar.Options = {
            s: "200",
            r: "pg",
            d: "mm"
        };

        const avatar = gravatar.url(params.email, options); 
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(params.password, salt);

        // Build user object based on IUser
        const userFields = {
            email:params.email,
            password: hashed,
            avatar,
            firstName:params.firstName,
            lastName:params.lastName
        };

        user = new UserModel(userFields);

        console.log("creating user ",params.email)

        return await user.save();
 
        }catch(e){
            console.error(e);
            if(e.message=="user_exists"){
                throw new Error("User exists")
            }else
                throw new Error("Error on user creation")
        }
    }
    static async updateById(id:string,updateUser:any){

        const userFields = {
            firstName:updateUser.firstName,
            lastName:updateUser.lastName
        };

        return await UserModel.findByIdAndUpdate(id,updateUser)
     }
    static async deleteById(id:string){
       return await UserModel.findByIdAndDelete(id)
    }
}