package com.pa.miniEip.dao;

import com.pa.miniEip.model.Supplier;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SupplierRepository extends MongoRepository<Supplier, String> {

}