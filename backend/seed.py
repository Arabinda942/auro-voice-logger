"""
Run once to seed the database:
  python seed.py
"""
from database import SessionLocal, engine
import models, auth

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed():
    if db.query(models.User).filter(models.User.login_id == "admin").first():
        print("Already seeded.")
        return

    sip1 = models.SIPLine(label="SIP-1", number="+91 33 4000 1000", status="Active")
    sip2 = models.SIPLine(label="SIP-2", number="+91 22 4000 2000", status="Active")
    db.add_all([sip1, sip2])
    db.flush()

    branches = []
    for bname, bloc in [("Kolkata","West Bengal"),("Mumbai","Maharashtra"),("Delhi","Delhi NCR"),("Chennai","Tamil Nadu"),("Pune","Maharashtra")]:
        b = models.Branch(name=bname, location=bloc, sip_line_id=sip1.id, status="Active")
        db.add(b)
        branches.append(b)
    db.flush()

    admin = models.User(
        name="Super Admin", login_id="admin",
        hashed_password=auth.hash_password("admin123"),
        role="Super Admin", branch_id=None, sip_extension="100",
        email="admin@auro.in", mobile="9000000000", status="Active"
    )
    db.add(admin)

    agent_data = [
        ("Rahul Sharma","rahul","rahul123","101",0),
        ("Amit Roy","amit","amit123","102",0),
        ("Suman Das","suman","suman123","103",1),
        ("Priya Sen","priya","priya123","104",2),
        ("Rakesh Verma","rakesh","rakesh123","105",3),
    ]
    agents = []
    for name, lid, pw, ext, bidx in agent_data:
        u = models.User(
            name=name, login_id=lid,
            hashed_password=auth.hash_password(pw),
            role="Agent", branch_id=branches[bidx].id,
            sip_extension=ext, email=f"{lid}@auro.in",
            mobile=f"9876{ext}000", status="Active"
        )
        db.add(u)
        agents.append((u, bidx, ext))
    db.flush()

    dealers = []
    for i, (u, bidx, ext) in enumerate(agents):
        d = models.Dealer(
            name=u.name, user_id=u.id, branch_id=branches[bidx].id,
            email=u.email, sip_extension=ext,
            priority=(i % 3) + 1, hunt_rings=3, status="Active"
        )
        db.add(d)
        dealers.append(d)
    db.flush()

    for i, d in enumerate(dealers):
        db.add(models.DealerMobile(dealer_id=d.id, mobile=f"9876543{210+i}", label="Primary", priority_order=1, hunt_rings=3))
        db.add(models.DealerMobile(dealer_id=d.id, mobile=f"9876543{220+i}", label="Secondary", priority_order=2, hunt_rings=2))

    clients_data = [
        ("Vikas Sharma","9876543210","UCC001","vikas@email.com"),
        ("Meena Patel","8765432109","UCC002","meena@email.com"),
        ("Arjun Nair","7654321098","UCC003","arjun@email.com"),
        ("Divya Reddy","6543210987","UCC004","divya@email.com"),
        ("Pradeep Kumar","5432109876","UCC005","pradeep@email.com"),
    ]
    for name, mob, ucc, email in clients_data:
        c = models.Client(
            name=name, mobile=mob, ucc_code=ucc, email=email,
            preferred_dealer_id=dealers[0].id, sip_line_id=sip1.id,
            branch_id=branches[0].id, status="Active"
        )
        db.add(c)
    db.flush()

    import random
    from datetime import datetime, timedelta
    for i in range(20):
        dur = random.randint(60, 600)
        st = datetime.utcnow() - timedelta(hours=random.randint(0, 48))
        cl = models.CallLog(
            dealer_id=random.choice(dealers).id,
            customer_number=f"9{random.randint(100000000,999999999)}",
            call_type=random.choice(["Incoming","Outgoing","Incoming"]),
            status=random.choice(["Completed","Completed","Completed","Missed"]),
            start_time=st,
            end_time=st + timedelta(seconds=dur),
            duration_seconds=dur,
            recording_path=f"/recordings/call_{i+1}.wav",
            recording_size_mb=f"{dur//60+1}.{random.randint(1,9)}",
            sip_line_id=sip1.id
        )
        db.add(cl)

    db.commit()
    print("Seeded successfully!")
    print("  Admin login:  admin / admin123")
    print("  Agent login:  rahul / rahul123")

seed()
db.close()
