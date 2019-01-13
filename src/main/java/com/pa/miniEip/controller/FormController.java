package com.pa.miniEip.controller;

import com.pa.miniEip.model.Answer;
import com.pa.miniEip.model.Form;
import com.pa.miniEip.service.AnswerService;
import com.pa.miniEip.service.FormService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FormController {

    @Autowired
    private FormService formService;

    @Autowired
    private AnswerService answerService;

    @GetMapping(value = "/forms/{id}")
    public ResponseEntity<Form> getForm(@PathVariable ObjectId id) {
        Form form = formService.getForm(id);
        return ResponseEntity.status(HttpStatus.OK).body(form);
    }

    @GetMapping(value = "/forms/{id}/answers")
    public ResponseEntity<List<Answer>> getAnswersForFormId(@PathVariable ObjectId id) {
        List<Answer> answers = answerService.getAnswersForFormId(id);
        return ResponseEntity.status(HttpStatus.OK).body(answers);
    }

    @PostMapping(value = "/forms")
    public ResponseEntity<Form> createForm(@RequestBody Form form) {
        Form createdForm = formService.createForm(form);
        return ResponseEntity.status(HttpStatus.OK).body(createdForm);
    }

    @PutMapping(value = "/forms")
    public ResponseEntity<Form> updateForm(@RequestBody Form form) {
        Form updatedForm = formService.updateForm(form);
        return ResponseEntity.status(HttpStatus.OK).body(updatedForm);
    }

    @DeleteMapping(value = "/forms/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable ObjectId id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }
}