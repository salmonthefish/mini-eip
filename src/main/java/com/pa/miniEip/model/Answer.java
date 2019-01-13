package com.pa.miniEip.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

public class Answer {

    @Id
    private ObjectId id;

    private String supplierId;
    private String questionId;
    private String value;

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(String supplierId) {
        this.supplierId = supplierId;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}