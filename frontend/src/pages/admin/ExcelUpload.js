// ExcelUpload.js
import React, { useRef } from 'react';
import { toast } from '../../components/Toast';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';

function UploadZone({ label, columns, onUpload }) {
  const ref = useRef();
  const handle = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file.name);
    e.target.value = '';
  };
  return (
    <div className="card">
      <div className="card-header"><FileSpreadsheet size={14} style={{ color: 'var(--gold-2)' }} /><span className="card-title">{label}</span></div>
      <div className="card-body">
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 14, fontFamily: 'var(--font-sans)' }}>
          Required columns: <strong>{columns}</strong>
        </div>
        <div className="upload-zone" onClick={() => ref.current?.click()}>
          <div className="upload-zone-icon"><Upload size={32} /></div>
          <div className="upload-zone-title">Drag Excel file here or click to browse</div>
          <div className="upload-zone-sub">.xlsx or .xls format · Max 10 MB</div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} type="button"><Upload size={13} /> Choose File</button>
          <input type="file" ref={ref} accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handle} />
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-sm"><Download size={12} /> Download Template</button>
        </div>
      </div>
    </div>
  );
}

export default function ExcelUpload() {
  const handleUpload = (name) => {
    toast(`File "${name}" uploaded — processing rows…`);
    setTimeout(() => toast('Import complete! Rows added successfully.'), 1800);
  };
  return (
    <div>
      <div className="two-col">
        <UploadZone label="Import Agent Data" columns="Name, Mobile1, Mobile2, Email, Branch, Priority, HuntRings, Status" onUpload={handleUpload} />
        <UploadZone label="Import Client Data" columns="Name, Mobile, UCCCode, Email, PreferredAgent, SIPLine, Branch, Status" onUpload={handleUpload} />
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Import History</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Date</th><th>File</th><th>Type</th><th>Rows Imported</th><th>Errors</th><th>By</th></tr></thead>
            <tbody>
              <tr><td>25 Jun 2026 10:30</td><td>agents_june.xlsx</td><td><span className="pill pill-navy">Agents</span></td><td>48</td><td style={{ color: 'var(--green)' }}>0</td><td>Super Admin</td></tr>
              <tr><td>24 Jun 2026 15:00</td><td>clients_batch2.xlsx</td><td><span className="pill pill-navy">Clients</span></td><td>120</td><td style={{ color: 'var(--red)' }}>3</td><td>Super Admin</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
