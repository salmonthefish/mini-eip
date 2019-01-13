package com.pa.miniEip.dao;

import com.pa.miniEip.model.Form;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FormRepository extends MongoRepository<Form, String> {

    Form findById(ObjectId id);
}