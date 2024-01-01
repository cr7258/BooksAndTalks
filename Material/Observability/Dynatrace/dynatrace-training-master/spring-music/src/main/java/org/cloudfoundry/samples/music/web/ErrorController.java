package org.cloudfoundry.samples.music.web;

import static java.lang.String.format;

import java.util.List;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/errors")
public class ErrorController {
    private static final Logger logger = LoggerFactory.getLogger(ErrorController.class);
    private List<int[]> junk = new ArrayList<>();

    @RequestMapping(value = "/kill")
    public void kill() {
        logger.info("Forcing application exit");
        System.exit(1);
    }

    @RequestMapping(value = "/fill-heap")
    public void fillHeap() {
        logger.info("Filling heap with junk, to initiate a crash");
        while (true) {
            junk.add(new int[9999999]);
        }
    }

    @RequestMapping(value = "/throw")
    public void throwException() {
        logger.info("Forcing an exception to be thrown");
        throw new NullPointerException("Forcing an exception to be thrown");
    }

    @RequestMapping(value = "/response/{responseCode}")
    public ResponseEntity<String> returnResponse(@PathVariable int responseCode) {
        return new ResponseEntity<>(format("Response with Status Code: %s", responseCode), HttpStatus.valueOf(responseCode));
    }
}