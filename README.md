
# Logging System for Distributed Databases (MongoDB)
**Môn học:** Cơ sở dữ liệu phân tán  
**Trường:** Học viện Công nghệ Bưu chính Viễn thông (PTIT) – Cơ sở TP.HCM

## Yêu cầu
- Docker & Docker Compose đã cài đặt
- Đã cài đặt Node.js

## Bước chạy dự án

### 1) Cập nhật file hosts (bắt buộc)
Thêm các dòng sau vào file `etc/hosts` để ánh xạ hostname cho các node MongoDB:
`
127.0.0.1 mongo1
127.0.0.2 mongo2
127.0.0.3 mongo3
`
### 2) Các kịch bản logging

#### Nolog
.env
`AUDIT = "0"`
Chạy 1 server dev
`npm run dev`
route trong k6 script
`/orders/nowal`
```
k6 run --summary-export summary_nolog.json ^
  -e BASE_URL=http://localhost:3000 ^
  scripts/k6/script.js

docker compose exec mongo1 mongosh --eval "use app; print('WAL(MB)=',db.app_wal.stats().storageSize/1024/1024); print('CS(MB)=',db.log_entries.stats().storageSize/1024/1024); print('AUD(MB)=',db.audit_logs.stats().storageSize/1024/1024)"
```

#### Audit
.env
`AUDIT = "1"`
Chạy 1 server dev
`npm run dev`
route trong k6 script
`/orders/nowal`
```
k6 run --summary-export summary_audit.json ^
  -e BASE_URL=http://localhost:3000 ^
  scripts/k6/script.js

docker compose exec mongo1 mongosh --eval "use app; print('AUD(MB)=',db.audit_logs.stats().storageSize/1024/1024)"
```

#### Logical
.env
`AUDIT = "0"`
Chạy 2 server dev, cs
1: `npm run dev`
2: `npm run cs`
route trong k6 script
`/orders/nowal`
```
k6 run --summary-export summary_logical.json ^
  -e BASE_URL=http://localhost:3000 ^
  scripts/k6/script.js
docker compose exec mongo1 mongosh --eval "use app; print('CS(MB)=',db.log_entries.stats().storageSize/1024/1024)"
```

#### WAL
.env
`AUDIT = "0"`
Chạy 1 server dev
`npm run dev`
route trong k6 script
`/orders`
```
k6 run --summary-export summary_wal.json ^
  -e BASE_URL=http://localhost:3000 ^
  scripts/k6/script.js

docker compose exec mongo1 mongosh --eval "use app; print('WAL(MB)=',db.app_wal.stats().storageSize/1024/1024)"
```