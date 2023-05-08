const PostModel = require("../Models/PostModel");
const NotificationModel = require("../Models/NotificationModel")
const crypto = require('crypto')
const sharp = require('sharp')
const { uploadFile, deleteFile, getObjectSignedUrl } = require('../Middlewares/s3');
const UserModel = require("../Models/UserModel");
const ReportModel = require("../Models/ReportModel");
const NotifiCounterModel = require("../Models/NotifiCounterModel");
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

module.exports.upload_post = async (req,res,next)=>{
    try{
      const content = req.body.caption
      const userId = req.body.userId
      const dateAndTime = new Date();
      const status = "Block"
      if(req.file){
        const file = req.file
        const imageName = generateFileName()
        
          const fileBuffer = await sharp(file.buffer)
            .resize({ height: 1080, width: 1920, fit: "contain" })
            .toBuffer()
        
          await uploadFile(fileBuffer, imageName, file.mimetype)
        
          const post = await PostModel.create({
              userId,
              imageName,
              content,
              dateAndTime,
              status
          })
          res.status(201).send(post)
      }else{
        const post = await PostModel.create({
          userId,
          content,
          dateAndTime,
      })
      res.status(201).send(post)
      }
    }catch(err){
        console.log(err);
    }
}

module.exports.getPosts = async (req,res,next)=>{

    const user = req.body.id
    try {
        const post = await PostModel.find({ status: { $ne: 'Unblock' } }).sort({ _id: -1 })

          for (let i = 0; i < post.length; i++) {
            imageUrl = await getObjectSignedUrl(post[i].imageName);
            post[i].imageName = imageUrl
          }

          for (let i=0;i<post.length;i++){
            userName = await UserModel.findById(post[i].userId);
            imageUrl = await getObjectSignedUrl(userName.imageName);
            const check = post[i].likes.includes(user)
            post[i] = {...post[i],name:userName.name,imageUrl:imageUrl,check:check}
          }
        res.send(post)
    } catch (error) {
        console.log(error);
    }
}

module.exports.sharedPost = async (req,res) => {
  
  try {
      const posts = []
      let post = await PostModel.findById(req.body.id)

      imageUrl = await getObjectSignedUrl(post.imageName);
      post.imageName = imageUrl
    
      userName = await UserModel.findById(post.userId);
      imageUrl = await getObjectSignedUrl(userName.imageName);

      posts[0] = {...post,name:userName.name,imageUrl:imageUrl}
        
      res.send(posts)
  } catch (error) {
      console.log(error);
  }
}

module.exports.likePost = async (req,res,next)=>{
  try {
        let value = null
        const userId = req.body.userId;
        const notification = "Liked";
        const post = await PostModel.findById(req.body.postId)
        const senderId = post.userId
        const likedPost = post.likes.find((id)=>id == req.body.userId)
        if(!likedPost){
          post.likes.push(req.body.userId)

          NotificationModel.create({
            userId,
            senderId,
            notification
          })

          await NotifiCounterModel.updateOne(
            { userId: senderId }, 
            { $inc: { counter: 1 }}
          );

          value = {value:true}
          }else{
          post.likes.pull(req.body.userId)
          value = {value:false}
        }
        post.save()
        res.status(201).send({likes:post.likes.length,value})
    } catch (error) {
        console.log(error);
    }
}

module.exports.deletePost = async (req,res,next)=>{
    try{
      let postId = req.body.postId
      const result = await PostModel.deleteOne({ _id: postId });
      res.status(201).json({"id":postId})
    }catch(error){
      console.log(error);
    }
}

module.exports.updatePost = async (req,res,next) =>{
    try{
      await PostModel.updateOne({_id:req.body.postId},{$set:{content:req.body.content}})
      res.status(201).json({id:req.body.postId})
      }catch (error) {
      res.status(500).json(error)
    }
}

module.exports.reportPost = async (req,res,next) => {
  console.log(req.body);
  try {
    const report = await ReportModel.create(
      req.body
    )
    res.status(200).send(report)
  } catch (error) {
    res.status(500).send(error)
  }
}