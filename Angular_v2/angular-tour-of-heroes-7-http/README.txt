compile error 발생

Cannot find module 'angular-in-memory-web-api'

=> package.json의 'dependencies'에 아래의 항목을 추가
"angular-in-memory-web-api": "^0.2.0"

그리고
npm install

수행(ng serve) 해 보면 angular-in-memory-web-api 관련 compile error는 발생하지 않는다
