const express = require("express");
const {
  authenticateRequest,
  isAdmin,
  isAccountActive,
} = require("../Middleware/auth");
const Category = require("../Models/Category");
const Course = require("../Models/Course");
const User = require("../Models/User");
const router = express.Router();
const { imageUpload } = require("../Utils/uploader");
const formidable = require("formidable");
const Rating = require("../Models/Rating");
const Question = require("../Models/Question");

router.post(
  "/details",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    // router.post("/details" , async (req , res , next)=>{
    try {
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        if (err) next(err);
        console.log(files);
        const result = await imageUpload(files?.thumbnail);
        fields.image = result.secure_url;

        const { title, descp, categoryId } = fields;
        if (!title || !descp || !categoryId)
          return res.status(400).json({ err: "Required parameters missing" });
        fields.owner = req.user;
        // fields.owner = categoryId
        const newCourse = await Course.create(fields);
        return res
          .status(200)
          .json({ msg: "Course Details has been created", newCourse });
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    let courses = await Course.aggregate([{ $sample: { size: 40 } }]);
    courses = await Course.populate(courses, {
      path: "ratings owner categoryId",
    });
    courses.forEach((course) => {
      course.owner.password = undefined;
      course.owner.enrolledCourses = undefined;
    });
    return res.status(200).json({ courses: courses });
  } catch (err) {
    next(err);
  }
});

router.get("/created" , authenticateRequest , async (req , res, next)=>{
  try{
    const courses = await Course.find({owner : req.user._id}).populate({
      path: "ratings owner categoryId",
    }).exec();
    return res.status(200).json({courses})
  }catch(err){
    next(err)
  }
})

router.get("/bycat", async (req, res, next) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ err: "Missing parameters" });
    const courses = await Course.find({ categoryId: categoryId })
      .populate("owner")
      .populate("categoryId")
      .populate("ratings")
      .limit(40)
      .exec();

    courses.forEach((course) => {
      course.owner.password = undefined;
      course.owner.enrolledCourses = undefined;
    });
    return res.status(200).json({ courses });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/details/:courseId",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const foundCourse = await Course.findById(req.params.courseId)
        .populate("owner")
        .populate("categoryId")
        .populate("ratings")
        .exec();
      if (!foundCourse)
        return res.status(404).json({ err: "Requested resourse is not found" });
      foundCourse.owner.password = undefined;
      foundCourse.owner.enrolledCourses = undefined;
      //check if the logged in user can access this resource
      //if(foundCourse.owner != req.user._id) return res.status(403).json({err : "You are not allowed to view this resource"});
      return res.status(200).json({ foundCourse });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/details/:courseId",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const foundCourse = await Course.findById(req.params.courseId);
      if (!foundCourse)
        return res.status(404).json({ err: "Requested resource is not found" });
      if (!foundCourse.owner.equals(req.user._id))
        return res
          .status(403)
          .json({ err: "You are not allowed to perform this operation" });
      const updatedCourse = await Course.findByIdAndUpdate(
        req.params.courseId,
        req.body
      );
      return res
        .status(200)
        .json({ msg: "The course has been updated", updatedCourse });
    } catch (err) {
      next(err);
    }
  }
);

//TODO DELETE COURSE

router.post(
  "/category/",
  authenticateRequest,
  isAdmin,
  isAccountActive,
  async (req, res, next) => {
    try {
      const newCategory = await Category.create(req.body);
      return res
        .status(200)
        .json({ msg: "Category created Successfully", newCategory });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/category/", async (req, res, next) => {
  try {
    const categories = await Category.find({});
    return res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
});

// TODO : CATEGORY UPDATE AND DELETE

//Syllabus routes
router.patch(
  "/:courseId/syllabus",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course)
        return res.status(404).json({ err: "Requested course not found" });
      console.log(course.owner, req.user._id);
      if (!course.owner.equals(req.user._id))
        return res
          .status(403)
          .json({ err: "You are not allowed to perform this operation" });
      course.syllabus = req.body.syllabus;
      await course.save();
      return res
        .status(200)
        .json({ msg: "Syllabus has been updated", course: course });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:courseId/syllabus",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course)
        return res.status(404).json({ err: "Requested course was not found" });
      return res.status(200).json({ syllabus: course.syllabus });
    } catch (err) {
      next(err);
    }
  }
);

//Course Content Routes

router.patch(
  "/:courseId/content",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ err: "Course not found" });
      if (!course.owner.equals(req.user._id))
        return res
          .status(403)
          .json({ err: "You are not allowed to perform this operation" });
      course.content = req.body.content;
      await course.save();
      return res
        .status(200)
        .json({ msg: "Course content saved", content: course.content });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:courseId/content", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ err: "Course not found" });
    return res.status(200).json({ content: course.content });
  } catch (err) {
    next(err);
  }
});

//Enroll into courses
router.patch(
  "/:courseId/enroll",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const foundCourse = await Course.findById(req.params.courseId);
      if (!foundCourse)
        return res.status(404).json({ err: "Course not found" });
      const thisUser = await User.findById(req.user._id);
      //ensure not already enrolled
      const alreadyEnrolled = false;
      thisUser.enrolledCourses.forEach((course) => {
        if (course._id.equals(req.params.courseId)) {
          alreadyEnrolled = true;
        }
      });
      if (alreadyEnrolled) {
        return res.status(409).json({ err: "Already enrolled" });
      } else {
        thisUser.enrolledCourses.push(foundCourse._id);
        foundCourse.EnrollmentCount += 1;
        await thisUser.save();
        await foundCourse.save();
        return res.status(200).json({ msg: "Enrolled into course" });
      }
    } catch (err) {
      next(err);
    }
  }
);

