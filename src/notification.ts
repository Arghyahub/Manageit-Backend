import User from "./db/User";
import { userType } from "./types";

let admin = require("firebase-admin");

let serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const testNotification = (token: string) => {
    // This registration token comes from the client FCM SDKs.
    const registrationToken = token;

    const message = {
        notification: {
            title: "Test Notification!",
            body: "This is how notification will look like in case of updates!"
        },
        webpush: {
            fcmOptions: {
                link: '/'
            }
        },
        token: registrationToken
    };

    // Send a test message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response: Response) => {
            console.log('Successfully sent message:', response);
        })
        .catch((error: Error) => {
            console.log('Error sending message:', error);
        });
}

// Notification in case of task is assigned
const taskNotification = async (users: userType[]) => {
    for (let user of users) {
        const userDetail = await User.findById(user?.userId);

        if (!userDetail) {
            continue;
        }

        // @ts-ignore
        const registrationToken = userDetail?.fcmToken;
        if (!registrationToken) {
            // If token is not available then go to next user!
            continue;
        }
        const message = {
            notification: {
                title: "New Task Assigned!",
                body: "A new task has just been assigned to you!"
            },
            webpush: {
                fcmOptions: {
                    link: '/'
                }
            },
            token: registrationToken
        };
        admin.messaging().send(message)
            .then((response: Response) => {
                console.log('Successfully sent message for task assigning:', response);
            })
            .catch((error: Error) => {
                console.log('Error sending message:', error);
            });
    }
}

export { testNotification, taskNotification };