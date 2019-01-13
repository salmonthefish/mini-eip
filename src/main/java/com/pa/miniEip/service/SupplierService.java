package com.pa.miniEip.service;

import com.pa.miniEip.dao.SupplierRepository;
import com.pa.miniEip.model.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierDAO;

    public List<Supplier> getAllSuppliers() {
        return supplierDAO.findAll();
    }
}