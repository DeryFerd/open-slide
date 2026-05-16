---
'@open-slide/core': patch
---

Return 400 for malformed JSON payloads and reuse a shared JSON body reader across mutation routes.