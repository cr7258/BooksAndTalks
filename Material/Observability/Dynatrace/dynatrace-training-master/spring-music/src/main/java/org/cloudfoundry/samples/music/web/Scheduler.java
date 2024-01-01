package org.cloudfoundry.samples.music.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@EnableScheduling
@Component
public class Scheduler {

  final RestTemplate template;

  public Scheduler(@Autowired final RestTemplate template) {
    this.template = template;
  }

  @Scheduled(fixedDelay = 120 * 1000)
  public void callExternalService() {
    template.exchange("https://www.google.com", HttpMethod.GET, new HttpEntity<>(new HttpHeaders()), String.class);
    template.exchange("https://www.google.com/maps", HttpMethod.GET, new HttpEntity<>(new HttpHeaders()), String.class);
    template.exchange("https://uaa.cf.eu10.hana.ondemand.com", HttpMethod.GET, new HttpEntity<>(new HttpHeaders()),
            String.class);
    template.exchange("https://api.auditlog.cf.eu10.hana.ondemand.com:8081/audit-log", HttpMethod.GET,
            new HttpEntity<>(new HttpHeaders()), String.class);
  }

}
