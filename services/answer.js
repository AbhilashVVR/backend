const {
  addNewAnswer,
  getAnswers,
  getAnswersByQuestionId,
  getAnswersByUserId,
  getAnswersByUserIdAndQuestionId
} = require("../dynamodb/database/answer")

const RegisterAnswer = async (req, res) => {
  try {
    const answers = await getAnswersByUserIdAndQuestionId(req.body.userId, req.body.questionId);
    const getanswers = answers.Items;
    console.log(answers);
    if (getanswers.length === 0) {
      try {
        const answer = await addNewAnswer({
          questionId: req.body.questionId,
          grade: req.body.grade,
          level: req.body.level,
          userId: req.body.userId,
          gameId: req.body.gameId,
          answer: req.body.answer
        });
        res.json(answer);
      } catch (err) {
        res.json({ message: err });
      }
    }
    res.json({ message: "Question ALready Answered", status: 400 });

  } catch (err) {
    res.json({ message: err });
  }
}

const GetAnswersByQuestionId = async (req, res) => {
  try {
    const answer = await getAnswersByQuestionId(req.params.questionId);
    res.json(answer);
  } catch (err) {
    res.json({ message: err });
  }

}

const GetAnswersByUserId = async (req, res) => {
  try {
    const answer = await getAnswersByUserId(req.params.userId);
    res.json(answer);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetAnswersByUserIdAndQuestionId = async (req, res) => {
  try {
    const answer = await getAnswersByUserIdAndQuestionId(req.params.userId, req.params.questionId);
    res.json(answer);
  } catch (err) {
    res.json({ message: err });
  }
}

module.exports = { RegisterAnswer, GetAnswersByQuestionId, GetAnswersByUserId, GetAnswersByUserIdAndQuestionId }