from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
import uvicorn

from database import get_db, engine
import models, schemas, crud, auth

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AURO Voice Logger API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = auth.verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user

# ─── AUTH ────────────────────────────────────────────────
@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "name": user.name, "branch": user.branch.name if user.branch else None}

@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user

# ─── USERS ───────────────────────────────────────────────
@app.get("/api/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_users(db)

@app.post("/api/users", response_model=schemas.UserOut)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if crud.get_user_by_login(db, payload.login_id):
        raise HTTPException(status_code=400, detail="Login ID already exists")
    return crud.create_user(db, payload)

@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user = crud.update_user(db, user_id, payload)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Deleted"}

# ─── BRANCHES ────────────────────────────────────────────
@app.get("/api/branches", response_model=list[schemas.BranchOut])
def list_branches(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_branches(db)

@app.post("/api/branches", response_model=schemas.BranchOut)
def create_branch(payload: schemas.BranchCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_branch(db, payload)

@app.put("/api/branches/{branch_id}", response_model=schemas.BranchOut)
def update_branch(branch_id: int, payload: schemas.BranchCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    branch = crud.update_branch(db, branch_id, payload)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@app.delete("/api/branches/{branch_id}")
def delete_branch(branch_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_branch(db, branch_id):
        raise HTTPException(status_code=404, detail="Branch not found")
    return {"message": "Deleted"}

# ─── DEALERS ─────────────────────────────────────────────
@app.get("/api/dealers", response_model=list[schemas.DealerOut])
def list_dealers(branch_id: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_dealers(db, branch_id)

@app.post("/api/dealers", response_model=schemas.DealerOut)
def create_dealer(payload: schemas.DealerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_dealer(db, payload)

@app.put("/api/dealers/{dealer_id}", response_model=schemas.DealerOut)
def update_dealer(dealer_id: int, payload: schemas.DealerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    dealer = crud.update_dealer(db, dealer_id, payload)
    if not dealer:
        raise HTTPException(status_code=404, detail="Dealer not found")
    return dealer

@app.delete("/api/dealers/{dealer_id}")
def delete_dealer(dealer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_dealer(db, dealer_id):
        raise HTTPException(status_code=404, detail="Dealer not found")
    return {"message": "Deleted"}

# ─── CLIENTS ─────────────────────────────────────────────
@app.get("/api/clients", response_model=list[schemas.ClientOut])
def list_clients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_clients(db)

@app.post("/api/clients", response_model=schemas.ClientOut)
def create_client(payload: schemas.ClientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_client(db, payload)

@app.put("/api/clients/{client_id}", response_model=schemas.ClientOut)
def update_client(client_id: int, payload: schemas.ClientCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = crud.update_client(db, client_id, payload)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.delete("/api/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Deleted"}

# ─── SIP LINES ───────────────────────────────────────────
@app.get("/api/sip-lines", response_model=list[schemas.SIPLineOut])
def list_sip_lines(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_sip_lines(db)

@app.post("/api/sip-lines", response_model=schemas.SIPLineOut)
def create_sip_line(payload: schemas.SIPLineCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_sip_line(db, payload)

@app.put("/api/sip-lines/{sip_id}", response_model=schemas.SIPLineOut)
def update_sip_line(sip_id: int, payload: schemas.SIPLineCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    sip = crud.update_sip_line(db, sip_id, payload)
    if not sip:
        raise HTTPException(status_code=404, detail="SIP line not found")
    return sip

@app.delete("/api/sip-lines/{sip_id}")
def delete_sip_line(sip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_sip_line(db, sip_id):
        raise HTTPException(status_code=404, detail="SIP line not found")
    return {"message": "Deleted"}

# ─── CALL LOGS ───────────────────────────────────────────
@app.get("/api/calls", response_model=list[schemas.CallLogOut])
def list_calls(
    dealer_id: Optional[int] = None,
    branch_id: Optional[int] = None,
    call_type: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud.get_calls(db, dealer_id, branch_id, call_type, date_from, date_to)

@app.post("/api/calls", response_model=schemas.CallLogOut)
def create_call(payload: schemas.CallLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.create_call(db, payload)

# ─── DASHBOARD STATS ─────────────────────────────────────
@app.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_dashboard_stats(db)

@app.get("/api/dashboard/live")
def live_calls(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_live_calls(db)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
