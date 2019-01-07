package com.pa.miniEip.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EipController {
    @GetMapping("/sourcingIntel")
    public String sourcing() {
        return "sourcing";
    }

    @GetMapping("/forms")
    public String formBuilder() {
        return "forms";
    }
}
