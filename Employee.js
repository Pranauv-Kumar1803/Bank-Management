const mongoose = require('mongoose');
const schema = mongoose.Schema;

const employeeSchema = new schema({
    empId:{
        type:String,
        required:true
    },
    empPwd:{
        type:String,
        required:true
    },
    empName:{
        type:String,
        required:true
    },
},{versionKey:false});

module.exports = mongoose.model('Employee',employeeSchema);