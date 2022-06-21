//Создаем сервер
let express =require('express')
let app=express()
app.listen(3000,()=>console.log('Server is online'))

//Другое
app.use(express.urlencoded({extended:false}))
let User=require('./models/userModel')
let bcrypt=require('bcrypt')
let saltRaounds=10
let {check,validationResult}=require('express-validator')
let jwt=require('jsonwebtoken')
let privKey='000000'
let cookieParser=require('cookie-parser')
app.use(cookieParser())

//БД
let mongoose =require('mongoose')
const req = require('express/lib/request')
const res = require('express/lib/response')
let db='mongodb+srv://user:1111@cluster0.lay9cse.mongodb.net/?retryWrites=true&w=majority'
mongoose
.connect(db)
.then(()=>console.log('Connected to DB'))

/**
 * !Регистрация пользователя
 */
app.post('/api/signup',

//Валидация
check('login').notEmpty().withMessage('Поле логина не должно быть пустым'),
check('password').notEmpty().withMessage('Поле пароля не должно быть пустым'),
check('repeatPass').notEmpty().withMessage('Поле повторения пароля не должно быть пустым'),


(req,res)=>{


if(!validationResult(req).isEmpty()){res.send(validationResult(req))}

else {

    //Проверим нет ли в базе этого логина

User.find({login:req.body.login})
.then(r=>{
    //Если такой логин уже есть, пишем ошибку
    if(r[0]){res.send('Такой логин уже существует')}
    else{ //Если нет,проверяем совпадают ли пароли
        if (req.body.password != req.body.repeatPass){res.send('Пароли не совпадают')}
        //Если совпадают, хешируем пароль и записываем в БД
        else {


                //Создаем хеш      
                bcrypt.hash(req.body.password,saltRaounds,(err,hash)=>{

                req.body.password=hash
                let user = new User(req.body)
                user.save()
                .then(r=>{res.send('Пользователь успешно зарегестрирован');
                })
    
                })

        }


    }


})

}



})



/**
 * !Авторизация пользователя
 */


app.post("/api/login", (req, res) => {
  //Есть ли такой пользователь в системе
  User.find({ login: req.body.login }).then((r) => {
    if (!r[0]) {
      res.send("Такого пользователя не существует");
    } else {
      //Совпадают ли пароли
      bcrypt.compare(req.body.password, r[0].password, (err, result) => {
        if (!result) {
          res.send("Не верный пароль");
        } else {
            let token=jwt.sign({id:r[0].id},privKey,)
            res.cookie('token',token)
            res.send("Успешная авторизация");
        }
      });
    }
  });
});



//Страница для авторизированых пользователей

app.get("/", (req, res) => {
  try {
    jwt.verify(req.cookies.token, privKey, (err, decoded) => {
      if (decoded) {
        res.send("Доступ открыт");
      } else {
        res.send("Доступ запрещен");
      }
    });
  } catch (err) {
    console.log(err);
  }
});



app.get('/test',(req,res)=>{
res.json('hello')
})

//text