const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");

const Mentor=require('./models/Mentor');
const Student=require('./models/Student');

require('dotenv').config;

const app=express();
const PORT=4000;
const DB_URL="mongodb+srv://divyaanbalagan28:divyaanbalagan28@backend.0nylckb.mongodb.net/";

app.use(bodyParser.json());

mongoose
    .connect(DB_URL,{})
    .then(()=>console.log("connected to MongoDB"))
    .catch((err)=>console.log("Could not connect to MongoDB",err));

app.post("/mentor",async (req,res)=>{
    try {
        const mentor=new Mentor(req.body);
        await mentor.save();
        res.send(mentor);
    } catch (error) {
        res.status(400).send(error);
    }
})

app.post("/student",async (req,res)=>{
    try {
        const student=new Student(req.body);
        await student.save();
        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
})


app.post("/mentor/:mentorId/assign", async (req, res) => {
    try {
      const mentor = await Mentor.findById(req.params.mentorId);
      const students = await Student.find({ _id: { $in: req.body.students } });
      students.forEach((student) => {
        student.cMentor = mentor._id;
        student.save();
      });
      mentor.students = [
        ...mentor.students,
        ...students.map((student) => student._id),
      ];
      await mentor.save();
      res.send(mentor);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  app.put("/student/:studentId/assignMentor/:mentorId", async (req, res) => {
    try {
      const student = await Student.findById(req.params.studentId);
      const nMentor = await Mentor.findById(req.params.mentorId);
  
      if (student.cMentor) {
        student.pMentor.push(student.cMentor);
      }
  
      student.cMentor = nMentor._id;
      await student.save();
      res.send(student);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  app.get("/mentor/:mentorId/students", async (req, res) => {
    try {
      const mentor = await Mentor.findById(req.params.mentorId).populate(
        "students"
      );
      res.send(mentor.students);
    } catch (error) {
      res.status(400).send(error);
    }
  });

app.get("/student/:studentId/pMentor", async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate("pMentor");
    if (!student.pMentor) {
      return res.status(404).send("Previous mentor is not available for this Student");
    }
    else{
       res.send(student.pMentor)
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
  
  

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})
