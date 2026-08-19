import os

# Port binding for Render or local
port = os.environ.get("PORT", "5001")
bind = f"0.0.0.0:{port}"

# CRITICAL for Render Free Tier (512MB RAM):
# 1 single worker prevents multiple copies of TensorFlow model in memory.
# 4 threads handle concurrent I/O requests smoothly.
workers = 1
threads = 4
worker_class = "gthread"
timeout = 120
keepalive = 5

# Logging to stdout for Render Dashboard
accesslog = "-"
errorlog = "-"
loglevel = "info"
