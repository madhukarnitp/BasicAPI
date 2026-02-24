const express=require('express');
const app=express();
const studentRoutes = require('./routes/students.routes');
const connectDB = require('./config/students.database');
const { MulterError } = require('multer');
const cors = require('cors');
const path = require('path');
const auth = require('./middleware/auth');
const userRoutes = require('./routes/users.routes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const twilio = require('twilio')

connectDB();

const limiter = rateLimit({
    windowMs: 1000*60,
    max: 100,
    message: 'Too many request from this IP, please try again later.'
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.use(cors({
        origgin: [
            "http://localhost:3000",
            "basic-api-delta.vercel.app"
        ]
}));
//app.use(helmet());  //mostly used in ONLINE live server as can create testing problem.

app.get('/api/health',(req,res)=> res.json({HealthStatus: 'Ok', message: 'Server is Up and Running on PORT NO: 3000'}));

app.get('/',(req,res)=> res.render('index'));
app.get('/login',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/new',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'new.html')));

app.use(limiter);
app.use('/api/users', userRoutes);

app.use(auth);
app.use('/api/students', studentRoutes);

app.use((error, req,res,next)=>{
    if(error instanceof MulterError){
        return res.status(400).send(`Image Error: ${error.message} : ${error.code}`);
    }else if(error){
        return res.status(500).send(`Something Went Wrong: ${error.message}`);
    }
})

export default app;
//app.listen(PORT, ()=>{
//    console.log(`Server is Up and runnig at Port: ${PORT} `);
//})
