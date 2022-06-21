let express=require('express')
let mongoose=require('mongoose')

let userSchema=new mongoose.Schema({
    login:String,
    password:String,

},{timestamps:true})

let User = mongoose.model('User',userSchema)
module.exports=User;