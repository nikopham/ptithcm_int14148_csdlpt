import json, os
import matplotlib.pyplot as plt

def read(path):
    with open(path, encoding="utf-8") as f:
        metrics = json.load(f)["metrics"]

    dur_key = "http_req_duration{expected_response:true}" if "http_req_duration{expected_response:true}" in metrics else "http_req_duration"
    dur = metrics[dur_key]

    p95 = dur.get("p(95)")
    if p95 is None and "percentiles" in dur:
        p95 = dur["percentiles"]["p(95)"]

    if "http_reqs" in metrics and "rate" in metrics["http_reqs"]:
        rps = metrics["http_reqs"]["rate"]
    else:
        rps = metrics["iterations"]["rate"]

    return float(p95), float(rps)

labels = ["NoLog","Audit","Logical","WAL"]
files  = ["summary_nolog.json","summary_audit.json","summary_logical.json","summary_wal.json"]

p95s, rpss = [], []
for f in files:
    if not os.path.exists(f):
        raise FileNotFoundError(f"Không tìm thấy file: {f} (đã dùng --summary-export chưa?)")
    p95, rps = read(f)
    p95s.append(p95)
    rpss.append(rps)

# Biểu đồ p95
plt.bar(labels, p95s)
plt.title("P95 latency (ms)")
plt.ylabel("ms")
plt.tight_layout()
plt.savefig("p95.png")
plt.close()

# Biểu đồ RPS
plt.bar(labels, rpss)
plt.title("Throughput (RPS)")
plt.ylabel("RPS")
plt.tight_layout()
plt.savefig("rps.png")
plt.close()

print("Done: p95.png, rps.png")
