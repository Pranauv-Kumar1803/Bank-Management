const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');
const Transaction = require('./Transaction');
const Employee = require('./Employee');
const ejs = require('ejs');


// middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.set('view engine', 'ejs');


// routes
app.get('/', (req, res) => {
    res.render('index');
})

app.get('/signup', (req, res) => {
    res.render('signup');
})

app.get('/emplogin',(req,res)=>{
    res.render('emplogin');
})

app.get('/auth', async (req, res) => {
    if (req.cookies.auth) res.send(req.cookies.auth);
    else res.send('undefined');
})

emp={};
app.get('/api/employee',(req,res)=>{
    res.render('employee',{employee:emp});
})

app.post('/api/employee',async(req,res)=>{
    const e = await Employee.findOne({empId:req.body.id}).exec();
    console.log(e);
    emp=e;
    if(e.empPwd==req.body.pwd)
    {
        res.cookie('auth', `${e._id}`, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.render('employee',{employee:e});
    }
    else
    {
        res.render('404_2');
    }
})

app.get('/api/emp/list',async(req,res)=>{
    if(req.cookies.auth)
    {
        const d = await User.find().exec();
        res.render('list',{views:d});
    }
    else
    {
        res.render('404_2');
    }
})

app.get('/emp/search',(req,res)=>{
    if(req.cookies.auth)
        res.render('search_list');
    else
        res.render('404_2');
})

app.post('/api/emp/search',async(req,res)=>{
    const id = req.body.id;
    let arr=[];
    const d = await User.findById(id).exec();
    if(d)
    {
        arr.push(d);
        res.render('list',{views:arr});
    }
    else res.render('404_2');
})

app.get('/api/emp/logout',(req,res)=>{
    res.clearCookie('auth', { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/');
    emp={};
})

let cus = {};

app.post('/api/user', async (req, res) => {
    if (req.body.name) {
        const name = req.body.name;
        const email = req.body.email;
        const age = req.body.age;
        const address = req.body.address;
        const phone = req.body.phone;
        const pwd = req.body.pwd;
        const cpwd = req.body.cpwd;
        if (pwd === cpwd) {
            const obj = {
                name: name,
                email: email,
                age: age,
                address: address,
                phone: phone,
                balance: 1000
            }
            const d = new User({
                userPwd: pwd,
                userDetails: obj
            })
            d.save((err) => {
                if (!err) {
                    res.cookie('auth', `${d._id}`, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                    cus = {
                        name: d.userDetails[0].name,
                        id: d._id,
                        email: d.userDetails[0].email,
                        address: d.userDetails[0].address,
                        phone: d.userDetails[0].phone,
                        pwd: cpwd,
                        balance: d.userDetails[0].balance,
                        age: d.userDetails[0].age
                    }
                    res.render('user', { customer: cus });
                }
                else
                    res.send('Error during record insertion : ' + err);
            });
        }
    }
    else {
        const id = req.body.id;
        const pwd = req.body.pwd;
        console.log(id, pwd);
        const d = await User.findOne({ _id: id }).exec();
        console.log(d);
        console.log(pwd == d.userPwd);
        if (d) {
            if (d.userPwd == pwd) {
                res.cookie('auth', `${d._id}`, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                console.log('success');
                cus = {
                    name: d.userDetails[0].name,
                    id: d._id,
                    email: d.userDetails[0].email,
                    address: d.userDetails[0].address,
                    phone: d.userDetails[0].phone,
                    pwd: pwd,
                    balance: d.userDetails[0].balance,
                    age: d.userDetails[0].age
                }
                res.render('user', { customer: cus });
            }
            else {
                console.log('wrong password');
                res.send('wrong password');
            }
        }
    }
})

app.get('/userControl.js', (req, res) => {
    res.sendFile(__dirname + '/userControl.js');
})

app.get('/api/transaction', (req, res) => {
    if (req.cookies.auth)
        res.render('transaction');
    else
        res.redirect('/');
})

app.post('/api/user/transaction', async (req, res) => {
    const cookies = req.cookies;
    if (cookies.auth) {
        console.log(cookies)
        console.log('transactions page');
        const id = req.body.id;
        const amount = req.body.amount - '0';
        if (id !== cookies.auth) {
            const d = await User.findOne({ _id: id }).exec();
            const d1 = await User.findOne({ _id: cookies.auth }).exec();
            console.log(d1);
            if ((d.userDetails[0].balance - 100) >= amount) {
                const obj = {
                    date: new Date(),
                    to: id,
                    amt: amount
                };
                const result = new Transaction({
                    userId: cookies.auth,
                    transacType: "credit",
                    date: new Date(),
                    transacDetails: {
                        to: id,
                        from: req.cookies.auth,
                        amt: amount
                    }
                })
                const result1 = new Transaction({
                    userId: id,
                    transacType: "debit",
                    date: new Date(),
                    transacDetails: {
                        to: id,
                        from: req.cookies.auth,
                        amt: amount
                    }
                })
                result.save((err) => {
                    if (!err) console.log('transaction done');
                })
                result1.save((err) => {
                    if (!err) console.log('transaction done');
                })

                d.userDetails[0].balance = d.userDetails[0].balance + amount;
                d1.userDetails[0].balance = d1.userDetails[0].balance - amount;
                cus.balance = cus.balance - amount;

                await User.findOneAndUpdate({ _id: id }, { $set: d }, { upsert: true });
                await User.findOneAndUpdate({ _id: cookies.auth }, { $set: d1 }, { upsert: true });

                res.render('success');
            }
            else {
                console.log('not enough balance');
                res.json({ error: 'not enough balance' });
            }
        }
        else {
            res.render('404');
        }
    }
    else {
        res.redirect('/');
    }
})

app.get('/api/user', async (req, res) => {
    console.log('requested for api/user')
    console.log(req.cookies.auth);
    if (req.cookies.auth) {
        res.render('user', { customer: cus });
    }
    else {
        res.redirect('/');
    }
})

app.get('/api/view', (req, res) => {
    res.render('view');
})

app.get('/api/user/view/:days', async (req, res) => {
    if (req.cookies.auth) {
        const days = parseInt( req.params.days);
        console.log(days,typeof days);
        const d1 = new Date();
        const d = new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)));
        const da = await Transaction.find({ $and: [{ userId: req.cookies.auth }, { date: { $gte: d, $lte: d1 } }] }).exec();
        console.log(da);
        return res.render('viewer', { views: da });
    }
    else {
        res.redirect('/');
    }
})

app.get('/api/download', (req, res) => {
    res.render('download');
})

app.get('/api/user/download/:days', async (req, res) => {
    if (!req.cookies.auth) return res.redirect('/');

    const days = parseInt( req.params.days);
    console.log(days,typeof days);
    const d1 = new Date();
    const d = new Date((new Date().getTime() - (days * 24 * 60 * 60 * 1000)));
    const ObjectsToCsv = require('objects-to-csv');
    
    const da = await Transaction.find({ $and: [{ userId: req.cookies.auth }, { date: { $gte: d, $lte: d1 } }] }).exec();
    // console.log(data);
    const csv = new ObjectsToCsv(da);

    await csv.toDisk('./test.csv');

    res.sendFile(__dirname + '/test.csv');
})

app.get('/api/update', (req, res) => {
    if (!req.cookies.auth) return res.redirect('/');
    res.render('update');
})

app.post('/api/user/change', async (req, res) => {
    if (req.cookies.auth) {
        console.log(req.body.option);
        console.log(req.body.data);
        const p = req.body.option;
        if (p) {
            console.log(p);
            const d1 = await User.findOne({ _id: req.cookies.auth }).exec();
            if (d1) {
                d1.userDetails[0][`${p}`] = req.body.data;
                const result = await d1.save();
                await User.findOneAndUpdate({ _id: req.cookies.auth }, { $set: d1 }, { upsert: true });
                cus[`${p}`] = req.body.data;
                res.redirect('/api/user');
            }
        }
    }
    else {
        res.redirect('/');
    }
})

app.get('/api/close', async (req, res) => {
    if (!req.cookies.auth) return res.render('/');
    res.render('continue');
})

app.post('/api/user/close', async (req, res) => {
    const pwd = req.body.password;
    // const d = await User.findOne({_id:req.cookies.auth});
    const res1 = await User.findByIdAndDelete(req.cookies.auth).exec();
    if (res1.userPwd == pwd) {
        const res2 = await Transaction.findByIdAndDelete(req.cookies.auth).exec();
        res.clearCookie('auth', { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/');
    }
    else {
        res.render('404');
    }
})

app.get('/api/user/logout', (req, res) => {
    res.clearCookie('auth', { httpOnly: true, sameSite: 'none', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/');
    cus = {};
})


mongoose.connect('mongodb://localhost:27017/banking-project', {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    app.listen(3000, () => {
        console.log('server started at port 3000');
    })
})
