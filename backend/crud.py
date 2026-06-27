from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import Optional
import models, schemas, auth
from datetime import datetime, date

def get_users(db: Session):
    return db.query(models.User).options(joinedload(models.User.branch)).all()

def get_user_by_login(db: Session, login_id: str):
    return db.query(models.User).filter(models.User.login_id == login_id).first()

def create_user(db: Session, payload: schemas.UserCreate):
    user = models.User(
        name=payload.name, login_id=payload.login_id,
        hashed_password=auth.hash_password(payload.password),
        role=payload.role, branch_id=payload.branch_id,
        sip_extension=payload.sip_extension, email=payload.email,
        mobile=payload.mobile, status=payload.status
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: int, payload: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    for k, v in payload.model_dump(exclude_unset=True, exclude={"password"}).items():
        setattr(user, k, v)
    if payload.password:
        user.hashed_password = auth.hash_password(payload.password)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

def get_branches(db: Session):
    return db.query(models.Branch).options(joinedload(models.Branch.sip_line)).all()

def create_branch(db: Session, payload: schemas.BranchCreate):
    branch = models.Branch(**payload.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

def update_branch(db: Session, branch_id: int, payload: schemas.BranchCreate):
    branch = db.query(models.Branch).filter(models.Branch.id == branch_id).first()
    if not branch:
        return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(branch, k, v)
    db.commit()
    db.refresh(branch)
    return branch

def delete_branch(db: Session, branch_id: int):
    branch = db.query(models.Branch).filter(models.Branch.id == branch_id).first()
    if not branch:
        return False
    db.delete(branch)
    db.commit()
    return True

def get_dealers(db: Session, branch_id: Optional[int] = None):
    q = db.query(models.Dealer).options(
        joinedload(models.Dealer.branch),
        joinedload(models.Dealer.mobiles),
        joinedload(models.Dealer.failover)
    )
    if branch_id:
        q = q.filter(models.Dealer.branch_id == branch_id)
    return q.order_by(models.Dealer.branch_id, models.Dealer.priority).all()

def create_dealer(db: Session, payload: schemas.DealerCreate):
    data = payload.model_dump(exclude={"mobiles"})
    dealer = models.Dealer(**data)
    db.add(dealer)
    db.flush()
    for m in payload.mobiles:
        db.add(models.DealerMobile(dealer_id=dealer.id, **m.model_dump()))
    db.commit()
    db.refresh(dealer)
    return dealer

def update_dealer(db: Session, dealer_id: int, payload: schemas.DealerCreate):
    dealer = db.query(models.Dealer).filter(models.Dealer.id == dealer_id).first()
    if not dealer:
        return None
    for k, v in payload.model_dump(exclude={"mobiles"}, exclude_unset=True).items():
        setattr(dealer, k, v)
    db.query(models.DealerMobile).filter(models.DealerMobile.dealer_id == dealer_id).delete()
    for m in payload.mobiles:
        db.add(models.DealerMobile(dealer_id=dealer_id, **m.model_dump()))
    db.commit()
    db.refresh(dealer)
    return dealer

def delete_dealer(db: Session, dealer_id: int):
    dealer = db.query(models.Dealer).filter(models.Dealer.id == dealer_id).first()
    if not dealer:
        return False
    db.delete(dealer)
    db.commit()
    return True

def get_clients(db: Session):
    return db.query(models.Client).options(
        joinedload(models.Client.branch),
        joinedload(models.Client.preferred_dealer),
        joinedload(models.Client.sip_line)
    ).all()

def create_client(db: Session, payload: schemas.ClientCreate):
    client = models.Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

def update_client(db: Session, client_id: int, payload: schemas.ClientCreate):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(client, k, v)
    db.commit()
    db.refresh(client)
    return client

def delete_client(db: Session, client_id: int):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        return False
    db.delete(client)
    db.commit()
    return True

def get_sip_lines(db: Session):
    return db.query(models.SIPLine).all()

def create_sip_line(db: Session, payload: schemas.SIPLineCreate):
    sip = models.SIPLine(**payload.model_dump())
    db.add(sip)
    db.commit()
    db.refresh(sip)
    return sip

def update_sip_line(db: Session, sip_id: int, payload: schemas.SIPLineCreate):
    sip = db.query(models.SIPLine).filter(models.SIPLine.id == sip_id).first()
    if not sip:
        return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(sip, k, v)
    db.commit()
    db.refresh(sip)
    return sip

def delete_sip_line(db: Session, sip_id: int):
    sip = db.query(models.SIPLine).filter(models.SIPLine.id == sip_id).first()
    if not sip:
        return False
    db.delete(sip)
    db.commit()
    return True

def get_calls(db: Session, dealer_id=None, branch_id=None, call_type=None, date_from=None, date_to=None):
    q = db.query(models.CallLog).options(
        joinedload(models.CallLog.dealer).joinedload(models.Dealer.branch),
        joinedload(models.CallLog.client)
    )
    if dealer_id:
        q = q.filter(models.CallLog.dealer_id == dealer_id)
    if call_type:
        q = q.filter(models.CallLog.call_type == call_type)
    return q.order_by(models.CallLog.start_time.desc()).limit(200).all()

def create_call(db: Session, payload: schemas.CallLogCreate):
    call = models.CallLog(**payload.model_dump())
    db.add(call)
    db.commit()
    db.refresh(call)
    return call

def get_dashboard_stats(db: Session):
    today = date.today()
    total = db.query(func.count(models.CallLog.id)).scalar()
    today_calls = db.query(func.count(models.CallLog.id)).filter(
        func.date(models.CallLog.start_time) == today
    ).scalar()
    missed = db.query(func.count(models.CallLog.id)).filter(
        models.CallLog.status == "Missed",
        func.date(models.CallLog.start_time) == today
    ).scalar()
    avg_dur = db.query(func.avg(models.CallLog.duration_seconds)).filter(
        models.CallLog.status == "Completed"
    ).scalar() or 0
    agents_total = db.query(func.count(models.User.id)).filter(models.User.role == "Agent").scalar()
    branches_total = db.query(func.count(models.Branch.id)).scalar()
    return {
        "total_calls": total,
        "today_calls": today_calls,
        "missed_today": missed,
        "avg_duration_seconds": int(avg_dur),
        "agents_total": agents_total,
        "branches_total": branches_total,
    }

def get_live_calls(db: Session):
    calls = db.query(models.CallLog).filter(
        models.CallLog.status.in_(["Active", "Ringing"])
    ).options(
        joinedload(models.CallLog.dealer).joinedload(models.Dealer.branch),
        joinedload(models.CallLog.client)
    ).all()
    return calls
