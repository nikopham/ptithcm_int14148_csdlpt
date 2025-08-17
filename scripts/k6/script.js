import http from "k6/http";
import { sleep } from "k6";

export const options = { vus: 10, duration: "60s" };

export default function () {
  const r = Math.random();
  if (r < 0.7) {
    http.post(
      "http://localhost:3000/orders/nowal",
      JSON.stringify({
        userId: __VU,
        amount: Math.random() * 100,
        status: "NEW",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "u" + __VU,
        },
      }
    );
  } else if (r < 0.9) {
    http.get("http://localhost:3000/orders/000000000000000000000000");
  } else {
    http.get("http://localhost:3000/orders/000000000000000000000000");
  }
  sleep(0.2);
}
