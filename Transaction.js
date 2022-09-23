const mongoose = require('mongoose');
const schema = mongoose.Schema;

const transacSchema = new schema({
    userId:{
        type:String,
        required:true
    },
    transacType:String,
    date:Date,
    transacDetails:[Object]
},{versionKey:false});

module.exports = mongoose.model('Transaction',transacSchema);