# Exercise: Service analysis views

1. Open the "training-shared" environment on the [training-cluster](https://sih939.dynatrace-managed.com/e/5489d3ab-c964-491f-8d9e-16a143eee730) 

2. Click on the timeframe selector and select the last 90 minutes (by entering -90m).
    
3. Go to the service details page of the `AlbumController` service.

There was unnormal behaviour in this Service in the selected timeframe. Try to find the anomaly and it's root cause if possible down to code level (if you found the class and method name you are done :)). 

If you need further tips, scroll down.

<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>
<br/><br/>

**Tips:**

3. Check Throughput, CPU and failures in the last 2 hours. You should see the anomaly.

4. Check slowest 5% response time. What can you see?
