const User = require('../model/user');
const {sendDiscountNotification} = require('../utils/mailer')
const PromoCode = require('../model/PromoCode');

exports.addPoint = async(req,res) => {
    try{
        const {id, totalPrice} = req.body;
        console.log(id, totalPrice);

        var points = 0;
        var level = "Bronze"

        if(totalPrice < 500000){
            return;
        }if(totalPrice >= 500000 ){
            points += 5;
        }if(totalPrice >= 1000000){
            points += 10;
        }if(totalPrice >= 150000){
            points += 10;
        }

        const user = await User.findOne({user_id:id,role:'customer'});
        if(!user) return res.status(404).json("User not found");

        const promo = await PromoCode.findOne({isActive:true});
        const code = promo.code;

        const oldPoints = user.points;
        const newPoints = oldPoints + points;

        if(newPoints > 500){
            level = "Platinum";
            sendDiscountNotification(user.firstName,user.lastName,user.email,level,15,code);
        }else if (newPoints > 250){
            level = "Gold";
            sendDiscountNotification(user.firstName,user.lastName,user.email,level,10,code);
        }else if(newPoints > 100){
            level = "Silver";
            sendDiscountNotification(user.firstName,user.lastName,user.email,level,5,code);
        }else{
            level = "Bronze";
        }

        const update = await User.findOneAndUpdate({user_id:id},{points: newPoints,user_level:level},{new:true});
        return res.status(200).json("Points added successfully");
    }catch(error){
        return res.status(500).json("Internal Error: ", error);
    }
}

exports.redeem = async(req,res) => {
    try{
        const {id, promoCode} = req.body;
        const code = await PromoCode.findOne({code:promoCode,isActive:true});
        
        if (!code) {
            return res.status(404).json("Promo code not found or inactive");
        }


        if(code){
            const user = await User.findOne({ user_id: id });

            if (!user) return res.status(404).json({ message: "User not found" });

            const userLevel = user.user_level;
            let discount = 0;

            if (userLevel === 'Silver') {
                discount = 5;
            } else if (userLevel === 'Gold') {
                discount = 10;
            } else if (userLevel === 'Platinum') {
                discount = 15;
            } else {
                return res.status(400).json({ message: 'You are not eligible to redeem points' });
            }
            return res.status(200).json({ discount });
        }
    }catch(error){
        res.status(500).json(error);
    }
}