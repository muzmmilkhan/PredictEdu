# PredictEdu frontend

A small React and Vite interface for the FastAPI prediction service.

## Run locally

Start the backend from the `backend` directory:

```sh
fastapi dev main.py
```

Then start the frontend:

```sh
npm install
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8000` during development.
For a deployed frontend, set `VITE_API_URL` to the public backend URL before
building.
