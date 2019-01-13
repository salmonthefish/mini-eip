package com.pa.miniEip.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

public class Supplier {

    @Id
    private ObjectId id;

    private String companyName;
    private String firstName;
    private String lastName;

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}