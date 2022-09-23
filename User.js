const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    userPwd:{
        type:String,
        required:true
    },
    userDetails:[Object]
},{versionKey:false});

module.exports = mongoose.model('User',userSchema);