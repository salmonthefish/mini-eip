package com.pa.miniEip.service;

import com.pa.miniEip.dao.AnswerRepository;
import com.pa.miniEip.dao.FormRepository;
import com.pa.miniEip.model.Answer;
import com.pa.miniEip.model.Question;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerDAO;

    @Autowired
    private FormRepository formDAO;

    public List<Answer> getAnswersForFormId(ObjectId formId) {
        List<Answer> answers = new ArrayList<>();
        List<Question> questions = formDAO.findById(formId).getQuestions();

        for (Question question : questions) {
            answers.addAll(answerDAO.findAnswersByQuestionId(question.getId()));
        }

        return answers;
    }
}