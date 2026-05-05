"""FastAPI application entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.features.auth.routes import router as auth_router
from app.features.embeddings.routes import router as embeddings_router
from app.features.map.routes import router as map_router
from app.features.matching.routes import router as matching_router
from app.features.thoughts.routes import router as thoughts_router
from app.features.users.routes import router as users_router

app = FastAPI(title="Affinity Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(embeddings_router)
app.include_router(map_router)
app.include_router(matching_router)
app.include_router(thoughts_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {"message": "Affinity backend is running"}
