const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    userId:{
        type:String,        
    },
    notification:{
        type:String
    },
    senderId:{
        type:String
    },
    counter:{
        type:Number
    }
},{
    timestamps: true
})

const NotificationModel = mongoose.model("Notification",NotificationSchema)

module.exports = NotificationModel