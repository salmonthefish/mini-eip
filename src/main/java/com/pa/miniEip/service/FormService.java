package com.pa.miniEip.service;

import com.pa.miniEip.dao.FormRepository;
import com.pa.miniEip.model.Form;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormService {

    @Autowired
    private FormRepository formDAO;

    public List<Form> getAllForms() {
        return formDAO.findAll();
    }

    public Form getForm(ObjectId id) {
        return formDAO.findById(id);
    }

    public Form createForm(Form form) {
        return formDAO.insert(form);
    }

    public Form updateForm(Form form) {
        return formDAO.save(form);
    }

    public void deleteForm(ObjectId id) {
        formDAO.delete(formDAO.findById(id));
    }
}