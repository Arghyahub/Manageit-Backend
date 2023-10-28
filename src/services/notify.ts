
var FCM = require('fcm-node');
const serverKey = process.env.FCM_KEY ;
import User from "../db/User";

const sendPushNotification = async(userId:string, userName:string ,message:string) => {
    try {
        const fcm = new FCM(serverKey);

        const receiver = await User.findOne({ _id: userId });
        if (!receiver)
            throw new Error("User not found") ;
        
        const reg_ids = [receiver.fcmToken];

        const pushMessage = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            registration_ids:reg_ids,
            content_available: true,
            mutable_content: true,
            notification: {
                title: userName,
                body: message,
                icon : 'myicon',//Default Icon
                sound : 'mySound',//Default sound
                // badge: badgeCount
            },
            // data: {
            //   notification_type: 5,
            //   conversation_id:inputs.user_id,
            // }
        };
        
        fcm.send(pushMessage, function(err:string, response:string){
            if (err) {
                console.log("Something has gone wrong!",err);
            } else {
                console.log("Push notification sent.", response);
            }
        });

    } catch (err) {
        console.log("Error parsing JSON string:", err);
    }
}

export default sendPushNotification ;