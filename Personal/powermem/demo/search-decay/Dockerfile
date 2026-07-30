FROM oceanbase/powermem-server:latest

USER root
WORKDIR /app/demo

COPY app.py /app/demo/app.py
COPY static /app/demo/static

RUN mkdir -p /app/logs /app/demo/logs \
    && chown -R powermem:powermem /app/logs /app/demo

USER powermem
ENTRYPOINT []
CMD ["python", "/app/demo/app.py", "--host", "0.0.0.0", "--port", "8080"]
