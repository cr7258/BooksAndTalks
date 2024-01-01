# Exercise: Traversing your Stack


1. Open the "training-shared" environment on the [training-cluster](https://sih939.dynatrace-managed.com/e/5489d3ab-c964-491f-8d9e-16a143eee730) 

2. Find the following host metrics for the `spring-music-training-*` host (or explain why you can not find them):
- Memory limit of the Cloud Foundry application container memory (in GB)
- CPU usage of spring-music application and Diego cell
- Availability of spring-music host

3. Find the following process metrics for the `spring-music-training` process:
- Number of JVM threads
- Command line arguments of the Java process
  - JVM thread stack size

4. Find the following service metrics for the `AlbumController`:
- Number of requests / minute 
- Median response time
- Response time of the slowest 5% requests
- Median SQL response time for transactions