//get all courses the user is enrolled in
router.get(
  "/enrolled",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const courses = await Course.find({
        _id: { $in: req.user.enrolledCourses },
      })
        .populate("categoryId")
        .populate("owner")
        .populate("ratings")
        .exec();
      return res.status(200).json({ enrolledCourses: courses });
    } catch (err) {
      next(err);
    }
  }
);

//Ratings routes
router.patch(
  "/:course_id/rate",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.course_id);
      if (!req.query.rate)
        return res.status(400).json({ err: "Required parameters missing" });
      let rate = parseInt(req.query.rate);
      if (rate > 5 || rate < 1)
        return res.status(400).json({ err: "Invalid rate" });
      const aleadyRated = await Rating.find({
        courseId: req.params.course_id,
        userId: req.user._id,
      });

      console.log(aleadyRated);
      if (aleadyRated.length > 0) {
        return res
          .status(409)
          .json({ err: "You have already rated this course" });
      }
      console.log("HIT");
      const rating = await Rating.create({
        rate: rate,
        courseId: req.params.course_id,
        userId: req.user._id,
      });
      course.ratings.push(rating);
      await course.save();
      return res.status(200).json({ msg: "Done. Thankyou for the rating" });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:course_id/rate", async (req, res, next) => {
  try {
    console.log("hit");
    const courseRatings = await Rating.find({
      courseId: req.params.course_id,
    });
    let rating = 0.0;
    for (let i = 0; i < courseRatings.length; i++) {
      console.log(rating);
      rating = (rating + courseRatings[i].rate) / (i + 1);
    }
    return res
      .status(200)
      .json({ overallRate: rating, count: courseRatings.length });
  } catch (err) {
    next(err);
  }
});

//Seach course routes

router.get("/search", async (req, res, next) => {
  try {
    let coursesRes = [];
    const { rating, categoryId, title } = req.query;
    //need atleast title or (both category and rating)
    if (!title && (!categoryId || !rating))
      return res.status(400).json({ err: "Required parameters missing" });
    if (title) {
      coursesRes = await Course.find({
        $text: { $search: title },
      })
        .populate("ratings categoryId owner")
        .exec();
    } else {
      coursesRes = await Course.find({
        categoryId: categoryId,
      })
        .populate("ratings")
        .exec();
    }

    if (!categoryId && !rating)
      return res.status(200).json({ courses: coursesRes });
    //filter by category
    let coursesCat = [];
    if (title) {
      for (let i = 0; i < coursesRes.length; i++) {
        if (coursesRes[i].categoryId.equals(categoryId))
          coursesCat.push(coursesRes[i]);
      }
    } else {
      coursesCat = coursesRes;
    }
    //finding rating for all courses
    coursesCat.forEach((course) => {
      course.rating = 0;
      for (let i = 0; i < course.ratings.length; i++) {
        course.rating = (course.rating + course.ratings[i].rate) / (i + 1);
      }
    });
    coursesRes = [];
    coursesCat.forEach((course) => {
      if (course.rating >= rating) {
        coursesRes.push(course);
      }
    });
    return res.status(200).json({ courses: coursesRes });
  } catch (err) {
    next(err);
  }
});

//discussion
router.post(
  "/:course_id/question",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.course_id);
      if (!course) return res.status(404).json({ err: "Course is not found" });
      const { question } = req.body;
      console.log(question)
      if (!question?.title)
        return res.status(400).json({ err: "Required parameters are missing" });
      question.owner = req.user._id;
      const newQuestion = await Question.create(question);
      course.questions.push(newQuestion);
      await course.save();
      return res.status(200).json({ msg: "Question created" });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/:course_id/question",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const course = await Course.findById(req.params.course_id)
        .populate({path : "questions" , populate : [{path : "owner"} , {path : "answers.owner"}]})
        .exec();
      if (!course) return res.status(404).json({ err: "Course not found" });
      return res.status(200).json({ questions: course.questions });
    } catch (err) {
      next(err);
    }
  }
);

//get question by id
router.get(
  "/:course_id/question/:question_id",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const question = await Question.findById(req.params.question_id).populate("owner").populate("answers.owner").exec();
      if (!question) return res.status(404).json({ err: "Course not found" });
      question.owner.password = undefined
      question.owner.enrolledCourses = undefined
      question.answers.forEach(answer=>{
        answer.owner.password = undefined;
        answer.owner.enrolledCourses = undefined
      })
      return res.status(200).json({ question });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/:course_id/question/:question_id/answer",
  authenticateRequest,
  isAccountActive,
  async (req, res, next) => {
    try {
      const foundQuestion = await Question.findById(req.params.question_id);
      if (!foundQuestion)
        return res.status(404).json({ err: "Question not found" });
      req.body.answer.owner = req.user._id;
      const answer = foundQuestion.answers.push(req.body.answer);
      await foundQuestion.save();
      return res.status(200).json({ msg: "Answer added", answer });
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
