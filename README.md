<div align='center'>

# skillX

A skill exchange platform for [peer to peer learning](https://whatfix.com/blog/peer-to-peer-learning/).

</div>

## Features

### Server

**Libs and architecture**

- zod for param validation
- formatted responses
- global error handler
- Redis for user online status tracking
- socket.io for real-time notifications
- db: drizzle + pg + indexing
- db migration drizzle
- bcrypt for password hashing
- clean service based architecture
- DB caching (upcoming)

**Modules**

- Auth + jwt +cookies
- Profile management
- Skill management
- Session request
- Notifications - real time and stored
- Session + video conferencing from scratch(in-progress)
- Points service (upcoming)

### UI

- Login and Register pages
- Landing page
- Video conference page (in-progress)

---

## Run Locally

```shell
#clone the repo
git clone <repo-url>
cd <project-folder-name>

# run server
cd server
npm install && npm run dev

# run ui in another terminal
cd ../ui
npm install && npm run dev
```


---

<div align='center'>

### Feel free to contribute to this project! :)

</div>
