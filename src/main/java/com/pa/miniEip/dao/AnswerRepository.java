package com.pa.miniEip.dao;

import com.pa.miniEip.model.Answer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AnswerRepository extends MongoRepository<Answer, String> {

    List<Answer> findAnswersByQuestionId(String questionId);
}