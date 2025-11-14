export const getQuestionsForQuizInOrder = async (
  client: any,
  quizId: string,
  questionOrder: string[]
) => {
  const queryText = 'SELECT * FROM public.quiz_question WHERE quizId = $1';
  const questionData = await client.query(queryText, [quizId]);

  // Sort the order of questions using the quizDataObject.question_order as reference
  const questionsInOrder: any[] = [];
  if (questionOrder && questionData?.rows) {
    questionOrder.forEach((questionId: string) => {
      const questionFound = questionData.rows.find(
        (dataOne: any) => dataOne.id === questionId
      );
      if (questionFound) {
        questionsInOrder.push(questionFound);
      }
    });
  }
  return questionsInOrder;
};
