(function(Question, QuestionType) {

    let _nextId = -1;

    Question.getNextId = function() {
        return _nextId--;
    };

    Question.create = function(questionType) {
        return {
            id: Question.getNextId(),
            text: QuestionType[questionType].defaultText,
            format: QuestionType[questionType].defaultFormat,
            options: []
        };
    };

})(pa.ns('Question'), pa.ns('QuestionType'));